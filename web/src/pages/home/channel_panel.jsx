import {useEffect, useState} from "react";

export default function ChannelPanel() {
  const [items, setItems] = useState([]);
  const [channelId, setChannelId] = useState("");

  useEffect(() => {
    async function fetchAll() {
      setItems(await (await fetch("http://localhost:8000/channel")).json());
    }
    fetchAll();
  }, []);

  async function sync(data) {
    await fetch("http://localhost:8000/channel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async function add() {
    if (!channelId.trim()) return;

    try {
      const res = await fetch("http://localhost:8000/channel/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(channelId)
      });

      const data = await res.json();
      if (data.info) {
        setItems(() => {
          const newItems = [{ id: channelId, name: data.info }, ...items]
          sync(newItems);
          return newItems;
        });
        setChannelId("");
      } else console.error(data.error || "Failed to fetch channel info");

    } catch (err) {
      console.error(err);
    }
  }

  function remove(id) {
    setItems(prevItems => {
      const newItems = prevItems.filter(c => c.id !== id);
      sync(newItems);
      return newItems;
    });
  }

  return (
    <div className="section">
      <h3>Channels</h3>
      <div className="section-list">
        <div className="section-item">
          <input
            className="section-input section-input-channel"
            placeholder="Enter Channel ID"
            value={channelId}
            onChange={e => setChannelId(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault(); // prevent newline
                add();
              }
            }}
          />
        </div>
        {items.map(item => (
          <div key={item.id} className="section-item section-input-channel">
            <span className="section-title">{item.name}</span>
            <button onClick={() => remove(item.id)} className="absolute-btn">✖</button>
          </div>
        ))}
      </div>
    </div>
  );
}
