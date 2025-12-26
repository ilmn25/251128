import '../index.css';

import {SaveIcon} from "lucide-react";
import MessagePanel from './home/message_panel.jsx';
import AttachmentPanel from "./home/attachment_panel.jsx";
import {useState} from "react";

export default function Composition() {
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [randomize, setRandomize] = useState(false);
  const [count, setCount] = useState(1);
  return (
    <div>
      <div className="panel1 space-y-3 space-x-3">
        <p className="panel1-header">Composition</p>
        <p className="panel1-subheader">Messages</p>
        <MessagePanel items={messages} setItems={setMessages} />
        <p className="panel1-subheader">Attachments</p>
        <button onClick={() => setRandomize(!randomize)} className={`panel2 ${randomize? "buttonstyle4" : "buttonstyle2"}`}>Randomize</button>
        <button onClick={() => setCount(count + 1 > 10? 0 : count + 1)} className="panel2 buttonstyle1"> Attachment: {count}</button>
        <AttachmentPanel items={attachments} setItems={setAttachments} />
      </div>

      <button className={`panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1`} >
        <SaveIcon></SaveIcon> <p>Save</p>
      </button>
    </div>
  );
}
