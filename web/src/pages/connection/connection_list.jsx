import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {PencilRuler, Cable, ArrowBigRightDash} from "lucide-react";
import {toast} from "sonner";
import {SERVER_URL} from "../../main.jsx";

export default function ConnectionList() {
  const [items, setItems] = useState();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function get() {
      const res = await fetch(SERVER_URL + "/connection", {
        method: "GET",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        if (data.items.length === 0) navigate("/connection/new")
        else setItems(data.items);
      } else toast.error(data.error)
    }
    get();
  }, [navigate, setItems]);

  async function send(id) {
    setLoading(true);
    const res = await fetch(SERVER_URL + "/send/" + id, {
      method: "POST",
      credentials: "include"
    });
    const data = await res.json();
    if (data.success) toast.success("Message Sent");
    else toast.error(data.error);
    setLoading(false);
  }

  if (!items) return <></>

  return (
    <>
      {loading &&
        <div className="overlay">
          {/*<p className="panel1-header flex items-center justify-center">Sending, please wait...</p>*/}
        </div>
      }

      {items.map((p) => (
        <ConnectionListItem key={p.id} {...p} send={send}/>
      ))}

      <button
        onClick={() => navigate("/connection/new")}
        className="panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1"
      >
        <Cable/> <p>New Connection</p>
      </button>
    </>
  );
}

function ConnectionListItem({ id, channel, message, send }) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="panel1 flex content-between centered gap-3 !py-0">
        <div className="w-full">
          <p className="panel1-header">Send to {channel}</p>
          <p className="comment !text-neutral-300 font-bold">{message}</p>
          <p className="comment">ID: {id}</p>
        </div>

        <div className="my-5 space-y-3 max-w-50 w-full">
          <button
            type="button"
            onClick={() => navigate("/connection/edit/" + id)}
            className="panel2 buttonstyle2 w-full flex centered space-x-1"
          >
            <PencilRuler /> <p>Edit</p>
          </button>
          <button
            type="button"
            onClick={() => send(id)}
            className="panel2 buttonstyle4 w-full flex centered space-x-1"
          >
            <ArrowBigRightDash/> <p>Send</p>
          </button>
        </div>
      </div>
    </div>
  );
}