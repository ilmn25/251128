import React, {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {PencilRuler, Cable, ArrowBigRightDash, CheckSquare, Square, Filter, Send} from "lucide-react";
import {toast} from "sonner";
import {API_URL} from "../../main.jsx";
import { useTranslation } from "react-i18next";

export default function ConnectionList() {
  const [items, setItems] = useState();
  const [compositions, setCompositions] = useState([]);
  const [compositionFilter, setCompositionFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    async function get() {
      const [connectionRes, compositionRes] = await Promise.all([
        fetch(API_URL + "/connection", {
          method: "GET",
          credentials: "include"
        }),
        fetch(API_URL + "/composition", {
          method: "GET",
          credentials: "include"
        })
      ]);

      const connectionData = await connectionRes.json();
      const compositionData = await compositionRes.json();

      if (connectionData.success) {
        if (connectionData.items.length === 0) navigate("/connection/new");
        else setItems(connectionData.items);
      } else toast.error(connectionData.error || t("toastFetchError"));

      if (compositionData.success) {
        setCompositions(compositionData.items || []);
      }
    }
    get();
  }, [navigate, t]);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter(item => {
      const matchComposition = compositionFilter === "all" || item.compositionId === compositionFilter;
      const matchSearch = item.channel.toLowerCase().includes(search.toLowerCase()) ||
                          item.message.toLowerCase().includes(search.toLowerCase());
      return matchComposition && matchSearch;
    });
  }, [items, compositionFilter, search]);

  useEffect(() => {
    setSelectedIds(prev => prev.filter(id => filteredItems.some(item => item.id === id)));
  }, [filteredItems]);

  async function send(id) {
    navigate("/connection/status", { 
      state: { 
        connectionIds: [id],
        connections: items.filter(item => item.id === id),
        compositions: compositions,
        profileName: items.find(item => item.id === id)?.profileName // We might need this from somewhere
      } 
    });
  }

  function toggleSelected(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]);
  }

  function selectVisibleAll() {
    setSelectedIds(filteredItems.map(item => item.id));
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  async function sendSelected() {
    if (selectedIds.length === 0) {
      toast.error(t("selectAtLeastOneConnection"));
      return;
    }

    navigate("/connection/status", { 
      state: { 
        connectionIds: selectedIds,
        connections: filteredItems.filter(item => selectedIds.includes(item.id)),
        compositions: compositions
      } 
    });
  }

  if (!items) return <></>;

  const allVisibleSelected = filteredItems.length > 0 && filteredItems.every(item => selectedIds.includes(item.id));

  return (
    <>
      {(loading || batchLoading) &&
        <div className="overlay">
          <p className="panel1-header flex items-center justify-center">{t("sendingWait")}</p>
        </div>
      }

      <div className="panel1 space-y-3 !mb-5">
        <p className="panel1-header">{t("connection")}</p>

        <div className="panel2 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-4 flex-grow max-w-2xl">
            <div className="flex items-center gap-2 border-r border-neutral-700 pr-4 whitespace-nowrap">
              <Filter className="w-4 h-4 text-neutral-400" />
              <select
                value={compositionFilter}
                onChange={e => setCompositionFilter(e.target.value)}
                className="bg-neutral-800 outline-none text-sm cursor-pointer rounded px-2 py-1 appearance-none border border-neutral-700 hover:border-neutral-500 transition-colors"
              >
                <option value="all">{t("allCompositions")}</option>
                {compositions.map(composition => (
                  <option key={composition.compositionId} value={composition.compositionId}>
                    {composition.message}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 flex-grow">
              <input
                type="text"
                placeholder={t("search") + "..."}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={allVisibleSelected ? clearSelection : selectVisibleAll}
              className="panel2 buttonstyle2 flex centered space-x-1"
              disabled={filteredItems.length === 0}
            >
              {allVisibleSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              <p>{allVisibleSelected ? t("unselectAll") : t("selectAll")}</p>
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="panel2 buttonstyle2 flex centered space-x-1"
              disabled={selectedIds.length === 0}
            >
              <p>{t("clearSelection")}</p>
            </button>
            <button
              type="button"
              onClick={sendSelected}
              className="panel2 buttonstyle4 flex centered space-x-1"
              disabled={selectedIds.length === 0}
            >
              <Send className="w-4 h-4" />
              <p>{t("sendSelected", {count: selectedIds.length})}</p>
            </button>
          </div>
        </div>

        <p className="comment">{t("selectedCount", {count: selectedIds.length, visible: filteredItems.length})}</p>
      </div>

      {filteredItems.map((p) => (
        <ConnectionListItem key={p.id} {...p} send={send} selected={selectedIds.includes(p.id)} onToggleSelected={toggleSelected}/>
      ))}

      <button
        onClick={() => navigate("/connection/new")}
        className="panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1"
      >
        <Cable/> <p>{t("newConnection")}</p>
      </button>
    </>
  );
}

function ConnectionListItem({ id, channel, message, compositionId, send, selected, onToggleSelected }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      onClick={() => onToggleSelected(id)}
      className={`panel1 flex content-between centered gap-3 !py-0 cursor-pointer transition-all ${selected ? "ring-2 ring-emerald-500 bg-emerald-500/10" : "hover:bg-neutral-800/40"}`}
    >
      <div className="flex items-start gap-3 w-full py-5">
        <div className="w-full">
          <p className="panel1-header">{t("sendTo")} {channel}</p>
          <p className="comment !text-neutral-300 font-bold">{message}</p>
        </div>
      </div>

      <div className="my-5 space-y-3 max-w-50 w-full" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => navigate("/connection/edit/" + id)}
          className="panel2 buttonstyle2 w-full flex centered space-x-1"
        >
          <PencilRuler /> <p>{t("edit")}</p>
        </button>
        <button
          type="button"
          onClick={() => send(id)}
          className="panel2 buttonstyle4 w-full flex centered space-x-1"
        >
          <ArrowBigRightDash/> <p>{t("send")}</p>
        </button>
      </div>
    </div>
  );
}
