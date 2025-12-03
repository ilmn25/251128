import { useState, useRef, useEffect } from "react";

export default function AttachmentPanel() {
  const [items, setItems] = useState([]); // always strings
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch("http://localhost:8000/attachment");
        if (res.ok) {
          setItems(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch attachments", err);
      }
    }
    fetchAll();
  }, []);

  function upload(e) {
    const files = Array.from(e.target.files);
    files.forEach(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("http://localhost:8000/attachment", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const id = await res.json();
        setItems(prev => [id, ...prev]);
      }
    });
  }

  async function remove(id) {
    const res = await fetch("http://localhost:8000/attachment/", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id),
    });
    if (res.ok) {
      setItems(prev => prev.filter(item => item !== id));
    }
  }

  return (
    <div className="section">
      <h3>Attachments</h3>
      <div className="section-list">
        <div className="section-item">
          <button
            onClick={() => fileInputRef.current.click()}
            className="section-input section-input-attachment"
          >
            Upload
          </button>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={upload}
            style={{ display: "none" }}
          />
        </div>

        <div className="attachment-list">
          {items.map(url => {
            // url format: uuid_filename.ext
            const [, rest] = url.split("_");
            const parts = rest.split(".");
            const ext = parts.pop().toLowerCase();
            const name = parts.join(".");

            const isImage = ["png","jpg","jpeg","gif","webp"].includes(ext);
            const isVideo = ["mp4","mov","webm","avi","mkv"].includes(ext);

            return (
              <div key={url} className="section-item attachment-container">
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
                <button onClick={() => remove(url)} className="delete-btn">✖</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
