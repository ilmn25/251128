import '../index.css';

import {SaveIcon} from "lucide-react";
import {useState} from "react";
import Toggle from "../components/Toggle.jsx";

export default function Connection() {
  const [channelId, setChannelId] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [attachmentPerm, setAttachmentPerm] = useState(true);
  const [linkFilter, setLinkFilter] = useState(false);
  const [mediaFilter, setMediaFilter] = useState(false);
  const [compositionId, setCompositionId] = useState("");

  async function lookup(id) {
    if (!id.trim()) return;
    const res = await fetch("http://localhost:8000/connection/lookup", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(id)
    });

    const data = await res.json();
    if (data.success) {
      setChannelId(id)
      setCooldown(data.cooldown)
    } else console.error(data.error || "Failed to fetch channel info");
  }

  async function submit() {
    const res = await fetch("http://localhost:8000/connection/submit", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        "channelId": channelId,
        "cooldown": cooldown,
        "attachmentPerm": attachmentPerm,
        "linkFilter": linkFilter,
        "mediaFilter": mediaFilter,
        "compositionId": setCompositionId,
      })
    });
    const data = await res.json();
    if (!data.success) console.error(data.error || "Failed to fetch channel info");
  }

  return (
    <div>
      <div className="panel1 space-y-3 space-x-3">
        <p className="panel1-header">Connection</p>
        <div className="justify-between">
          <input
            className="panel2 input font-mono"
            placeholder="Enter Channel ID and press Enter..."
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault(); // prevent newline
                lookup(e.target.value);
              }
            }}
          />
        </div>
        <div className="panel2 space-y-3">
          <p className="panel1-subheader">Role Restrictions</p>

          <div className="flex justify-between text-neutral-400">
            <span>Message cooldown</span>
            <span>{cooldown}s</span>
          </div>

          <div className="flex justify-between text-neutral-400">
            <span>Has permissions to send attachments</span>
            <span>{attachmentPerm? "Yes" : "No"}</span>
          </div>

          <p className="panel1-subheader">Server Bot Filters</p>
          <div className="flex justify-between text-neutral-400">
            <span>Has permissions to send attachments</span>
            <Toggle item={mediaFilter} setItem={setMediaFilter}/>
          </div>

          <div className="flex justify-between text-neutral-400">
            <span>Has permissions to send links</span>
            <Toggle item={linkFilter} setItem={setLinkFilter}/>
          </div>

        </div>

        <p className="panel1-subheader">Composition</p>
      </div>

      <button className={`panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1`} >
        <SaveIcon></SaveIcon> <p>Submit</p>
      </button>
    </div>
  );
}
