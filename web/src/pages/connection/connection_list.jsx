import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {PencilRuler, Cable, ArrowBigRightDash} from "lucide-react";

export default function ConnectionList() {
  const [items, setItems] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    async function get() {
      const res = await fetch("http://localhost:8000/connection", {
        method: "GET",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        if (data.items.length === 0) navigate("/connection/new")
        else setItems(data.items);
      } else {
        console.error(data.error);
      }
    }
    get();
  }, [navigate, setItems]);

  if (!items) return <></>

  return (
    <>
      {items.map((p) => (
        <ConnectionListItem key={p.id} {...p} />
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


function ConnectionListItem({ id, channel, message }) {
  const navigate = useNavigate();

  async function send() {
    const res = await fetch("http://localhost:8000/send/" + id, {
      method: "POST",
      credentials: "include"
    });
    const data = await res.json();
    if (data.success) {
      console.log("successfully sent " + id);
    } else {
      console.error(data.error);
    }
  }

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
            onClick={() => send()}
            className="panel2 buttonstyle4 w-full flex centered space-x-1"
          >
            <ArrowBigRightDash/> <p>Send</p>
          </button>
        </div>
      </div>
    </div>
  );
}