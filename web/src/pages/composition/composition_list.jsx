import React, {useEffect, useState, useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {PencilRuler, MessageCirclePlus, Shuffle, Repeat, ChevronDown, ChevronRight, Plus, Trash2, Send, Server, Hash, User, Square, CheckSquare} from "lucide-react";
import {toast} from "sonner";
import {API_URL} from "../../main.jsx";
import { useTranslation } from "react-i18next";

export default function CompositionList() {
  const [items, setItems] = useState();
  const [connections, setConnections] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchData = async () => {
    const [compRes, connRes] = await Promise.all([
      fetch(API_URL + "/composition", { method: "GET", credentials: "include" }),
      fetch(API_URL + "/connection", { method: "GET", credentials: "include" })
    ]);
    
    const compData = await compRes.json();
    const connData = await connRes.json();

    if (compData.success) {
      if (compData.items.length === 0) navigate("/composition/new");
      else setItems(compData.items);
    } else {
      toast.error(compData.error || t("toastFetchError"));
    }

    if (connData.success) {
      setConnections(connData.items || []);
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


function CompositionListItem({ compositionId, message, attachmentCount, randomize, count, connections, onRefresh, allConnections, messages, attachments }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [availableChannels, setAvailableChannels] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Group connections by server (simulated from channel name for now)
  const groupedConnections = useMemo(() => {
    const groups = {};
    connections.forEach(conn => {
      // Logic from channel.py: name is often "name in server" or "@user in DMs"
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

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
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

  async function handleAddChannel(channelId) {
    const res = await fetch(`${API_URL}/connection`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ channelId, compositionId })
    });
    const data = await res.json();
    if (data.success) {
      toast.success(t("toastSubmitSuccess"));
      setIsAddingChannel(false);
      onRefresh();
    } else {
      toast.error(data.error);
    }
  }

  const startAdding = async () => {
    const res = await fetch(`${API_URL}/channel`, { credentials: "include" });
    const data = await res.json();
    if (data.success) {
      // Filter out channels already connected to THIS composition
      const connectedChannelIds = connections.map(c => c.channelId);
      setAvailableChannels(data.items.filter(ch => !connectedChannelIds.includes(ch.id)));
      setIsAddingChannel(true);
    }
  };

  return (
    <div className="panel1 !p-6 space-y-4">
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
          {/* Add Channel Overlay/Dropdown */}
          {isAddingChannel && (
            <div className="p-4 bg-neutral-800/50 rounded-2xl border border-sky-500/20 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">{t("selectChannelToAdd")}</p>
                <button onClick={() => setIsAddingChannel(false)} className="text-xs text-neutral-500 hover:text-white transition-colors">{t("cancel")}</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
                {availableChannels.length === 0 ? (
                  <p className="text-sm text-neutral-500 italic p-2">{t("noAvailableChannels")}</p>
                ) : (
                  availableChannels.map(ch => (
                    <button
                      key={ch.id}
                      onClick={() => handleAddChannel(ch.id)}
                      className="flex items-center gap-3 p-3 bg-black hover:bg-sky-500/10 border border-neutral-700 hover:border-sky-500/50 rounded-xl transition-all text-left"
                    >
                      <Hash className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm text-neutral-300 truncate">{ch.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

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
