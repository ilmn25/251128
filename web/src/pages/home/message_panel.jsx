import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

export default function MessagePanel() {
  const [items, setItems] = useState([
    { id: "", text: "" }
  ]);

  async function sync() {
    await fetch("http://localhost:8000/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    });
  }

  function add() {
    const draft = items[0];
    if (!draft.text.trim()) return;

    setItems([ {
      id: "", text: "" },
      { id: Date.now(), text: draft.text.trim() },
      ...items.slice(1) ]);

    sync();
  }

  function update(id, newText) {
    if (id !== items[0].id && !newText.trim()) {
      // remove if empty
      setItems(items.filter(i => i.id !== id));
    } else {
      setItems(items.map(i =>
        i.id === id ? { ...i, text: newText } : i
      ));
    }

    sync();
  }

  return (
    <div className="section">
      <h3>Messages</h3>
      <div className="section-list">
        {items.map((i, idx) => (
          <div key={i.id} className="section-item">
            <TextareaAutosize
              className="section-input section-input-message"
              placeholder={idx === 0 ? "Enter message" : ""}
              value={i.text}
              onChange={e => update(i.id, e.target.value)}
              style={{ resize: "none"}}
              onKeyDown={e => {
                if (idx === 0 && e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  add();
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
