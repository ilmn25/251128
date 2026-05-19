import { useRef } from "react";
import { Check, FileText, Trash2, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Media({ items, selectedItems, setSelectedItems, onUpload, onDelete }) {
  const fileInputRef = useRef(null);
  const { t } = useTranslation();

  function getItemKey(item) {
    return item.mediaId || item.id || item.url;
  }

  function isSelected(item) {
    const itemKey = getItemKey(item);
    return selectedItems.some(selectedItem => getItemKey(selectedItem) === itemKey);
  }

  async function add(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;
    await onUpload(files);
  }

  function toggle(item) {
    const key = getItemKey(item);
    if (isSelected(item)) {
      setSelectedItems(prev => prev.filter(selectedItem => getItemKey(selectedItem) !== key));
      return;
    }

    setSelectedItems(prev => [item, ...prev]);
  }

  async function remove(item) {
    await onDelete(item);
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => fileInputRef.current?.click()} className="panel2 buttonstyle1 flex centered gap-2">
          <Upload className="w-4 h-4" /> {t("upload")}
        </button>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={add}
          style={{ display: "none" }}
        />
        <p className="text-sm text-neutral-500">{t("media")}</p>
      </div>

      {items.length === 0 ? (
        <div className="panel2 text-sm text-neutral-500">{t("mediaEmpty")}</div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {items.map(item => {
            const ext = (item.ext || item.name?.split(".").pop() || "").toLowerCase();
            const isImage = ["png","jpg","jpeg","gif","webp","jfif","bmp","tiff","tif","svg","heic","heif","ico","raw","psd"].includes(ext);
            const isVideo = ["mp4","mov","webm","avi","mkv","flv","wmv","mpeg","mpg","3gp","m4v","ts","vob"].includes(ext);
            const selected = isSelected(item);

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

                {selected && (
                  <div className="absolute top-2 left-2 rounded bg-emerald-500 px-2 py-1 text-xs text-white">
                    {t("selected")}
                  </div>
                )}

                <button
                  onClick={() => toggle(item)}
                  className={`absolute bottom-2 left-2 rounded px-2 py-1 text-xs ${selected ? "bg-neutral-900 text-white" : "bg-black/50 text-neutral-100 hover:bg-neutral-800"}`}
                >
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {selected ? t("unselect") : t("select")}
                  </span>
                </button>

                <button
                  onClick={() => remove(item)}
                  className="absolute top-2 right-2 p-1 rounded bg-black/50 hover:bg-neutral-800"
                >
                  <Trash2 className="w-4 h-4 text-neutral-300" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}