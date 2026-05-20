import React, {useEffect, useState, useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {Cable, TextSearch, Server, Hash, User, Search, ChevronRight, ChevronDown} from "lucide-react";
import {toast} from "sonner";
import {API_URL} from "../../main.jsx";
import { useTranslation } from "react-i18next";
import LoadingPage from "../../components/loading.jsx";

export function ChannelNew() {
  const [loading, setLoading] = useState(true);
  const [guilds, setGuilds] = useState([]);
  const [search, setSearch] = useState("");
  const [id, setId] = useState("");
  const [expandedGuilds, setExpandedGuilds] = useState({});
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchAvailable();
  }, []);

  async function fetchAvailable() {
    try {
      const res = await fetch(API_URL + "/channel/available", {
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setGuilds(data.guilds);
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error(t("toastFetchError"));
    } finally {
      setLoading(false);
    }
  }

  async function submit(targetId) {
    const finalId = targetId || id;
    if (!finalId || !finalId.trim()) return;
    
    const res = await fetch(API_URL + "/channel/new", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({id: finalId})
    });

    const data = await res.json();
    if (data.success) {
      toast.success(t("toastChannelCreated"));
      navigate("/channel/edit/" + data.id);
    } else {
      toast.error(data.error || t("toastChannelCreateError"));
    }
  }

  const filteredGuilds = useMemo(() => {
    if (!search.trim()) return guilds;
    const s = search.toLowerCase();
    return guilds.map(g => {
      const filteredChannels = g.channels.filter(ch => 
        ch.name.toLowerCase().includes(s) || g.name.toLowerCase().includes(s)
      );
      if (filteredChannels.length > 0 || g.name.toLowerCase().includes(s)) {
        return {...g, channels: filteredChannels};
      }
      return null;
    }).filter(Boolean);
  }, [guilds, search]);

  const toggleGuild = (guildId) => {
    setExpandedGuilds(prev => ({...prev, [guildId]: !prev[guildId]}));
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div className="panel1 space-y-3">
        <p className="panel1-header">{t("newChannel")}</p>
        
        <div className="panel2 flex space-x-4 !p-4">
          <Cable className="comment !size-6" />
          <div className="space-y-2">
            <p>{t("channelDescription")}</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            className="w-full panel2 input !pl-10"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredGuilds.map((guild) => (
          <div key={guild.id} className="panel1 !p-4 overflow-hidden">
            <div 
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => toggleGuild(guild.id)}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-neutral-800 rounded-lg group-hover:bg-neutral-700 transition-colors">
                  {guild.id === "dms" ? <User className="w-5 h-5 text-sky-400" /> : <Server className="w-5 h-5 text-emerald-400" />}
                </div>
                <div>
                  <p className="font-bold text-neutral-200 group-hover:text-white transition-colors">{guild.name}</p>
                  <p className="text-[10px] text-neutral-500">{guild.channels.length} {t("channels")}</p>
                </div>
              </div>
              {expandedGuilds[guild.id] || search ? <ChevronDown className="w-5 h-5 text-neutral-600" /> : <ChevronRight className="w-5 h-5 text-neutral-600" />}
            </div>

            {(expandedGuilds[guild.id] || search) && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 border-t border-neutral-800 pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                {guild.channels.map((ch) => (
                  <div 
                    key={ch.id} 
                    onClick={() => submit(ch.id)}
                    className="flex items-center gap-2 p-3 bg-neutral-800/40 hover:bg-neutral-800 border border-transparent hover:border-neutral-700 rounded-lg transition-all cursor-pointer group"
                  >
                    <Hash className="w-4 h-4 text-neutral-600 group-hover:text-sky-400 transition-colors" />
                    <p className="text-sm text-neutral-300 group-hover:text-white truncate">{ch.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredGuilds.length === 0 && search && (
          <div className="text-center py-10">
            <p className="comment">{t("noResults")}</p>
          </div>
        )}

        {guilds.length === 0 && !loading && (
            <div className="text-center py-10">
                <p className="comment">No channels found. Is your token correct?</p>
            </div>
        )}
      </div>

      <div className="panel1 space-y-3">
        <p className="text-sm font-bold text-neutral-500 uppercase tracking-tight">Manual Entry</p>
        <input
            className="w-full panel2 input font-mono"
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
        <button onClick={() => submit()} className="panel2 buttonstyle4 w-full !mt-2 flex centered space-x-1">
            <TextSearch /> <p>{t("nextStep")}</p>
        </button>
      </div>
    </div>
  );
}
