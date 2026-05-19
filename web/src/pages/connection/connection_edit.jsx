import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {PencilRuler, Repeat, SaveIcon, Shuffle, ArrowBigRightDash, Trash} from "lucide-react";
import {toast} from "sonner";
import {API_URL} from "../../main.jsx";
import { useTranslation } from "react-i18next";

const MODE = {
  DEFAULT: "DEFAULT",
  CHANNEL: "CHANNEL",
  COMPOSITION: "COMPOSITION",
};

export default function ConnectionEdit() {
  const navigate = useNavigate();
  const {connectionId} = useParams();
  const [selectedChannelIds, setSelectedChannelIds] = useState([]);
  const [composition, setComposition] = useState(null);

  const [compositions, setCompositions] = useState([]);
  const [channels, setChannels] = useState([]);
  const [mode, setMode] = useState(MODE.DEFAULT);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchChannelsAndCompositions() {
      // channels
      let res = await fetch(API_URL + "/channel", {
        method: "GET",
        credentials: "include"
      });
      let data = await res.json();
      if (data.success) {
        if (data.items.length === 0) navigate("/channel/new");
        else setChannels(data.items);
      }

      // compositions
      res = await fetch(API_URL + "/composition", {
        method: "GET",
        credentials: "include"
      });
      data = await res.json();
      if (data.success) {
        if (data.items.length === 0) navigate("/composition/new");
        else setCompositions(data.items);
      }
    }

    fetchChannelsAndCompositions();
  }, [navigate]);

  useEffect(() => {
    async function fetchConnection() {
      if (!connectionId) {
        if (channels.length > 0) setSelectedChannelIds([]);
        setComposition(compositions[0]);
        return;
      }

      const res = await fetch(API_URL + `/connection/${connectionId}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedChannelIds([data.item.channelId]);
        setComposition(compositions.find(comp => comp.compositionId === data.item.compositionId));
      } else {
        navigate("/connection/new");
        toast.error(data.error || t("toastFetchError"));
      }
    }

    if (channels.length > 0 && compositions.length > 0) {
      fetchConnection();
    }
  }, [channels, compositions, connectionId, navigate, t]);

  const selectedChannels = channels.filter(c => selectedChannelIds.includes(c.id));

  if (!composition || (connectionId && selectedChannels.length === 0)) return null;

  async function submit() {
    if (selectedChannelIds.length === 0) {
      toast.error(t("selectAtLeastOneChannel"));
      return;
    }

    setMode(MODE.DEFAULT); // Close modes if open
    
    let successCount = 0;
    let failCount = 0;

    for (const channelId of selectedChannelIds) {
      try {
        const res = await fetch(API_URL + "/connection", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          credentials: "include",
          body: JSON.stringify({
            id: connectionId, // will be null if batch
            channelId: channelId, 
            compositionId: composition.compositionId
          }),
        });
        const data = await res.json();
        if (data.success) successCount++;
        else failCount++;
      } catch (e) {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(t("toastSubmitSuccess"));
      navigate("/connection");
    } else {
      toast.error(t("toastSubmitError"));
    }
  }

  function toggleChannel(id) {
    if (connectionId) {
      // In edit mode, we can only have one
      setSelectedChannelIds([id]);
      setMode(MODE.DEFAULT);
    } else {
      setSelectedChannelIds(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    }
  }

  function selectAllChannels() {
    setSelectedChannelIds(channels.map(c => c.id));
  }

  function clearChannels() {
    setSelectedChannelIds([]);
  }

  async function Delete() {
    const res = await fetch(API_URL + "/connection/" + connectionId, {
      method: "DELETE",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
    });

    const data = await res.json();
    if (data.success) {
      toast.success(t("toastDeleteSuccess"));
      navigate("/connection");
    } else {
      toast.error(data.error);
    }
  }

  return (
    <div>
      <div className="panel1 space-y-3 ">
        <div className="flex justify-between items-center">
          <p className="panel1-header">{t("connection")}</p>
          {mode === MODE.CHANNEL && !connectionId && (
            <div className="flex gap-2">
              <button onClick={selectAllChannels} className="text-xs text-sky-400 hover:text-sky-300 transition-colors uppercase font-bold tracking-widest">{t("selectAll")}</button>
              <span className="text-neutral-700">|</span>
              <button onClick={clearChannels} className="text-xs text-rose-400 hover:text-rose-300 transition-colors uppercase font-bold tracking-widest">{t("clearSelection")}</button>
            </div>
          )}
        </div>

        {mode === MODE.CHANNEL ? (
          <div className="space-y-2">
            <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {channels.map((p) => (
                <ChannelListItem 
                  key={p.id} 
                  item={p} 
                  isSelected={selectedChannelIds.includes(p.id)} 
                  toggleChannel={() => toggleChannel(p.id)}
                />
              ))}
            </div>
            {!connectionId && (
               <div className="pt-4 flex justify-end">
                 <button
                   onClick={() => setMode(MODE.DEFAULT)}
                   className="panel2 buttonstyle4 px-8 py-2"
                 >
                   {t("done")} ({selectedChannelIds.length})
                 </button>
               </div>
            )}
          </div>
        ) : mode === MODE.COMPOSITION ? (
          <>
            {compositions.map((c) => (
              <CompositionListItem key={c.compositionId} item={c} setComposition={setComposition} setMode={setMode}/>
            ))}
          </>
        ) : (
          <>
            <div className="panel2 flex content-between centered gap-3">
              <div className="w-full">
                <p className="panel1-header">
                  {connectionId 
                    ? (selectedChannels[0]?.name || t("selectChannel"))
                    : selectedChannels.length > 0 
                      ? `${selectedChannels.length} ${t("channelsSelected")}`
                      : t("noChannelsSelected")
                  }
                </p>
                {selectedChannels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedChannels.slice(0, 5).map(c => (
                      <span key={c.id} className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded border border-neutral-700">
                        {c.name}
                      </span>
                    ))}
                    {selectedChannels.length > 5 && (
                      <span className="text-[10px] text-neutral-500 flex items-center px-1">
                        + {selectedChannels.length - 5} {t("more")}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="my-5 space-y-3 max-w-50 w-full">
                <button
                  type="button"
                  onClick={() => setMode(MODE.CHANNEL)}
                  className="panel2 buttonstyle2 w-full flex centered space-x-1"
                >
                  <PencilRuler/> <p>{t("change")}</p>
                </button>
              </div>
            </div>

            <div className="panel2 flex content-between centered gap-3">
              <div className="w-full">
                <div className="panel1-header flex justify-start gap-2 items-center">
                  <p>{composition.messages[0]}</p>
                  {composition.randomize ? (
                    <Shuffle className="size-4"/>
                  ) : (
                    <Repeat className="size-4"/>
                  )}
                </div>
                <p className="comment">
                  {t("selectAttachments", { count: composition.count, attachmentCount: composition.attachmentCount || composition.attachments?.length || 0 })}
                </p>
              </div>

              <div className="my-5 space-y-3 max-w-50 w-full">
                <button
                  type="button"
                  onClick={() => setMode(MODE.COMPOSITION)}
                  className="panel2 buttonstyle2 w-full flex centered space-x-1"
                >
                  <PencilRuler/> <p>{t("change")}</p>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={submit} className="panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1">
          <SaveIcon/> <p>{t("save")}</p>
        </button>
        {connectionId && <button onClick={Delete} className="panel2 buttonstyle5 w-50 !my-5 flex centered space-x-1">
          <Trash/> <p>{t("delete")}</p>
        </button>}
      </div>
    </div>
  );
}

function ChannelListItem({ item, isSelected, toggleChannel }) {
  const { t } = useTranslation();
  return (
    <div 
      onClick={toggleChannel}
      className={`panel2 flex content-between centered gap-3 !py-0 cursor-pointer transition-all ${
        isSelected ? "border-sky-500 bg-sky-500/5 shadow-[0_0_10px_rgba(14,165,233,0.1)]" : "hover:bg-neutral-800"
      }`}
    >
      <div className="w-full py-4">
        <p className={`panel1-header transition-colors ${isSelected ? "text-sky-400" : ""}`}>{item.name}</p>
        <p className="comment text-[10px] opacity-50">ID: {item.id || item.channelId}</p>
      </div>

      <div className="my-5 flex items-center justify-end pr-4">
        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
          isSelected ? "bg-sky-500 border-sky-500" : "border-neutral-700"
        }`}>
          {isSelected && <ArrowBigRightDash className="w-4 h-4 text-white" />}
        </div>
      </div>
    </div>
  );
}

function CompositionListItem({ item, setComposition, setMode }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="panel2 flex content-between centered gap-3">
        <div className="w-full">
          <div className="panel1-header flex justify-start gap-2 items-center">
            <p className="">{item.message || item.messages?.[0]}</p>
            {item.randomize ? (
              <Shuffle className="size-4"/>
            ) : (
              <Repeat className="size-4"/>
            )}
          </div>
          <p className="comment">
            {t("selectAttachments", { count: item.count, attachmentCount: item.attachmentCount || item.attachments?.length || 0 })}
          </p>
          <p className="comment text-[10px] opacity-50">ID: {item.compositionId}</p>
        </div>

        <div className="my-5 space-y-3 max-w-50 w-full">
          <button
            type="button"
            onClick={() => {
              setMode(MODE.DEFAULT);
              setComposition(item);
            }}
            className="panel2 buttonstyle4 w-full flex centered space-x-1"
          >
            <ArrowBigRightDash/> <p>{t("select")}</p>
          </button>
        </div>
      </div>
    </div>
  );
}
