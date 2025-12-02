import '../index.css';
import '../discord.css';
import './home.css';
import ChannelPanel from './home/channel_panel.jsx';
import MessagePanel from './home/message_panel.jsx';

export default function Home() {
  // In a real app, you'd keep the token in state/context after login
  const token = "YOUR_DISCORD_TOKEN";

  return (
    <div className="home-container">
      <h2 className="home-title">Discord Posting Automation Tool</h2>

      <div className="section-container">
        <ChannelPanel token={token} />
        <MessagePanel/>

        <div className="server-section">
          <h3 className="section-title">Images</h3>
          <div className="server-list">
            <div className="server-item">
              <input
                className="bar-input"
                placeholder="Enter Image Path"
              />
              <button className="btn">Add</button>
            </div>
          </div>
        </div>

        <div className="server-section">
          <button className="btn">Run</button>
          <button className="btn">Skip</button>
          <button className="btn">Redo</button>
          <button className="btn">Confirm</button>
        </div>
      </div>
    </div>
  );
}
