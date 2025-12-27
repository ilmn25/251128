import '../index.css';

import {SaveIcon, Shuffle, Hash } from "lucide-react";
import MessagePanel from './home/message_panel.jsx';
import AttachmentPanel from "./home/attachment_panel.jsx";
import {useState} from "react";

export default function Composition() {
  const [id, setId] = useState("");
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [randomize, setRandomize] = useState(false);
  const [count, setCount] = useState(1);

  async function submit() {
    const res = await fetch("http://localhost:8000/composition/submit", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        "id": id,
        "messages": messages,
        "attachments": attachments,
        "randomize": randomize,
        "count": count,
      })
    });
    const data = await res.json();
    if (data.success) {
      setId("");
      setMessages([]);
      setAttachments([]);
      setRandomize(false);
      setCount(1);
    } else console.error(data.error || "Failed to submit composition");
  }

  return (
    <div>
      <div className="panel1 space-y-3 space-x-3">
        <p className="panel1-header">Composition</p>
        <p className="panel1-subheader">Messages</p>
        <MessagePanel items={messages} setItems={setMessages} />
        <p className="panel1-subheader">Attachments</p>
        <div className="flex gap-3">
          <button onClick={() => setRandomize(!randomize)} className={`panel2 flex space-x-2 ${randomize? "buttonstyle4" : "buttonstyle2"}`}>
            <Shuffle></Shuffle> <p>Randomize Attachments Order</p>
          </button>
          <button onClick={() => setCount(count + 1 > 10? 0 : count + 1)} className="panel2 flex space-x-2 buttonstyle1">
            <Hash></Hash> <p>{count} Attachments</p>
          </button>
        </div>
        <AttachmentPanel items={attachments} setItems={setAttachments} />
      </div>

      <button className={`panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1`} >
        <SaveIcon></SaveIcon> <p>Submit</p>
      </button>
    </div>
  );
}
