import React, {useEffect, useState, useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {PencilRuler, BadgePlus, Server, Hash, User, ExternalLink} from "lucide-react";
import {toast} from "sonner";
import {API_URL} from "../../main.jsx";
import { useTranslation } from "react-i18next";

export default function ChannelList() {
  const [items, setItems] = useState();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, [navigate, t]);

  const groupedChannels = useMemo(() => {
    if (!items) return {};
    const groups = {};
    items.forEach(ch => {
      let serverName = t("other");
      if (ch.name.includes(" in ")) {
        serverName = ch.name.split(" in ")[1];
      } else if (ch.name.startsWith("@")) {
        serverName = "DMs";
      }
      
      if (!groups[serverName]) groups[serverName] = [];
      groups[serverName].push(ch);
    });
    return groups;
  }, [items, t]);

  if (!items) return <></>;

  return (
    <div className="space-y-6">
      {Object.entries(groupedChannels).map(([server, channels]) => (
        <div key={server} className="panel1 !p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-neutral-800 pb-4">
            <div className="p-2 bg-neutral-800 rounded-xl">
              {server === "DMs" ? <User className="w-6 h-6 text-sky-400" /> : <Server className="w-6 h-6 text-emerald-400" />}
            </div>
            <div>
              <p className="font-bold text-xl text-white uppercase tracking-wider">{server}</p>
              <p className="comment">{channels.length} {t("channels")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {channels.map((ch) => (
              <div 
                key={ch.id} 
                onClick={() => navigate("/channel/edit/" + ch.id)}
                className="group flex items-center justify-between p-4 bg-neutral-800/40 border border-transparent hover:border-neutral-700 rounded-xl transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Hash className="w-4 h-4 text-neutral-600 group-hover:text-sky-400 transition-colors" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-neutral-200 truncate group-hover:text-white transition-colors">{ch.name.split(" in ")[0]}</p>
                    <p className="text-[10px] text-neutral-500 truncate">ID: {ch.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    {ch.guildId && (
                      <button
                        onClick={() => window.open(ch.guildId === "@me" ? `https://discord.com/channels/@me/${ch.channelId}` : `https://discord.com/channels/${ch.guildId}/${ch.channelId}`, "_blank")}
                        className="p-2 hover:bg-neutral-800 text-neutral-400 rounded-lg transition-colors"
                        title={t("openInDiscord")}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    <button
                        onClick={() => navigate("/channel/edit/" + ch.id)}
                        className="p-2 hover:bg-neutral-800 text-neutral-400 rounded-lg transition-colors"
                        title={t("edit")}
                    >
                        <PencilRuler className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={() => navigate("/channel/new")}
        className="panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1"
      >
        <BadgePlus/> <p>{t("newChannel")}</p>
      </button>
    </div>
  );
}
