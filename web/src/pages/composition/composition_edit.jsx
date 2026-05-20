import '../../index.css';

import {SaveIcon, Shuffle, Hash, CopyPlus, Trash, Eye, RefreshCw} from "lucide-react";
import Message from './message.jsx';
import Attachment from "./attachment.jsx";
import Media from "./media.jsx";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import Cookies from "js-cookie";
import {toast} from "sonner";
import {API_URL} from "../../main.jsx";
import { useTranslation } from "react-i18next";

function DiscordAttachmentGrid({ attachments }) {
  if (!attachments || attachments.length === 0) return null;

  const count = attachments.length;

  const renderItem = (item, className = "", imgClassName = "object-cover") => {
    const isImage = item.url && ["png","jpg","jpeg","gif","webp"].some(e => 
      (item.url || "").toLowerCase().endsWith(e) || (item.ext || "").toLowerCase().includes(e)
    );

    return (
      <div className={`rounded-md overflow-hidden bg-neutral-800 border border-neutral-700 flex items-center justify-center relative ${className}`}>
        {item.url ? (
          isImage ? (
            <img src={item.url} alt="Preview" className={`w-full h-full ${imgClassName}`} />
          ) : (
            <div className="p-2 flex flex-col items-center">
              <Hash className="w-4 h-4 text-neutral-500 mb-1" />
              <span className="text-[10px] text-neutral-400 truncate max-w-full px-1">{item.name}</span>
            </div>
          )
        ) : (
          <div className="p-4 bg-neutral-800 animate-pulse w-full h-full"></div>
        )}
      </div>
    );
  };

  if (count === 1) {
    return <div className="mt-2 w-full max-w-md">{renderItem(attachments[0], "h-auto", "object-contain")}</div>;
  }

  if (count === 2) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-1 aspect-[2/1] w-full max-w-lg">
        {renderItem(attachments[0], "h-full")}
        {renderItem(attachments[1], "h-full")}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="mt-2 grid grid-cols-3 grid-rows-2 gap-1 aspect-[3/2] w-full max-w-lg">
        <div className="col-span-2 row-span-2">
          {renderItem(attachments[0], "h-full")}
        </div>
        <div className="col-span-1 row-span-1">
          {renderItem(attachments[1], "h-full")}
        </div>
        <div className="col-span-1 row-span-1">
          {renderItem(attachments[2], "h-full")}
        </div>
      </div>
    );
  }

  if (count === 4) {
    return (
      <div className="mt-2 grid grid-cols-2 grid-rows-2 gap-1 aspect-square w-full max-w-lg">
        {attachments.map((att, idx) => renderItem(att, "h-full"))}
      </div>
    );
  }

  if (count === 5) {
    return (
      <div className="mt-2 grid grid-cols-6 grid-rows-2 gap-1 aspect-[3/2] w-full max-w-lg">
        <div className="col-span-3 row-span-1">{renderItem(attachments[0], "h-full")}</div>
        <div className="col-span-3 row-span-1">{renderItem(attachments[1], "h-full")}</div>
        <div className="col-span-2 row-span-1">{renderItem(attachments[2], "h-full")}</div>
        <div className="col-span-2 row-span-1">{renderItem(attachments[3], "h-full")}</div>
        <div className="col-span-2 row-span-1">{renderItem(attachments[4], "h-full")}</div>
      </div>
    );
  }

  if (count === 6) {
    return (
      <div className="mt-2 grid grid-cols-3 grid-rows-2 gap-1 aspect-[3/2] w-full max-w-lg">
        {attachments.map((att, idx) => (
          renderItem(att, "h-full")
        ))}
      </div>
    );
  }

  if (count === 7) {
    return (
      <div className="mt-2 grid grid-cols-3 grid-rows-10 gap-1 aspect-[3/5] w-full max-w-lg">
        <div className="col-span-3 row-span-4">
          {renderItem(attachments[0], "h-full")}
        </div>
        {attachments.slice(1, 7).map((att, idx) => (
          <div key={idx} className="col-span-1 row-span-2">
            {renderItem(att, "h-full")}
          </div>
        ))}
      </div>
    );
  }

  if (count === 8) {
    return (
      <div className="mt-2 grid grid-cols-4 grid-rows-2 gap-1 aspect-[2/1] w-full max-w-lg">
        {attachments.map((att, idx) => (
          renderItem(att, "h-full")
        ))}
      </div>
    );
  }

  if (count === 9) {
    return (
      <div className="mt-2 grid grid-cols-3 grid-rows-3 gap-1 aspect-square w-full max-w-lg">
        {attachments.map((att, idx) => renderItem(att, "h-full", idx))}
      </div>
    );
  }

  if (count >= 10) {
    return (
      <div className="mt-2 grid grid-cols-3 grid-rows-4 gap-1 aspect-[3/4] w-full max-w-lg">
        <div className="col-span-3 row-span-1">
          {renderItem(attachments[0], "h-full")}
        </div>
        {attachments.slice(1, 10).map((att, idx) => (
          <div key={idx} className="col-span-1 row-span-1">
            {renderItem(att, "h-full")}
          </div>
        ))}
      </div>
    );
  }

  return null;
}

