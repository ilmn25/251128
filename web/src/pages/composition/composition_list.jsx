import React, {useEffect, useState, useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {PencilRuler, MessageCirclePlus, Shuffle, Repeat, ChevronDown, ChevronRight, Plus, Trash2, Send, Server, Hash, User, Square, CheckSquare, Search, User as UserIcon, ExternalLink} from "lucide-react";
import {toast} from "sonner";
import {API_URL} from "../../main.jsx";
import { useTranslation } from "react-i18next";

export default function CompositionList() {
  const [items, setItems] = useState();
  const [connections, setConnections] = useState([]);
  const [cachedGuilds, setCachedGuilds] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      
      // Safety check if items exist
      const channels = chanData.items || [];
      const conns = connData.items || [];

      channels.forEach(ch => {
        if (ch.id) {
          channelGuildMap[ch.id] = ch.guildId;
          channelDiscordIdMap[ch.id] = ch.channelId;
        }
      });

      const enrichedConnections = conns.map(conn => ({
        ...conn,
        guildId: channelGuildMap[conn.channelId] || null,
        realChannelId: channelDiscordIdMap[conn.channelId] || null
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
          setCachedGuilds={setCachedGuilds}
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
  const [isExpanded, setIsExpanded] = useState(true);
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
    const selectedConns = connections.filter(c => selectedIds.includes(c.id));
    navigate("/connection/status", { 
      state: { 
        connectionIds: selectedIds,
        connections: selectedConns,
        compositions: [{ compositionId, messages, attachments, count, randomize }],
        profileName: selectedConns[0]?.profileName
      } 
    });
  };

  const handleSendAll = () => {
    if (connections.length === 0) return;
    navigate("/connection/status", { 
      state: { 
        connectionIds: connections.map(c => c.id),
        connections: connections,
        compositions: [{ compositionId, messages, attachments, count, randomize }],
        profileName: connections[0]?.profileName
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
    setIsTreeLoading(true);
    if (cachedGuilds) {
      setAvailableGuilds(cachedGuilds);
      setAddingStep("tree");
      setIsTreeLoading(false);
      return;
    }

    const res = await fetch(`${API_URL}/channel/available`, { credentials: "include" });
    const data = await res.json();
    if (data.success) {
      setAvailableGuilds(data.guilds);
      setCachedGuilds(data.guilds);
      setAddingStep("tree");
      if (data.guilds.length > 0) setSelectedGuildId(data.guilds[0].id);
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
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500 overflow-y-auto px-12 py-16">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {isTreeLoading && (
              <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="w-24 h-24 border-t-4 border-emerald-500 border-solid rounded-full animate-spin mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)]"></div>
                <p className="text-4xl font-black text-white uppercase tracking-tighter italic animate-pulse">Loading...</p>
              </div>
            )}

            {/* Step: Choice */}
            {addingStep === "choice" && (
              <div className="space-y-12 py-20 animate-in zoom-in-95">
                <div className="text-center space-y-4">
                  <p className="text-6xl font-black text-white uppercase tracking-tighter italic">{t("addChannel")}</p>
                  <p className="text-neutral-500 font-bold uppercase tracking-[0.3em] text-sm italic">{message}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <button 
                    onClick={() => setAddingStep("id")}
                    className="group p-1 bg-gradient-to-br from-neutral-800 to-transparent rounded-[3rem] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="bg-neutral-900/80 rounded-[2.8rem] p-12 text-center space-y-6 border border-neutral-800">
                      <div className="mx-auto w-24 h-24 bg-sky-500/10 rounded-3xl flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                        <Hash className="w-12 h-12" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-3xl font-black text-white uppercase tracking-tight italic">By ID</p>
                        <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest leading-relaxed">Direct connection using<br/>Discord Channel ID</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={startTreeSearch}
                    className="group p-1 bg-gradient-to-br from-neutral-800 to-transparent rounded-[3rem] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="bg-neutral-900/80 rounded-[2.8rem] p-12 text-center space-y-6 border border-neutral-800">
                      <div className="mx-auto w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                        <Search className="w-12 h-12" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-3xl font-black text-white uppercase tracking-tight italic">Browse</p>
                        <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest leading-relaxed">Search through your<br/>accessible servers</p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={() => setIsAddingChannel(false)}
                    className="px-12 py-5 bg-neutral-900 text-neutral-500 hover:text-white font-black uppercase tracking-widest text-sm rounded-full transition-all border border-neutral-800 hover:border-neutral-600"
                  >
                    {t("back")}
                  </button>
                </div>
              </div>
            )}

            {/* Step: Direct ID */}
            {addingStep === "id" && (
              <div className="space-y-12 py-20 animate-in slide-in-from-right-12 duration-500">
                <div className="text-center space-y-4">
                  <p className="text-6xl font-black text-white uppercase tracking-tighter italic">Connect by ID</p>
                  <p className="text-neutral-500 font-bold uppercase tracking-[0.3em] text-sm italic">Enter a unique Discord Channel ID</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="relative group">
                    <Hash className="absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 text-neutral-700 group-focus-within:text-sky-400 transition-colors" />
                    <input 
                      autoFocus
                      className="w-full bg-black border-2 border-neutral-800 rounded-[2.5rem] py-10 pl-20 pr-10 text-4xl font-black text-white focus:outline-none focus:border-sky-500/50 transition-all placeholder:text-neutral-800"
                      placeholder="123456789123456"
                      value={directId}
                      onChange={(e) => setDirectId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddDirectId()}
                    />
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={handleAddDirectId}
                      disabled={!directId.trim()}
                      className="flex-grow py-8 bg-sky-500 hover:bg-sky-400 disabled:bg-neutral-800 disabled:text-neutral-600 text-white text-xl font-black rounded-[2rem] transition-all shadow-[0_20px_40px_rgba(14,165,233,0.3)] hover:-translate-y-1 active:translate-y-0 uppercase tracking-widest"
                    >
                      {t("submit")}
                    </button>
                    <button 
                      onClick={() => setAddingStep("choice")}
                      className="px-12 py-8 bg-neutral-900 text-neutral-500 hover:text-white text-sm font-black rounded-[2rem] transition-all border border-neutral-800"
                    >
                      {t("back")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Tree Tree Selection */}
            {addingStep === "tree" && (
              <div className="animate-in slide-in-from-right-12 duration-500 pb-20 max-w-7xl mx-auto h-[80vh] flex flex-col">
                <div className="flex justify-between items-end pb-12 border-b border-neutral-800 shrink-0">
                  <div>
                    <p className="text-5xl font-black text-white uppercase tracking-tighter mb-2 italic">Select Channels</p>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-0.5 bg-sky-500/20 text-sky-400 text-[10px] font-black rounded uppercase tracking-widest">{treeSelectedIds.length} {t("selected")}</div>
                      <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest italic">— {message}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {treeSelectedIds.length > 0 && (
                      <button 
                        onClick={handleAddSelectedChannels}
                        className="px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white text-sm font-black rounded-2xl transition-all flex items-center gap-3 shadow-[0_20px_40px_rgba(14,165,233,0.3)] hover:-translate-y-1 active:translate-y-0 uppercase tracking-widest"
                      >
                        <Plus className="w-5 h-5" /> {t("addMessage")} ({treeSelectedIds.length})
                      </button>
                    )}
                    <button 
                      onClick={() => setAddingStep("choice")} 
                      className="px-8 py-4 bg-neutral-900 border border-neutral-800 hover:text-white text-neutral-500 text-sm font-black rounded-2xl transition-all uppercase tracking-widest"
                    >
                      {t("back")}
                    </button>
                  </div>
                </div>

                <div className="mt-8 relative group shrink-0">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-600 group-focus-within:text-sky-400 transition-colors" />
                  <input 
                    className="w-full bg-neutral-900/30 border-2 border-neutral-800 rounded-3xl py-6 pl-16 pr-8 text-xl font-bold focus:outline-none focus:border-sky-500/50 transition-all placeholder:text-neutral-700"
                    placeholder={t("search")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="mt-12 flex-grow flex gap-8 overflow-hidden">
                  {/* Left Sidebar: Servers */}
                  <div className="w-1/3 overflow-y-auto space-y-2 pr-4 custom-scrollbar">
                    {filteredGuilds.map((guild) => (
                      <button
                        key={guild.id}
                        onClick={() => setSelectedGuildId(guild.id)}
                        className={`w-full flex items-center gap-4 p-5 rounded-[2rem] border transition-all text-left group ${selectedGuildId === guild.id ? 'bg-sky-500/10 border-sky-500/40 shadow-inner' : 'bg-neutral-900/20 border-transparent hover:bg-neutral-800/40'}`}
                      >
                        <div className={`p-3 rounded-2xl transition-all ${selectedGuildId === guild.id ? 'bg-sky-500/20 text-sky-400' : 'bg-neutral-800 text-neutral-500 group-hover:text-neutral-300'}`}>
                          {guild.id === "dms" ? <UserIcon className="w-6 h-6" /> : <Server className="w-6 h-6" />}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className={`font-black uppercase tracking-tight italic truncate ${selectedGuildId === guild.id ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'}`}>
                            {guild.name}
                          </p>
                          <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest italic">{guild.channels.length} {t("channels")}</p>
                        </div>
                        {selectedGuildId === guild.id && <ChevronRight className="w-5 h-5 text-sky-400" />}
                      </button>
                    ))}
                  </div>

                  {/* Right Content: Channels */}
                  <div className="flex-grow bg-neutral-900/20 rounded-[3rem] border border-neutral-800/50 overflow-y-auto p-8 custom-scrollbar">
                    {selectedGuildId && filteredGuilds.find(g => g.id === selectedGuildId) ? (
                      <div className="space-y-3">
                        {filteredGuilds.find(g => g.id === selectedGuildId).channels.map(ch => (
                          <div 
                            key={ch.id}
                            className={`flex items-center gap-6 p-6 rounded-[2rem] border transition-all group ${treeSelectedIds.includes(ch.id) ? 'bg-sky-500/10 border-sky-500/40 shadow-inner' : 'bg-black/20 border-transparent hover:border-neutral-700'}`}
                          >
                            <div 
                              onClick={() => toggleTreeSelection(ch.id)}
                              className="flex items-center gap-6 flex-grow cursor-pointer"
                            >
                              <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${treeSelectedIds.includes(ch.id) ? 'bg-sky-500 border-sky-500' : 'border-neutral-800 group-hover:border-neutral-600'}`}>
                                {treeSelectedIds.includes(ch.id) && <Plus className="w-5 h-5 text-white" />}
                              </div>
                              <Hash className={`w-6 h-6 flex-shrink-0 ${treeSelectedIds.includes(ch.id) ? 'text-sky-400' : 'text-neutral-700'}`} />
                              <span className={`text-xl font-black italic truncate ${treeSelectedIds.includes(ch.id) ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'}`}>{ch.name}</span>
                            </div>
                            
                            <a 
                              href={`https://discord.com/channels/${selectedGuildId === 'dms' ? '@me' : selectedGuildId}/${ch.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-4 rounded-2xl bg-neutral-800/50 hover:bg-neutral-700 text-neutral-500 hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-lg"
                              title="View on Discord"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-24 h-24 bg-neutral-800/50 rounded-full flex items-center justify-center">
                          <Server className="w-10 h-10 text-neutral-600" />
                        </div>
                        <p className="text-xl font-black text-neutral-700 uppercase tracking-widest italic">Select a server to view channels</p>
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
              <span className="font-bold text-2xl text-white truncate">{message}</span>
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
                  <div className="flex items-center gap-2 px-1 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                    {server === "DMs" ? <User className="w-4 h-4" /> : <Server className="w-4 h-4" />}
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
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
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
