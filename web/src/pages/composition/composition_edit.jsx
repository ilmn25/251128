import '../../index.css';

import {SaveIcon, Shuffle, Hash, CopyPlus, Trash} from "lucide-react";
import Message from './message.jsx';
import Attachment from "./attachment.jsx";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {toast} from "sonner";
import {SERVER_URL} from "../../main.jsx";

export default function CompositionEdit() {
  const navigate = useNavigate();
  const {compositionId} = useParams();
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [randomize, setRandomize] = useState(false);
  const [count, setCount] = useState(1);

  useEffect(() => {
    async function get() {
      if (!compositionId) {
        navigate("/composition/new");
        return;
      }
      const res = await fetch(SERVER_URL + "/composition/" + compositionId, {
        method: "GET",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
      });

      const data = await res.json();
      if (data.success) {
        setMessages(data.item.messages);
        setAttachments(data.item.attachments);
        setRandomize(data.item.randomize);
        setCount(data.item.count);
      } else {
        toast.error(data.error);
        navigate("/composition");
      }
    }
    get();
  }, [compositionId, navigate]);

  async function submit(saveAs) {
    const attachmentsNew = await Promise.all(
      attachments.map(async ({ file, ...rest }) =>
        file ? { ...rest, url: await upload(file) } : rest
      )
    );

    const res = await fetch(SERVER_URL + "/composition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        compositionId: saveAs ? "" : compositionId,
        messages,
        attachments : attachmentsNew,
        randomize,
        count
      })
    });

    const data = await res.json();
    if (data.success) {
      toast.success("Composition saved successfully.");
      navigate("/composition");
    } else {
      setAttachments(attachmentsNew);
      toast.error(data.error || "Failed to submit composition");
    }

    async function upload(file) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(SERVER_URL + "/attachment", {
        method: "POST",
        credentials: "include",
        body: formData
      });
      const data = await res.json();
      return data.url;
    }
  }

  async function Delete() {}

  return (
    <div>
      <div className="panel1 space-y-3">
        <p className="panel1-header">Composition</p>
        <p className="panel1-subheader">Messages</p>
        <Message items={messages} setItems={setMessages} />
        <p className="panel1-subheader">Attachments</p>
        <div className="flex gap-3">
          <button onClick={() => setRandomize(!randomize)} className={`panel2 flex space-x-2 ${randomize? "buttonstyle4" : "buttonstyle2"}`}>
            <Shuffle></Shuffle> <p>Randomize Attachments Order</p>
          </button>
          <button onClick={() => setCount(count + 1 > 10? 0 : count + 1)} className="panel2 flex space-x-2 buttonstyle1">
            <Hash></Hash> <p>{count} Attachments</p>
          </button>
        </div>
        <Attachment items={attachments} setItems={setAttachments} />
      </div>

      <div className="flex gap-3">
        <button onClick={() => submit(false)} className={`panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1`} >
          <SaveIcon></SaveIcon> <p>Save</p>
        </button>
        <button onClick={() => submit(true)} className={`panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1`} >
          <CopyPlus></CopyPlus> <p>Save As New</p>
        </button>
        <button onClick={() => Delete()} className={`panel2 buttonstyle5 w-50 !my-5 flex centered space-x-1`} >
          <Trash></Trash> <p>Delete</p>
        </button>
      </div>
    </div>
  );
}
