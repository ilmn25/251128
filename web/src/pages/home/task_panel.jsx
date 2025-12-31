import { useState } from "react";

export default function AttachmentPanel() {
  const [count, setCount] = useState(9);
  const [action, setAction] = useState("Start");

  const [channel, setChannel] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);

  async function get(task) {
    const res = await fetch("http://localhost:8000/task/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "task": task,
        "attachment_count": count
      }),
    });
    const data = await res.json();
    if (data.item === null) {
      setChannel("");
      setMessage("");
      setAttachments([]);
      setAction("Start");
      return;
    }
    setChannel(data.item)
    setMessage(data.message)
    setAttachments(data.attachments)
    setAction("Send")
  }

  async function post() {
    setAction("Sending...")
    
    await fetch("http://localhost:8000/task/post", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    return get("next")
  }

  return (
    <div className="section">
      <div className="attachment-list">
        <div className="section-list" style={{width:'11em'}}>
          <h5 className="btn">Attachments: {count}</h5>
          <button onClick={() => {{if (count < 10) setCount(count + 1);}}} className="btn">more</button>
          <button onClick={() => {{if (count > 0) setCount(count - 1);}}} className="btn">less</button>
          <br/>
          <button className="btn" onClick={() => {
            if (action === "Start") get("refresh");
            if (action === "Send") post();
          }}>{action}</button>

          {action !== "Start" && (
            <>
              <button className="btn" onClick={() => get("next")}>Skip to Next Channel</button>
              <button className="btn" onClick={() => get("prev")}>Back to Previous Channel</button>
              <button className="btn" onClick={() => get("refresh")}>Randomize Message</button>
              <button className="btn" onClick={() => get("reset")}>Stop Operation</button>
            </>
          )}
        </div>

        {action !== "Start" && (
          <div className="section-list">
              <h1 className="section-input section-input-attachment"
              style={{
                padding: "1em",
                overflowWrap: "anywhere",
                margin:'0',
              }}
              >Sending to {channel}<br/><br/>{message}</h1>

              <div className="attachment-list">
                {attachments.map(url => {
                  // url format: uuid_filename.ext
                  const [, rest] = url.split("_");
                  const parts = rest.split(".");
                  const ext = parts.pop().toLowerCase();
                  const name = parts.join(".");

                  const isImage = [
                    "png","jpg","jpeg","gif","webp","jfif","bmp","tiff","tif",
                    "svg","heic","heif","ico","raw","psd"
                  ].includes(ext);
                  const isVideo = [
                    "mp4","mov","webm","avi","mkv","flv","wmv","mpeg","mpg",
                    "3gp","m4v","ts","vob"
                  ].includes(ext);

                  return (
                    <div key={url} className="section-item">
                      {isImage && (
                        <img
                          src={`http://localhost:8000/attachment/${url}`}
                          alt={name}
                          className="attachment-image"
                        />
                      )}
                      {isVideo && (
                        <video
                          src={`http://localhost:8000/attachment/${url}`}
                          controls
                          className="attachment-image"
                        />
                      )}
                      {!isImage && !isVideo && (
                        <div>
                          <img src="/document.png" alt={name} className="attachment-image" />
                          <p style={{ top: "34%" }} className="file-name">
                            {name.slice(0, 3) + "."}
                          </p>
                          <p style={{ top: "44%" }} className="file-name">
                            {ext}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
        )}
      </div>
    </div>
  );
}
