import { useState } from "react";

export default function ChannelPanel() {
  const [channelId, setChannelId] = useState("");
  const [channels, setChannels] = useState([]);

  async function find() {
    if (!channelId.trim()) return;

    try {
      const res = await fetch("http://localhost:8000/channel_info", {
        method: "POST",
        credentials: "include",   // must be here
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel_id: channelId
        })
      });

      const data = await res.json();
      if (data.info) {
        setChannels([{ id: channelId, name: data.info }, ...channels]);
        setChannelId("");
      } else {
        alert(data.error || "Failed to fetch channel info");
      }
    } catch (err) {
      console.error(err);
      alert("Request failed");
    }
  }

  function remove(id) {
    setChannels(channels.filter(c => c.id !== id));
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
                find();
              }
            }}
          />
        </div>
        {channels.map(ch => (
          <div key={ch.id} className="section-item">
            <span className="section-title">{ch.name}</span>
            <button className="btn" onClick={() => remove(ch.id)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
