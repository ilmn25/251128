import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {PencilRuler, BadgePlus} from "lucide-react";
import {toast} from "sonner";
import {API_URL} from "../../main.jsx";
import { useTranslation } from "react-i18next";

export default function ChannelList() {
  const [items, setItems] = useState();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    async function get() {
      const res = await fetch(API_URL + "/channel", {
        method: "GET",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        if (data.items.length === 0) navigate("/channel/new");
        else setItems(data.items);
      } else {
        toast.error(data.error || t("toastFetchError"));
      }
    }
    get();
  }, [navigate, setItems, t]);

  if (!items) return <></>;

  return (
    <>
      {items.map((p) => (
        <ChannelListItem key={p.channelId} {...p} />
      ))}

      <button
        onClick={() => navigate("/channel/new")}
        className="panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1"
      >
        <BadgePlus/> <p>{t("newChannel")}</p>
      </button>
    </>
  );
}


function ChannelListItem({ channelId, name }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="panel1 flex content-between centered gap-3 !py-0">
      <div className="w-full">
        <p className="panel1-header">{name}</p>
        <p className="comment">ID: {channelId}</p>
      </div>

      <div className="my-5 space-y-3 max-w-50 w-full">
        <button
          type="button"
          onClick={() => navigate("/channel/edit/" + channelId)}
          className="panel2 buttonstyle2 w-full flex centered space-x-1"
        >
          <PencilRuler/> <p>{t("edit")}</p>
        </button>
      </div>
    </div>
  );
}
