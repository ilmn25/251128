import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Cable, TextSearch} from "lucide-react";

export function ChannelNew() {
  const [id, setId] = useState("");
  const navigate = useNavigate();

  async function submit() {
    if (!id.trim()) return;
    const res = await fetch("http://localhost:8000/channel/new", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({id})
    });

    const data = await res.json();
    if (data.success) {
      navigate("/channel/edit/" + id)
    } else console.error(data.error || "Failed to fetch channel info");
  }

  return (
    <div>
      <div className="panel1 space-y-3 space-x-3">
        <p className="panel1-header">Connection</p>

        <div className="panel2 flex space-x-4 !p-4">
          <Cable className="comment !size-6"></Cable>
          <div className="space-y-2">
            <p>Connect a channel to a composition, and then hit send whenever you want!</p>
          </div>
        </div>

        <input
          className="justify-between panel2 input font-mono"
          placeholder="Enter Channel ID and press Enter..."
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
      </div>

      <button onClick={() => submit()} className={`panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1`}>
        <TextSearch></TextSearch> <p>Next Step</p>
      </button>
    </div>
  );
}