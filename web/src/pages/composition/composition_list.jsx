import React, {useEffect, useState, useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {PencilRuler, MessageCirclePlus, Shuffle, Repeat, ChevronDown, ChevronRight, Plus, Trash2, Send, Server, Hash, User, Square, CheckSquare, Search, User as UserIcon, ExternalLink, Globe2, RefreshCw, Clock, CheckCircle2, X} from "lucide-react";
import {toast} from "sonner";
import {API_URL} from "../../main.jsx";
import { useTranslation } from "react-i18next";

export default function CompositionList() {
  const [items, setItems] = useState();
  const [connections, setConnections] = useState([]);
  const [cachedGuilds, setCachedGuilds] = useState(() => {
    const saved = localStorage.getItem("cached_discord_guilds");
    return saved ? JSON.parse(saved) : null;
  });
  const navigate = useNavigate();
  const { t } = useTranslation();

  const updateCachedGuilds = (guilds) => {
    setCachedGuilds(guilds);
    localStorage.setItem("cached_discord_guilds", JSON.stringify(guilds));
  };

  const fetchData = async () => {
    const [compRes, connRes, chanRes] = await Promise.all([
      fetch(API_URL + "/composition", { method: "GET", credentials: "include" }),
      fetch(API_URL + "/connection", { method: "GET", credentials: "include" }),
      fetch(API_URL + "/channel", { method: "GET", credentials: "include" })
    ]);
    
    const compData = await compRes.json();
    const connData = await connRes.json();
    const chanData = await chanRes.json();

    if (compData.success) {
      if (compData.items.length === 0) navigate("/composition/new");
      else setItems(compData.items);
    } else {
      toast.error(compData.error || t("toastFetchError"));
    }

    if (connData.success && chanData.success) {
      const channelGuildMap = {};
      const channelDiscordIdMap = {};
      const channelFiltersMap = {};
      const channelIconMap = {};
      
      // Safety check if items exist
      const channels = chanData.items || [];
      const conns = connData.items || [];

      channels.forEach(ch => {
        if (ch.id) {
          channelGuildMap[ch.id] = ch.guildId;
          channelDiscordIdMap[ch.id] = ch.channelId;
          channelIconMap[ch.id] = ch.icon;
          channelFiltersMap[ch.id] = {
            linkFilter: ch.linkFilter,
            mediaFilter: ch.mediaFilter,
            attachmentPerm: ch.attachmentPerm,
            dead: ch.dead
          };
        }
      });

      const enrichedConnections = conns.map(conn => ({
        ...conn,
        guildId: channelGuildMap[conn.channelId] || null,
        realChannelId: channelDiscordIdMap[conn.channelId] || null,
        guildIcon: channelIconMap[conn.channelId] || null,
        ...(channelFiltersMap[conn.channelId] || {})
      }));

      setConnections(enrichedConnections);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate, t]);

  if (!items) return <></>;

  return (
    <div className="space-y-4">
      {items.map((p) => (
        <CompositionListItem 
          key={p.compositionId} 
          {...p} 
          connections={connections.filter(c => c.compositionId === p.compositionId)}
          allConnections={connections}
          onRefresh={fetchData}
          cachedGuilds={cachedGuilds}
          setCachedGuilds={updateCachedGuilds}
        />
      ))}

      <button
        onClick={() => navigate("/composition/new")}
        className="panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1"
      >
        <MessageCirclePlus/> <p>{t("newComposition")}</p>
      </button>
    </div>
  );
}


function CompositionListItem({ compositionId, message, attachmentCount, randomize, count, connections, onRefresh, allConnections, messages, attachments, cachedGuilds, setCachedGuilds }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getTimeColor = (lastSentAt) => {
    if (!lastSentAt) return "rgb(56, 189, 248)"; // sky-400
    const diff = Date.now() - new Date(lastSentAt).getTime();
    const twoDays = 2 * 24 * 60 * 60 * 1000;
    const ratio = Math.min(diff / twoDays, 1);
    
    // Interpolate from Sky 400 (56, 189, 248) to Rose 500 (244, 63, 94)
    const r = Math.floor(56 + (244 - 56) * ratio);
    const g = Math.floor(189 + (63 - 189) * ratio);
    const b = Math.floor(248 + (94 - 248) * ratio);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [isTreeLoading, setIsTreeLoading] = useState(false);
  const [addingStep, setAddingStep] = useState("choice"); // "choice", "id", "tree"
  const [directId, setDirectId] = useState("");
  const [availableGuilds, setAvailableGuilds] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [treeSelectedIds, setTreeSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedGuilds, setExpandedGuilds] = useState({});
  const [selectedGuildId, setSelectedGuildId] = useState(null);
  const [existingChannels, setExistingChannels] = useState([]);

  const safeMessage = message || "";

  useEffect(() => {
    if (addingStep === "id") {
      fetch(API_URL + "/channel", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setExistingChannels(data.items || []);
          }
        });
    }
  }, [addingStep]);

  // Group connections by server (simulated from channel name for now)
  const groupedConnections = useMemo(() => {
    const groups = {};
    connections.forEach(conn => {
      let serverName = t("other");
      if (conn.channel.includes(" in ")) {
        serverName = conn.channel.split(" in ")[1];
      } else if (conn.channel.startsWith("@")) {
        serverName = "DMs";
      }
      
      if (!groups[serverName]) groups[serverName] = [];
      groups[serverName].push(conn);
    });
    return groups;
  }, [connections, t]);

  const filteredGuilds = useMemo(() => {
    if (!search.trim()) return availableGuilds;
    const s = search.toLowerCase();
    return availableGuilds.map(g => {
      const filteredChannels = g.channels.filter(ch => 
        ch.name.toLowerCase().includes(s) || g.name.toLowerCase().includes(s)
      );
      if (filteredChannels.length > 0 || g.name.toLowerCase().includes(s)) {
        return {...g, channels: filteredChannels};
      }
      return null;
    }).filter(Boolean);
  }, [availableGuilds, search]);

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleTreeSelection = (id) => {
    setTreeSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === connections.length) setSelectedIds([]);
    else setSelectedIds(connections.map(c => c.id));
  };

  const handleSendSelected = () => {
    if (selectedIds.length === 0) return;
    const selectedConns = connections.filter(c => selectedIds.includes(c.id) && c.dead !== true);
    if (selectedConns.length === 0) {
      toast.error(t("noChannelsSelected"));
      return;
    }
    navigate("/connection/status", { 
      state: { 
        connectionIds: selectedConns.map(c => c.id),
        connections: selectedConns,
        compositions: [{ compositionId, messages, attachments, count, randomize }]
      } 
    });
  };

  const handleSendAll = () => {
    const sendableConnections = connections.filter(c => c.dead !== true);
    if (sendableConnections.length === 0) {
      toast.error(t("noChannelsSelected"));
      return;
    }
    navigate("/connection/status", { 
      state: { 
        connectionIds: sendableConnections.map(c => c.id),
        connections: sendableConnections,
        compositions: [{ compositionId, messages, attachments, count, randomize }]
      } 
    });
  };

  async function removeConnection(id) {
    const res = await fetch(`${API_URL}/connection/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    const data = await res.json();
    if (data.success) {
      toast.success(t("toastDeleteSuccess"));
      onRefresh();
    } else {
      toast.error(data.error);
    }
  }

  async function handleAddSelectedChannels() {
    if (treeSelectedIds.length === 0) return;
    const res = await fetch(`${API_URL}/connection/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ channelIds: treeSelectedIds, compositionId })
    });
    const data = await res.json();
    if (data.success) {
      toast.success(t("toastSubmitSuccess"));
      setIsAddingChannel(false);
      setTreeSelectedIds([]);
      onRefresh();
    } else {
      toast.error(data.error);
    }
  }

  const startAdding = async () => {
    setIsAddingChannel(true);
    setAddingStep("choice");
  };

  const startTreeSearch = async () => {
    if (cachedGuilds) {
      setAvailableGuilds(cachedGuilds);
      setAddingStep("tree");
      if (cachedGuilds.length > 0) setSelectedGuildId(cachedGuilds[0].id);
      return;
    }
    await refreshDiscordData();
  };

  const refreshDiscordData = async () => {
    setIsTreeLoading(true);
    try {
      const res = await fetch(`${API_URL}/channel/available`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setAvailableGuilds(data.guilds);
        setCachedGuilds(data.guilds);
        setAddingStep("tree");
        if (data.guilds.length > 0) setSelectedGuildId(data.guilds[0].id);
      }
    } catch (e) {
      toast.error(t("toastFetchError"));
    }
    setIsTreeLoading(false);
  };

  const handleAddDirectId = async () => {
    if (!directId.trim()) return;
    const res = await fetch(`${API_URL}/connection/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ channelIds: [directId.trim()], compositionId })
    });
    const data = await res.json();
    if (data.success) {
      toast.success(t("toastSubmitSuccess"));
      setIsAddingChannel(false);
      setDirectId("");
      onRefresh();
    } else {
      toast.error(data.error);
    }
  };

  return (
    <div className="panel1 !p-6 space-y-4">
      {/* Add Channel Full Page Overlay */}
      {isAddingChannel && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto px-6 py-10">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {isTreeLoading && (
              <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-16 h-16 border-t-4 border-sky-500 border-solid rounded-full animate-spin mb-4 shadow-[0_0_30px_rgba(14,165,233,0.3)]"></div>
                <p className="text-xl font-bold text-white uppercase tracking-widest animate-pulse">Loading Discord...</p>
              </div>
            )}

            {/* Step: Choice */}
            {addingStep === "choice" && (
              <div className="space-y-8 py-10 animate-in zoom-in-95 duration-300">
                <div className="text-center space-y-2">
                  <p className="text-3xl font-black text-white uppercase tracking-tight italic">{t("addChannel")}</p>
                  <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] italic">{safeMessage}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  <button 
                    onClick={() => setAddingStep("id")}
                    className="group p-0.5 bg-gradient-to-br from-neutral-800 to-transparent rounded-3xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div className="bg-neutral-900/80 rounded-[1.7rem] p-8 text-center space-y-4 border border-neutral-800">
                      <div className="mx-auto w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                        <Hash className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-black text-white uppercase tracking-tight italic">By ID</p>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest leading-relaxed">Direct connection via<br/>Channel ID</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={startTreeSearch}
                    className="group p-0.5 bg-gradient-to-br from-neutral-800 to-transparent rounded-3xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div className="bg-neutral-900/80 rounded-[1.7rem] p-8 text-center space-y-4 border border-neutral-800">
                      <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                        <Search className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-black text-white uppercase tracking-tight italic">Browse</p>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest leading-relaxed">Search through<br/>accessible servers</p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={() => setIsAddingChannel(false)}
                    className="px-8 py-3 bg-neutral-900 text-neutral-500 hover:text-white font-bold uppercase tracking-widest text-[10px] rounded-full transition-all border border-neutral-800 hover:border-neutral-600"
                  >
                    {t("back")}
                  </button>
                </div>
              </div>
            )}

            {/* Step: Direct ID */}
            {addingStep === "id" && (
              <div className="space-y-8 py-10 animate-in slide-in-from-right-8 duration-400">
                <div className="text-center space-y-2">
                  <p className="text-3xl font-black text-white uppercase tracking-tight italic">Connect by ID</p>
                  <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] italic">Enter a unique Discord Channel ID</p>
                </div>

                <div className="max-w-xl mx-auto space-y-6">
                  <div className="relative group">
                    <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-700 group-focus-within:text-sky-400 transition-colors" />
                    <input 
                      autoFocus
                      className="w-full bg-black border-2 border-neutral-800 rounded-2xl py-6 pl-16 pr-8 text-2xl font-black text-white focus:outline-none focus:border-sky-500/50 transition-all placeholder:text-neutral-800"
                      placeholder="123456789123456"
                      value={directId}
                      onChange={(e) => setDirectId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddDirectId()}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={handleAddDirectId}
                      disabled={!directId.trim()}
                      className="flex-grow py-5 bg-sky-500 hover:bg-sky-400 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-black rounded-xl transition-all shadow-[0_10px_20px_rgba(14,165,233,0.2)] hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest text-sm"
                    >
                      {t("submit")}
                    </button>
                    <button 
                      onClick={() => setAddingStep("choice")}
                      className="px-8 py-5 bg-neutral-900 text-neutral-500 hover:text-white text-xs font-bold rounded-xl transition-all border border-neutral-800"
                    >
                      {t("back")}
                    </button>
                  </div>
                </div>

                {existingChannels.length > 0 && (
                  <div className="mt-12 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-grow bg-neutral-800" />
                      <p className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.3em] italic shrink-0">{t("previouslyAdded")}</p>
                      <div className="h-px flex-grow bg-neutral-800" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {existingChannels
                        .filter(ch => !connections.some(c => c.channelId === ch.id))
                        .map(ch => (
                        <button
                          key={ch.id}
                          onClick={() => {
                            setDirectId(ch.channelId);
                            // Auto-submit if user clicks an existing one
                            const submitExisting = async () => {
                              const res = await fetch(`${API_URL}/connection/bulk`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({ channelIds: [ch.channelId], compositionId })
                              });
                              const data = await res.json();
                              if (data.success) {
                                toast.success(t("toastSubmitSuccess"));
                                setIsAddingChannel(false);
                                setDirectId("");
                                onRefresh();
                              }
                            };
                            submitExisting();
                          }}
                          className="flex items-center justify-between p-4 bg-neutral-900/40 border border-neutral-800 hover:border-sky-500/30 rounded-2xl transition-all group text-left hover:bg-sky-500/[0.02]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-neutral-600 group-hover:text-sky-400 transition-colors border border-neutral-800">
                              <Hash className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-neutral-300 group-hover:text-white truncate">{ch.name}</p>
                              <p className="text-[10px] text-neutral-600 font-mono tracking-tight">{ch.channelId}</p>
                            </div>
                          </div>
                          <Plus className="w-4 h-4 text-neutral-800 group-hover:text-sky-500 transition-colors flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step: Tree Tree Selection */}
            {addingStep === "tree" && (
              <div className="animate-in slide-in-from-right-8 duration-400 pb-10 max-w-6xl mx-auto h-[75vh] flex flex-col">
                <div className="flex justify-between items-center pb-6 border-b border-neutral-800 shrink-0">
                  <div>
                    <p className="text-2xl font-black text-white uppercase tracking-tight italic">Select Channels</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="px-1.5 py-0.5 bg-sky-500/20 text-sky-400 text-[9px] font-black rounded uppercase tracking-widest">{treeSelectedIds.length} {t("selected")}</div>
                      <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest italic">— {safeMessage}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={refreshDiscordData}
                      disabled={isTreeLoading}
                      className="p-3 bg-neutral-900 border border-neutral-800 hover:text-sky-400 text-neutral-500 rounded-xl transition-all"
                      title={t("refresh")}
                    >
                      <RefreshCw className={`w-5 h-5 ${isTreeLoading ? 'animate-spin' : ''}`} />
                    </button>
                    {treeSelectedIds.length > 0 && (
                      <button 
                        onClick={handleAddSelectedChannels}
                        className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white text-xs font-black rounded-xl transition-all flex items-center gap-2 shadow-[0_10px_20px_rgba(14,165,233,0.2)] hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest"
                      >
                        <Plus className="w-4 h-4" /> {t("addMessage")} ({treeSelectedIds.length})
                      </button>
                    )}
                    <button 
                      onClick={() => setAddingStep("choice")} 
                      className="px-6 py-3 bg-neutral-900 border border-neutral-800 hover:text-white text-neutral-500 text-xs font-black rounded-xl transition-all uppercase tracking-widest"
                    >
                      {t("back")}
                    </button>
                  </div>
                </div>

                <div className="mt-6 relative group shrink-0">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-700 group-focus-within:text-sky-400 transition-colors" />
                  <input 
                    className="w-full bg-neutral-900/20 border border-neutral-800 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-sky-500/30 transition-all placeholder:text-neutral-700"
                    placeholder={t("search")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="mt-8 flex-grow flex gap-6 overflow-hidden min-h-0">
                  {/* Left Sidebar: Servers */}
                  <div className="w-1/3 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
                    {filteredGuilds.map((guild) => (
                      <button
                        key={guild.id}
                        onClick={() => setSelectedGuildId(guild.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-xl border transition-all text-left group ${selectedGuildId === guild.id ? 'bg-sky-500/10 border-sky-500/30' : 'bg-neutral-900/10 border-transparent hover:bg-neutral-800/20'}`}
                      >
                        <div className="flex-shrink-0">
                          {guild.icon ? (
                            <img src={guild.icon} alt="" className="w-7 h-7 rounded-lg object-cover" />
                          ) : (
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] ${guild.id === 'dms' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-neutral-800 text-neutral-600 group-hover:text-neutral-400'}`}>
                              {guild.id === 'dms' ? <UserIcon className="size-3.5" /> : guild.name.substring(0, 1)}
                            </div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className={`text-[11px] font-bold uppercase tracking-tight truncate ${selectedGuildId === guild.id ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'}`}>
                            {guild.name}
                          </p>
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest flex-shrink-0">{guild.channels.length} {t("channels")}</span>
                            {guild.memberCount && (
                              <>
                                <span className="text-neutral-800">•</span>
                                <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest truncate">{guild.memberCount.toLocaleString()} {t("members")}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Right Content: Channels */}
                  <div className="flex-grow bg-neutral-900/10 rounded-3xl border border-neutral-800/30 overflow-y-auto p-4 custom-scrollbar">
                    {selectedGuildId && filteredGuilds.find(g => g.id === selectedGuildId) ? (
                      <div className="grid grid-cols-1 gap-1">
                        <div className="flex items-center justify-between gap-1 mb-2 px-1">
                          <div className="flex items-center gap-1.5 opacity-60">
                            <Globe2 className="size-3" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">{t("selectServer")}</span>
                          </div>
                          <button
                            onClick={refreshDiscordData}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-black/5 opacity-60 hover:opacity-100 transition-all text-[10px] font-medium"
                          >
                            <RefreshCw className="size-2.5" />
                            {t("refresh")}
                          </button>
                        </div>
                        {filteredGuilds.find(g => g.id === selectedGuildId).channels.map(ch => {
                          const isAlreadyConnected = connections.some(c => c.realChannelId === ch.id);
                          const isConnectedElsewhere = !isAlreadyConnected && allConnections.some(c => c.realChannelId === ch.id);

                          return (
                            <div 
                              key={ch.id}
                              className={`flex items-center gap-3 p-2 rounded-xl border transition-all group ${treeSelectedIds.includes(ch.id) ? 'bg-sky-500/10 border-sky-500/30' : (isAlreadyConnected || isConnectedElsewhere) ? 'bg-neutral-800/10 border-transparent' : 'bg-black/10 border-transparent hover:border-neutral-800'}`}
                            >
                              <div 
                                onClick={() => !isAlreadyConnected && toggleTreeSelection(ch.id)}
                                className={`flex items-center gap-2.5 flex-grow ${isAlreadyConnected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${treeSelectedIds.includes(ch.id) ? 'bg-sky-500 border-sky-500' : isAlreadyConnected ? 'bg-neutral-800 border-neutral-700' : 'border-neutral-800 group-hover:border-neutral-700'}`}>
                                  {treeSelectedIds.includes(ch.id) && <Plus className="w-2.5 h-2.5 text-white" />}
                                  {isAlreadyConnected && <CheckCircle2 className="w-2.5 h-2.5 text-neutral-600" />}
                                </div>
                                <Hash className={`w-3.5 h-3.5 flex-shrink-0 ${treeSelectedIds.includes(ch.id) ? 'text-sky-400' : isAlreadyConnected ? 'text-neutral-700' : 'text-neutral-600'}`} />
                                <div className="flex flex-col min-w-0">
                                  <span className={`text-[12px] font-bold truncate ${treeSelectedIds.includes(ch.id) ? 'text-white' : isAlreadyConnected ? 'text-neutral-600' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
                                    {ch.name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {ch.slowmode > 0 && (
                                      <span className="text-[8px] text-amber-500/60 font-black uppercase tracking-tighter flex items-center gap-1">
                                        <Clock className="size-2" />
                                        {ch.slowmode}s slow
                                      </span>
                                    )}
                                    {(isAlreadyConnected || isConnectedElsewhere) && (
                                      <span className={`text-[8px] uppercase font-black ${isAlreadyConnected ? 'text-emerald-500/60' : 'text-sky-500/40'} tracking-tighter`}>
                                        {isAlreadyConnected ? t("selected") : "Elsewhere"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                <a 
                                  href={`https://discord.com/channels/${selectedGuildId === 'dms' ? '@me' : selectedGuildId}/${ch.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-neutral-800/50 hover:bg-neutral-700 text-neutral-500 hover:text-white transition-all shadow-sm"
                                  onClick={(e) => e.stopPropagation()}
                                  title={t("openInDiscord")}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                        <div className="w-16 h-16 bg-neutral-800/50 rounded-2xl flex items-center justify-center">
                          <Server className="w-8 h-8 text-neutral-600" />
                        </div>
                        <p className="text-xs font-bold text-neutral-600 uppercase tracking-widest">Select a server</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Composition Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-grow cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="p-2 bg-neutral-800 rounded-xl flex-shrink-0">
            {isExpanded ? <ChevronDown className="w-6 h-6 text-neutral-400" /> : <ChevronRight className="w-6 h-6 text-neutral-400" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="font-bold text-2xl text-white truncate">
                {safeMessage || (attachmentCount > 0 ? `${attachmentCount} ${t("attachments")}` : t("emptyComposition"))}
              </span>
              {randomize ? <Shuffle className="w-5 h-5 text-sky-400 opacity-70 flex-shrink-0" /> : <Repeat className="w-5 h-5 text-emerald-400 opacity-70 flex-shrink-0" />}
            </div>
            <p className="comment mt-1 truncate">
              {t("selectAttachments", { count, attachmentCount })} • {connections.length} {t("connection")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {connections.length > 0 && (
            <>
              {selectedIds.length > 0 && (
                <button
                  onClick={handleSendSelected}
                  className="panel2 buttonstyle4 flex items-center gap-2 !py-2.5"
                >
                  <Send className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    {t("sendSelected")} ({selectedIds.length})
                  </span>
                </button>
              )}
              <button
                onClick={handleSendAll}
                className="panel2 buttonstyle3 flex items-center gap-2 !py-2.5"
              >
                <Send className="w-4 h-4" />
                <span className="text-sm font-bold">{t("sendAll")}</span>
              </button>
            </>
          )}
          <div className="w-px h-8 bg-neutral-800 mx-1" />
          <button
            onClick={startAdding}
            className="p-3 bg-neutral-800 hover:bg-neutral-700 text-sky-400 rounded-xl transition-all"
            title={t("addChannel")}
          >
            <Plus className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate("/composition/edit/" + compositionId)}
            className="p-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-xl transition-all"
            title={t("edit")}
          >
            <PencilRuler className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Tree Content */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-neutral-800">
          {/* Selection Actions */}
          {connections.length > 0 && (
            <div className="flex items-center gap-4 px-2">
              <button 
                onClick={toggleAll}
                className="flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition-colors"
              >
                {selectedIds.length === connections.length ? <CheckSquare className="w-4 h-4 text-sky-500" /> : <Square className="w-4 h-4" />}
                {selectedIds.length === connections.length ? t("deselectAll") : t("selectAll")}
              </button>
              <span className="text-[10px] text-neutral-700 uppercase tracking-tighter">|</span>
              <span className="text-xs text-neutral-600 font-medium">
                {selectedIds.length > 0 ? `${selectedIds.length} / ${connections.length} ${t("selected")}` : `${connections.length} ${t("totalChannels")}`}
              </span>
            </div>
          )}

          {/* Connection List */}
          <div className="space-y-6">
            {Object.entries(groupedConnections).length === 0 ? (
              <div className="py-12 text-center bg-neutral-800/20 rounded-2xl border border-dashed border-neutral-800">
                <p className="text-sm text-neutral-500 italic">{t("noChannelsConnected")}</p>
                <button onClick={startAdding} className="text-sky-400 text-xs mt-2 hover:underline">{t("connectChannelNow")}</button>
              </div>
            ) : (
              Object.entries(groupedConnections).map(([server, conns]) => (
                <div key={server} className="space-y-2">
                  <div className="flex items-center gap-2 px-1 text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                    {conns[0]?.guildIcon ? (
                      <img src={conns[0].guildIcon} alt="" className="w-4 h-4 rounded-md object-cover" />
                    ) : (
                      server === "DMs" ? <User className="w-4 h-4" /> : <Server className="w-4 h-4" />
                    )}
                    {server}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {conns.map(conn => (
                      <div 
                        key={conn.id} 
                        onClick={() => toggleSelection(conn.id)}
                        className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${selectedIds.includes(conn.id) ? 'bg-sky-500/10 border-sky-500/40 shadow-[0_0_15px_rgba(14,165,233,0.1)]' : 'bg-neutral-800/40 border-transparent hover:border-neutral-700'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Hash className={`w-4 h-4 ${selectedIds.includes(conn.id) ? 'text-sky-400' : 'text-neutral-600'}`} />
                            <span className={`text-sm font-medium ${selectedIds.includes(conn.id) ? 'text-white' : 'text-neutral-300'}`}>{conn.channel.split(" in ")[0]}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          {conn.lastSentAt && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-900/40 border border-neutral-800/50 text-[10px] font-bold text-neutral-500 mr-1 whitespace-nowrap">
                              <RefreshCw 
                                className="w-2.5 h-2.5" 
                                style={{ color: getTimeColor(conn.lastSentAt) }}
                              />
                              {new Date(conn.lastSentAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                          {conn.guildId && (
                            <button
                              onClick={() => window.open(conn.guildId === "@me" ? `https://discord.com/channels/@me/${conn.realChannelId}` : `https://discord.com/channels/${conn.guildId}/${conn.realChannelId}`, "_blank")}
                              className="p-2 hover:bg-neutral-700 text-neutral-400 rounded-lg transition-colors"
                              title={t("openInDiscord")}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/channel/edit/${conn.channelId}`)}
                            className="p-2 hover:bg-neutral-700 text-neutral-400 rounded-lg transition-colors"
                            title={t("edit")}
                          >
                            <PencilRuler className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate("/connection/status", { 
                              state: { 
                                connectionIds: [conn.id],
                                connections: [conn],
                                compositions: [{ compositionId, messages, attachments, count, randomize }],
                                profileName: conn.profileName
                              } 
                            })}
                            className="p-2 hover:bg-sky-500/20 text-sky-400 rounded-lg transition-colors"
                            title={t("send")}
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeConnection(conn.id)}
                            className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                            title={t("remove")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
