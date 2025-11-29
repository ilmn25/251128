import '../index.css';
import '../discord.css';
import './home.css';

export default function Home() {
  const servers = [
    "#General in Fortnite",
    "#General in Apex",
    "#General in Myserver",
    "#General in Fortnite",
    "#General in Apex",
    "#General in Myserver",
    "#General in Fortnite",
    "#General in Apex",
    "#General in Myserver",
    "#General in Fortnite",
    "#General in Apex",
    "#General in Myserver",
    "#General in Fortnite",
    "#General in Apex",
    "#General in Myserver",
    "@someone in DMs"
  ];

  return (
    <div className="home-container">
      <h2 className="home-title">Discord Posting Automation Tool</h2>

      <div className="section-container">
        <div className="server-section">
          <h3 className="section-title">Servers</h3>


          <div className="server-list">
            <div className="server-item">
              <input
                className="bar-input"
                placeholder="Enter Channel ID"
              />
              <button className="btn">Add</button>
            </div>
            {servers.map((srv, idx) => (
              <div key={idx} className="server-item">
                <span className="server-name">{srv}</span>
                <button className="btn">Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div className="server-section">
          <h3 className="section-title">Message</h3>
          <div className="server-list">
            <div className="server-item">
              <input
                className="bar-input"
                placeholder="Enter a Message"
              />
              <button className="btn">Add</button>
            </div>
            {servers.map((srv, idx) => (
              <div key={idx} className="server-item">
                <span className="server-name">{srv}</span>
                <button className="btn">Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div className="server-section">
          <h3 className="section-title">Images</h3>
          <div className="server-list">
            <div className="server-item">
              <input
                className="bar-input"
                placeholder="Enter a Message"
              />
              <button className="btn">Add</button>
            </div>
            {servers.map((srv, idx) => (
              <div key={idx} className="server-item">
                <span className="server-name">{srv}</span>
                <button className="btn">Remove</button>
              </div>
            ))}
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
