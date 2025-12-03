import '../index.css';

import LoginPanel from './home/token_panel.jsx';
import ChannelPanel from './home/channel_panel.jsx';
import MessagePanel from './home/message_panel.jsx';
import AttachmentPanel from "./home/attachment_panel.jsx";

export default function Home() {
  return (
    <div className="home-container">
      <h2 className="home-title">Discord Posting Automation Tool</h2>

      <LoginPanel/>
      <MessagePanel/>
      <div className="section-container">
        <ChannelPanel/>
        <AttachmentPanel/>

        <div className="section">
          <h3>Run</h3>
          <div className="section-list">
            <button className="btn">Run</button>
            <button className="btn">Skip</button>
            <button className="btn">Redo</button>
            <button className="btn">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
}
