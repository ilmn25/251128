import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import Toggle from "../../components/toggle.jsx";
import {SaveIcon, Trash} from "lucide-react";
import {toast} from "sonner";
import {API_URL} from "../../main.jsx";
import { useTranslation } from "react-i18next";

export function ChannelEdit() {
  const navigate = useNavigate();
  const {channelId} = useParams();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [attachmentPerm, setAttachmentPerm] = useState(true);
  const [linkFilter, setLinkFilter] = useState(false);
  const [mediaFilter, setMediaFilter] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchData() {
      if (!channelId) {
        navigate("/channel/new");
        return;
      }
      const res = await fetch(API_URL + "/channel/" + channelId, {
        method: "GET",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
      });

      const data = await res.json();
      if (data.success) {
        setId(data.item.id);
        setName(data.item.name);
        setCooldown(data.item.cooldown);
        setAttachmentPerm(data.item.attachmentPerm);
        setLinkFilter(data.item.linkFilter);
        setMediaFilter(data.item.mediaFilter);
      } else {
        navigate("/channel/new");
        toast.error(data.error || t("toastFetchError"));
      }
    }

    fetchData();
  }, [channelId, navigate, t]);

  async function submit() {
    const res = await fetch(API_URL + "/channel/edit", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({id, linkFilter, mediaFilter})
    });
    const data = await res.json();
    if (data.success) {
      toast.success(t("toastSubmitSuccess"));
      navigate("/channel");
    } else {
      toast.error(data.error || t("toastSubmitError"));
    }
  }

  async function Delete() {
    const res = await fetch(API_URL + "/channel/" + id, {
      method: "DELETE",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
    });

    const data = await res.json();
    if (data.success) {
      toast.success(t("toastDeleteSuccess"));
      navigate("/channel");
    } else {
      toast.error(data.error);
    }
  }

  return (
    <div>
      <div className="panel1 space-y-3">
        <p className="panel1-header">{t("editing")} {name}</p>
        <p className="comment">ID: {channelId}</p>

        <div className="panel2 space-y-3 !py-5">
          <p className="panel1-subheader">{t("roleRestrictions")}</p>

          <div className="flex justify-between text-neutral-400">
            <span>{t("messageCooldown")}</span>
            <span>{cooldown}s</span>
          </div>

          <div className="flex justify-between text-neutral-400">
            <span>{t("attachmentPerm")}</span>
            <span>{attachmentPerm ? t("yes") : t("no")}</span>
          </div>

          <p className="panel1-subheader">{t("serverBotFilters")}</p>
          <div className="flex justify-between text-neutral-400">
            <span>{t("mediaPerm")}</span>
            <Toggle item={mediaFilter} setItem={setMediaFilter}/>
          </div>

          <div className="flex justify-between text-neutral-400">
            <span>{t("linkPerm")}</span>
            <Toggle item={linkFilter} setItem={setLinkFilter}/>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={submit} className="panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1">
          <SaveIcon /> <p>{t("submit")}</p>
        </button>
        <button onClick={Delete} className="panel2 buttonstyle5 w-50 !my-5 flex centered space-x-1">
          <Trash /> <p>{t("delete")}</p>
        </button>
      </div>
    </div>
  );
}
