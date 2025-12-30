import '../../index.css';

import {SaveIcon, Shuffle, Hash, CopyPlus } from "lucide-react";
import Message from './message.jsx';
import Attachment from "./attachment.jsx";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";

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
      const res = await fetch("http://localhost:8000/composition/" + compositionId, {
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
        navigate("/composition/new");
        console.error(data.error);
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

    const res = await fetch("http://localhost:8000/composition", {
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
      navigate("/composition");
    } else {
      setAttachments(attachmentsNew);
      console.error(data.error || "Failed to submit composition");
    }

    async function upload(file) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/attachment", {
        method: "POST",
        credentials: "include",
        body: formData
      });
      const data = await res.json();
      return data.url;
    }
  }

  return (
    <div>
      <div className="panel1 space-y-3 space-x-3">
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
      </div>
    </div>
  );
}
