import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import "../../discord.css";
import "../home.css";

export default function MessagePanel() {
  const [message, setMessage] = useState("");
  const [items, setItems] = useState([]);

  function add() {
    if (!message.trim()) return;

    const newItem = {
      id: Date.now(),
      text: message.trim(),
    };

    setItems([newItem, ...items]);
    setMessage("");
  }

  function update(id, newText) {
    if (!newText.trim()) {
      // remove if empty
      setItems(items.filter(i => i.id !== id));
    } else {
      setItems(items.map(i =>
        i.id === id ? { ...i, text: newText } : i
      ));
    }
  }

  return (
    <div className="server-section">
      <h3 className="section-title">Messages</h3>
      <div className="server-list">
        <div className="server-item">
          <TextareaAutosize
            className="bar-input"
            placeholder="Enter message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={{ resize: "none"}}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                add();
              }
            }}
          />
        </div>

        {items.map(i => (
          <div key={i.id} className="server-item">
            <TextareaAutosize
              className="bar-input"
              value={i.text}
              onChange={e => update(i.id, e.target.value)}
              style={{ resize: "none"}}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
