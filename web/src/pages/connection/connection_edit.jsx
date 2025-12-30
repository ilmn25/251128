import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {SaveIcon} from "lucide-react";

export default function ConnectionEdit() {
  const navigate = useNavigate();
  const {connectionId} = useParams();
  const [channelId, setChannelId] = useState("");
  const [compositionId, setCompositionId] = useState("");

  useEffect(() => {
    async function get() {
      if (!connectionId) {
        navigate("/connection/new");
        return;
      }
      const res = await fetch("http://localhost:8000/connection/" + connectionId, {
        method: "GET",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
      });

      const data = await res.json();
      if (data.success) {
        setChannelId(data.item.channelId);
        setCompositionId(data.item.compositionId);
      } else {
        navigate("/connection/new");
        console.error(data.error || "Failed to fetch connection info");
      }
    }

    get();
  }, [connectionId, navigate]);


  async function submit() {
    const res = await fetch("http://localhost:8000/connection/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({id: connectionId, channelId, compositionId})
    });
    const data = await res.json();
    if (data.success)
      navigate("/connection");
    else
      console.error(data.error || "Failed to save connection");
  }

  return (
    <div>
      <div className="panel1 space-y-3 space-x-3">
        <p className="panel1-header">Editing Connection</p>
        <p className="comment">ID: {connectionId}</p>

        <div className="panel2 space-y-3 !py-5">
          <p className="panel1-subheader">Linked Channel</p>
          <div className="flex justify-between text-neutral-400">
            <span>Channel</span>
            <span>{channelId}</span>
          </div>

          <p className="panel1-subheader">Linked Composition</p>
          <div className="flex justify-between text-neutral-400">
            <span>Composition ID</span>
            <span>{compositionId}</span>
          </div>
        </div>
      </div>

      <button onClick={() => submit()} className={`panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1`}>
        <SaveIcon/> <p>Submit</p>
      </button>
    </div>
  );
}
