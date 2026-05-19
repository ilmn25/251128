import React, {useEffect, useState, useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {PencilRuler, UserPlus, User, UserRoundCheck, ChevronDown, ChevronRight, Server, Hash, User as UserIcon, Plus} from "lucide-react";
import Cookies from "js-cookie";
import {toast} from "sonner";
import {API_URL} from "../../main.jsx";
import { useTranslation } from "react-i18next";

export default function ProfileList() {
  const [items, setItems] = useState();
  const [currentId, setCurrentId] = useState();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchData = async () => {
    const res = await fetch(API_URL + "/profile", { 
      method: "GET", 
      credentials: "include" 
    });
    
    const profData = await res.json();

    if (profData.success) {
      if (profData.items.length === 0) navigate("/profile/new");
      setItems(profData.items);
      setCurrentId(Cookies.get("profile"));
    } else {
      toast.error(profData.error || t("toastFetchError"));
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate, t]);

  if (!items) return <></>;

  return (
    <div className="space-y-4">
      {items.map((p) => (
        <ProfileListItem
          key={p.id}
          {...p}
          currentId={currentId}
          setCurrentId={setCurrentId}
          onRefresh={fetchData}
        />
      ))}

      <button
        onClick={() => navigate("/profile/new")}
        className="panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1"
      >
        <UserPlus/> <p>{t("newProfile")}</p>
      </button>
    </div>
  );
}

function ProfileListItem({ id, accountId, username, currentId, setCurrentId, channels, onRefresh}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const groupedChannels = useMemo(() => {
    const groups = {};
    channels.forEach(ch => {
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
  }, [channels, t]);

  return (
    <div className="panel1 !p-0 overflow-hidden border border-neutral-800">
      <div className="p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-grow cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="p-2 bg-neutral-800 rounded-xl flex-shrink-0">
            {isExpanded ? <ChevronDown className="w-6 h-6 text-neutral-400" /> : <ChevronRight className="w-6 h-6 text-neutral-400" />}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-2xl text-white truncate">@{username}</p>
            <p className="comment truncate">ID: {accountId} • {channels.length} {t("channels")}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              Cookies.set("profile", id, { expires: 365, path: "/" });
              setCurrentId(id);
              navigate("/channel/new");
            }}
            className="p-3 bg-neutral-800 hover:bg-sky-500/10 text-sky-400 rounded-xl transition-all"
            title={t("addChannel")}
          >
            <Plus className="w-6 h-6" />
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/profile/edit/" + accountId);
            }}
            className="p-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-xl transition-all"
            title={t("edit")}
          >
            <PencilRuler className="w-6 h-6" />
          </button>

          {id === currentId ? (
            <button
              type="button"
              className="panel2 buttonstyle3 flex items-center gap-2 !py-2.5"
            >
              <UserRoundCheck className="w-5 h-5" />
              <span className="text-sm font-bold">{t("selected")}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                Cookies.set("profile", id, { expires: 365, path: "/" });
                toast.success(t("toastProfileSelected"));
                setCurrentId(id);
              }}
              className="panel2 buttonstyle4 flex items-center gap-2 !py-2.5"
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-bold">{t("select")}</span>
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-neutral-800 bg-black/20 p-6 space-y-6">
          {Object.entries(groupedChannels).length === 0 ? (
            <div className="py-8 text-center bg-neutral-900/40 rounded-2xl border border-dashed border-neutral-800">
              <p className="text-sm text-neutral-500 italic">{t("noChannelsConnected")}</p>
            </div>
          ) : (
            Object.entries(groupedChannels).map(([server, chs]) => (
              <div key={server} className="space-y-2">
                <div className="flex items-center gap-2 px-1 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                  {server === "DMs" ? <UserIcon className="w-4 h-4" /> : <Server className="w-4 h-4" />}
                  {server}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {chs.map(ch => (
                    <div 
                      key={ch.id} 
                      onClick={() => navigate("/channel/edit/" + ch.id)}
                      className="group flex items-center justify-between p-3 bg-neutral-800/40 border border-transparent hover:border-neutral-700 rounded-xl transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Hash className="w-4 h-4 text-neutral-600" />
                        <span className="text-sm text-neutral-300 font-medium truncate">{ch.name.split(" in ")[0]}</span>
                      </div>
                      <PencilRuler className="w-3.5 h-3.5 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
