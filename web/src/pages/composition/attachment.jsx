import { useRef } from "react";
import { FileText, X} from "lucide-react";

export default function Attachment({items, setItems}) {
  const fileInputRef = useRef(null);

  function add(e) {
    const files = Array.from(e.target.files);
    const newItems = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      ext: file.name.split(".").pop().toLowerCase(),
      size: formatSize(file.size),
      file: file,
    }));
    setItems(prev => [...newItems, ...prev]);
  }

  function remove(url) {
    setItems(prev => prev.filter(item => item.url !== url));
    URL.revokeObjectURL(url); // free memoryq
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  }

  return (
    <div className="space-y-4">
      <div className="panel2 buttonstyle1 centered">
        <button onClick={() => fileInputRef.current.click()}>
          Upload
        </button>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={add}
          style={{ display: "none" }}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {items.map(item => {
          const isImage = [
            "png","jpg","jpeg","gif","webp","jfif","bmp","tiff","tif",
            "svg","heic","heif","ico","raw","psd"
          ].includes(item.ext);
          const isVideo = [
            "mp4","mov","webm","avi","mkv","flv","wmv","mpeg","mpg",
            "3gp","m4v","ts","vob"
          ].includes(item.ext);

          return (
            <div key={item.url} className="relative h-40 w-40 aspect-square">
              {isImage ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : isVideo ? (
                <video
                  src={item.url}
                  controls
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="panel2 flex flex-col items-center justify-center space-y-2 rounded-lg w-full h-full">
                  <FileText className="text-neutral-500 w-8 h-8" />
                  <p className="text-xs break-all text-center">{item.name}</p>
                  <p className="text-xs text-neutral-500">{item.size}</p>
                </div>
              )}

              <button
                onClick={() => remove(item.url)}
                className="absolute top-2 right-2 p-1 rounded bg-black/50 hover:bg-neutral-800"
              >
                <X className="w-4 h-4 text-neutral-300"/>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
