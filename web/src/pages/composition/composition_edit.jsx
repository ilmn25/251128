import '../../index.css';

import {SaveIcon, Shuffle, Hash, CopyPlus, Trash} from "lucide-react";
import Message from './message.jsx';
import Attachment from "./attachment.jsx";
import Media from "./media.jsx";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {toast} from "sonner";
import {API_URL} from "../../main.jsx";
import { useTranslation } from "react-i18next";

export default function CompositionEdit() {
  const navigate = useNavigate();
  const {compositionId} = useParams();
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [media, setMedia] = useState([]);
  const [randomize, setRandomize] = useState(false);
  const [count, setCount] = useState(1);
  const { t } = useTranslation();

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

    loadComposition();
    loadMedia();
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
