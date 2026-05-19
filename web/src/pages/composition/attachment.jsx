import { FileText, X } from "lucide-react";
import {useTranslation} from "react-i18next";

export default function Attachment({items, setItems}) {
  const { t } = useTranslation();

  function getItemKey(item) {
    return item.mediaId || item.id || item.url;
  }

  function remove(item) {
    setItems(prev => prev.filter(current => getItemKey(current) !== getItemKey(item)));
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {items.map(item => {
          const ext = (item.ext || item.name?.split(".").pop() || "").toLowerCase();
          const isImage = ["png","jpg","jpeg","gif","webp","jfif","bmp","tiff","tif","svg","heic","heif","ico","raw","psd"].includes(ext);
          const isVideo = ["mp4","mov","webm","avi","mkv","flv","wmv","mpeg","mpg","3gp","m4v","ts","vob"].includes(ext);

          return (
            <div key={getItemKey(item)} className="relative h-40 w-40 aspect-square">
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
                  <p className="text-xs text-neutral-500">{item.sizeBytes ? formatSize(item.sizeBytes) : ""}</p>
                </div>
              )}

              <button
                onClick={() => remove(item)}
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
