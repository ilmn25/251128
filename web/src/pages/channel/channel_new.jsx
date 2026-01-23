import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Cable, TextSearch} from "lucide-react";
import {toast} from "sonner";
import {API_URL} from "../../main.jsx";
import { useTranslation } from "react-i18next";

export function ChannelNew() {
  const [id, setId] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  async function submit() {
    if (!id.trim()) return;
    const res = await fetch(API_URL + "/channel/new", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({id})
    });

    const data = await res.json();
    if (data.success) {
      toast.success(t("toastChannelCreated"));
      navigate("/channel/edit/" + id);
    } else {
      toast.error(data.error || t("toastChannelCreateError"));
    }
  }

  return (
    <div>
      <div className="panel1 space-y-3 space-x-3">
        <p className="panel1-header">{t("channel")}</p>

        <div className="panel2 flex space-x-4 !p-4">
          <Cable className="comment !size-6" />
          <div className="space-y-2">
            <p>{t("channelDescription")}</p>
          </div>
        </div>

        <input
          className="justify-between panel2 input font-mono"
          placeholder={t("channelPlaceholder")}
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
      </div>

      <button onClick={submit} className="panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1">
        <TextSearch /> <p>{t("nextStep")}</p>
      </button>
    </div>
  );
}
