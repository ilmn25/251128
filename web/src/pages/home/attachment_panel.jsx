import { useState, useRef } from "react";

export default function AttachmentPanel() {
  const [items, setItems] = useState([]);
  const fileInputRef = useRef(null);

  function upload(e) {
    const files = Array.from(e.target.files);
    const newItems = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
    }));
    setItems(prev => [...prev, ...newItems]);
  }

  function deleteAttachment(id) {
    setItems(prev => prev.filter(item => item.id !== id));
  }

  return (
    <div className="section">
      <h3>Attachments</h3>
      <div className="section-list">

        <div className="section-item">
          <button onClick={() => fileInputRef.current.click()} className="section-input section-input-attachment">
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
          {items.map(i => (
            <div key={i.id} className="section-item attachment-container">
              {i.file.type.startsWith("image/") && (
                <img src={i.url} alt={i.file.name} className="attachment-image" />
              )}
              {i.file.type.startsWith("video/") && (
                <video src={i.url} controls className="attachment-image" />
              )}
              {!i.file.type.startsWith("image/") && !i.file.type.startsWith("video/") && (
                <div>
                  <img src="/document.png" alt={i.file.name} className="attachment-image" />
                  <p style={{top: "34%"}} className="file-name">
                    {i.file.name.split(".")[0].slice(0, 3) + "."}
                  </p>
                  <p style={{top: "44%"}} className="file-name">
                    {i.file.name.split(".").pop()}
                  </p>
                </div>
              )}

              <button onClick={() => deleteAttachment(i.id)} className="delete-btn" > ✖ </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