export default function CompositionEdit() {
  const navigate = useNavigate();
  const {compositionId} = useParams();
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [media, setMedia] = useState([]);
  const [randomize, setRandomize] = useState(false);
  const [count, setCount] = useState(1);
  const [profile, setProfile] = useState(null);
  const [previewData, setPreviewData] = useState({ message: "", attachments: [] });
  const { t } = useTranslation();

  useEffect(() => {
    function updatePreview() {
      if (!messages || messages.length === 0) {
        setPreviewData({ message: "", attachments: [] });
        return;
      }

      const msg = messages[Math.floor(Math.random() * messages.length)] || "";
      let atts = [];
      if (attachments && attachments.length > 0) {
        const selectedCount = Math.min(count, attachments.length);
        if (randomize) {
          atts = [...attachments].sort(() => 0.5 - Math.random()).slice(0, selectedCount);
        } else {
          atts = attachments.slice(0, selectedCount);
        }
      }
      setPreviewData({ message: msg, attachments: atts });
    }

    updatePreview();
    // We only want to update automatically when the base data changes meaningfully
  }, [messages.length, attachments.length, count, randomize]);

  const regeneratePreview = () => {
    if (!messages || messages.length === 0) return;
    const msg = messages[Math.floor(Math.random() * messages.length)] || "";
    let atts = [];
    if (attachments && attachments.length > 0) {
      const selectedCount = Math.min(count, attachments.length);
      if (randomize) {
        atts = [...attachments].sort(() => 0.5 - Math.random()).slice(0, selectedCount);
      } else {
        atts = attachments.slice(0, selectedCount);
      }
    }
    setPreviewData({ message: msg, attachments: atts });
  };

  useEffect(() => {
    async function loadComposition() {
      if (!compositionId) {
        return;
      }

      const res = await fetch(API_URL + "/composition/" + compositionId, {
        method: "GET",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || t("toastFetchError"));
        navigate("/composition");
        return;
      }

      setMessages(data.item.messages);
      setAttachments(data.item.attachments);
      setRandomize(data.item.randomize);
      setCount(data.item.count);
    }

    async function loadMedia() {
      const res = await fetch(API_URL + "/attachment/media", {
        method: "GET",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
      });

      const data = await res.json();
      if (data.success) {
        setMedia(data.items);
      }
    }

    async function loadProfile() {
      const res = await fetch(API_URL + "/profile", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        const currentProfileId = Cookies.get("profile");
        const found = data.items.find(p => p.id === currentProfileId);
        if (found) setProfile(found);
      }
    }

    loadComposition();
    loadMedia();
    loadProfile();
  }, [compositionId, navigate, t]);

  async function submit(saveAs) {
    const attachmentsNew = await Promise.all(
      attachments.map(async ({ file, ...rest }) =>
        file ? { ...rest, ...(await upload(file)) } : rest
      )
    );

    const res = await fetch(API_URL + "/composition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        compositionId: saveAs ? "" : compositionId,
        messages,
        attachments : attachmentsNew,
        randomize,
        count
      })
    });

    const data = await res.json();
    if (data.success) {
      toast.success(t("toastCompositionSaved"));
      navigate("/composition");
    } else {
      setAttachments(attachmentsNew);
      toast.error(data.error || t("toastCompositionError"));
    }

    async function upload(file) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(API_URL + "/attachment", {
        method: "POST",
        credentials: "include",
        body: formData
      });
      const data = await res.json();
      return data.item;
    }
  }

  async function uploadMedia(files) {
    const uploadedItems = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(API_URL + "/attachment", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.item) {
        uploadedItems.push(data.item);
      }
    }

    if (uploadedItems.length > 0) {
      setMedia(prev => [...uploadedItems, ...prev]);
      setAttachments(prev => [...uploadedItems, ...prev]);
    }
  }

  async function deleteMedia(item) {
    const res = await fetch(API_URL + "/attachment/media/" + item.mediaId, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();
    if (data.success) {
      setMedia(prev => prev.filter(mediaItem => mediaItem.mediaId !== item.mediaId));
      setAttachments(prev => prev.filter(attachment => (attachment.mediaId || attachment.url) !== (item.mediaId || item.url)));
      return;
    }

    toast.error(data.error || t("toastDeleteError"));
  }

  async function Delete() {
    if (!window.confirm(t("confirmDeleteComposition"))) return;
    const res = await fetch(API_URL + "/composition/" + compositionId, {
      method: "DELETE",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
    });

    const data = await res.json();
    if (data.success) {
      toast.success(t("toastDeleteSuccess"));
      navigate("/composition");
    } else {
      toast.error(data.error);
    }
  }

  return (
    <div>
      <div className="panel1 space-y-3">
        <p className="panel1-header">{t("composition")}</p>
        <p className="panel1-subheader">{t("messages")}</p>
        <Message items={messages} setItems={setMessages} />
        <p className="panel1-subheader">{t("attachments")}</p>
        <div className="flex gap-3">
          <button onClick={() => setRandomize(!randomize)} className={`panel2 flex space-x-2 ${randomize? "buttonstyle4" : "buttonstyle2"}`}>
            <Shuffle /> <p>{t("randomizeAttachments")}</p>
          </button>
          <button onClick={() => setCount(count + 1 > 10? 0 : count + 1)} className="panel2 flex space-x-2 buttonstyle1">
            <Hash /> <p>{count} {t("attachments")}</p>
          </button>
        </div>
        <Attachment items={attachments} setItems={setAttachments} />
        <p className="panel1-subheader">{t("media")}</p>
        <Media
          items={media}
          selectedItems={attachments}
          setSelectedItems={setAttachments}
          onUpload={uploadMedia}
          onDelete={deleteMedia}
        />
        
        <p className="panel1-subheader mt-6">{t("preview")}</p>
        <div className="panel2 bg-neutral-900/50 space-y-4 max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-neutral-400">
              <Eye className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-semibold">{t("discordPreview")}</span>
            </div>
            <button 
              onClick={regeneratePreview}
              className="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-400 hover:text-white"
              title={t("regenerate")}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div className="flex-grow space-y-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sky-400">{profile ? profile.username : "Selfbot"}</span>
                <span className="text-xs text-neutral-500">Today at 12:00 PM</span>
              </div>
              <div className="text-sm whitespace-pre-wrap break-all">
                {previewData.message ? previewData.message : <span className="text-neutral-600 italic">{t("noMessageContent")}</span>}
              </div>
              <DiscordAttachmentGrid attachments={previewData.attachments} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => submit(false)} className="panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1">
          <SaveIcon /> <p>{t("save")}</p>
        </button>

        {compositionId && <>
          <button onClick={() => submit(true)} className="panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1">
            <CopyPlus /> <p>{t("saveAsNew")}</p>
          </button>
          <button onClick={Delete} className="panel2 buttonstyle5 w-50 !my-5 flex centered space-x-1">
            <Trash /> <p>{t("delete")}</p>
          </button>
        </>}
      </div>
    </div>
  );
}
