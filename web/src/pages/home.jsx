import '../index.css';

import TokenPanel from './home/token_panel.jsx';
import ChannelPanel from './home/channel_panel.jsx';
import MessagePanel from './home/message_panel.jsx';
import AttachmentPanel from "./home/attachment_panel.jsx";
import TaskPanel from "./home/task_panel.jsx";

export default function Home() {


  return (
    <div className="home-container attachment-list">
      <div>
        <div className={"attachment-list"}>
          <div>
            <h2 className="home-title">Discord Posting Automation Tool</h2>
            <p className="comment">
              Discord API wrapper-wrapper made by illu <br/><br/>
              github.com/ilmn25/251128
              Vite React, Fast API, etc<br/> <br/>
            </p>
          </div>
          <TokenPanel/>
        </div>
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
