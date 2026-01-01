import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {PencilRuler, MessageCirclePlus, Shuffle, Repeat} from "lucide-react";
import {toast} from "sonner";

export default function CompositionList() {
  const [items, setItems] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    async function get() {
      const res = await fetch("http://localhost:8000/composition", {
        method: "GET",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        if (data.items.length === 0) navigate("/composition/new")
        else setItems(data.items);
      } else toast.error(data.error)
    }
    get();
   }, [navigate, setItems]);

  if (!items) return <></>

  return (
    <>
      {items.map((p) => (
        <CompositionListItem key={p.compositionId} {...p} />
      ))}

      <button
        onClick={() => navigate("/composition/new")}
        className="panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1"
      >
        <MessageCirclePlus/> <p>New Composition</p>
      </button>
    </>
  );
}


function CompositionListItem({ compositionId, message, attachmentCount, randomize, count }) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="panel1 flex content-between centered gap-3">
        <div className="w-full">
          <div className="panel1-header flex justify-start gap-2 items-center">
            <p className="">{message}</p>
            {randomize ? (
              <Shuffle className="size-4"/>
            ) : (
              <Repeat className="size-4"/>
            )}
          </div>
          <p className="comment">Select {count} Attachments from {attachmentCount} Files to Send</p>
          <p className="comment">ID: {compositionId}</p>
        </div>

        <div className="my-5 space-y-3 max-w-50 w-full">
          <button
            type="button"
            onClick={() => navigate("/composition/edit/" + compositionId)}
            className="panel2 buttonstyle2 w-full flex centered space-x-1"
          >
            <PencilRuler/> <p>Edit</p>
          </button>
        </div>
      </div>
    </div>
  );
}