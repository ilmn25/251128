import '../index.css';

import LoginPanel from './home/token_panel.jsx';
import ChannelPanel from './home/channel_panel.jsx';
import MessagePanel from './home/message_panel.jsx';
import AttachmentPanel from "./home/attachment_panel.jsx";
import TaskPanel from "./home/task_panel.jsx";

export default function Home() {


  return (
    <div className="home-container attachment-list">
      <div>
        <h2 className="home-title">Discord Posting Automation Tool</h2>
        <LoginPanel/>
        <MessagePanel/>
        <div className="section-container">
          <ChannelPanel/>
          <AttachmentPanel/>
        </div>
      </div>
      <TaskPanel/>
    </div>
  );
}
