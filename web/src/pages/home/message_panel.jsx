import {useEffect, useState} from "react";
import TextareaAutosize from "react-textarea-autosize";

export default function MessagePanel() {
  const [items, setItems] = useState([{ id: Date.now(), text: "" }]);

  useEffect(() => {
    async function fetchAll() {
      const itemsPrev = await (await fetch("http://localhost:8000/message")).json()
      if (itemsPrev.length > 0)
        setItems(itemsPrev);
    }
    fetchAll();
  }, []);

  async function sync(data) {
    await fetch("http://localhost:8000/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  }

  function add(i) {
    const target = items[i];
    if (!target.text.trim()) return;

    setItems(prevItems => {
      const newItem = { id: Date.now(), text: target.text.trim() };

      const newItems = [
        ...prevItems.slice(0, i + 1),
        newItem,
        ...prevItems.slice(i + 1)
      ];

      sync(newItems);
      return newItems;
    });
  }

  function update(id, newText) {
    setItems(() => {
      let newItems;
      if (id !== items[0].id && !newText.trim())
        // remove if empty
        newItems = items.filter(i => i.id !== id);
      else
        newItems = items.map(i => i.id === id ? { ...i, text: newText } : i);
      sync(newItems);
      return newItems;
    });
  }

  return (
    <div className="section">
      <h3>Messages</h3>
      <div className="section-list">
        {items.map((item, i) => (
          <div key={item.id} className="section-item">
            <TextareaAutosize
              className="section-input section-input-message"
              placeholder={i === 0 ? "Enter message" : ""}
              value={item.text}
              onChange={e => update(item.id, e.target.value)}
              style={{ resize: "none"}}
              onKeyDown={e => {
                if ( e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  add(i);
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
