import { useState } from "react";

export default function AttachmentPanel() {
  const [count, setCount] = useState(9);

  async function run() {
    return await fetch("http://localhost:8000/run", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(count),
    });
  }

  return (
    <div className="section">
      <h3>Run</h3>

      <div className="section-list">
        <div className="section-subitem">
          <h1 className="comment section-subitem" >Attachments Count: {count}</h1>
          <button onClick={() => {{if (count < 9) setCount(count + 1);}}} className="btn">more</button>
          <button onClick={() => {{if (count > 0) setCount(count - 1);}}} className="btn">less</button>
        </div>

        <button className="btn" onClick={run}>Run</button>
        <button className="btn">Skip</button>
        <button className="btn">Redo</button>
        <button className="btn">Confirm</button>
      </div>
    </div>
  );
}
