import { useState } from "react";
import "../../discord.css";
import "../home.css";

export default function ChannelPanel({ token }) {
  const [channelId, setChannelId] = useState("");
  const [channels, setChannels] = useState([]);

  async function find() {
    if (!channelId.trim()) return;

    try {
      const res = await fetch("http://localhost:8000/channel_info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
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
    <div className="server-section">
      <h3 className="section-title">Channels</h3>
      <div className="server-list">
        <div className="server-item">
          <input
            className="bar-input"
            placeholder="Enter Channel ID"
            value={channelId}
            onChange={e => setChannelId(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // prevent newline
                find();
              }
            }}
          />
        </div>
        {channels.map(ch => (
          <div key={ch.id} className="server-item">
            <span className="server-name">{ch.name}</span>
            <button className="btn" onClick={() => remove(ch.id)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
