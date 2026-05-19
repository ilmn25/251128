import '../../index.css';
import {CheckCircle2, XCircle, Loader2, ArrowLeft, Send, Hash} from "lucide-react";
import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {API_URL} from "../../main.jsx";
import { useTranslation } from "react-i18next";

function DiscordAttachmentGrid({ attachments }) {
  if (!attachments || attachments.length === 0) return null;

  const count = attachments.length;

  const renderItem = (item, className = "", imgClassName = "object-cover") => {
    const isImage = item.url && ["png","jpg","jpeg","gif","webp"].some(e => 
      (item.url || "").toLowerCase().endsWith(e) || (item.ext || "").toLowerCase().includes(e)
    );

    return (
      <div className={`rounded-md overflow-hidden bg-neutral-800 border border-neutral-700 flex items-center justify-center relative ${className}`}>
        {item.url ? (
          isImage ? (
            <img src={item.url} alt="Preview" className={`w-full h-full ${imgClassName}`} />
          ) : (
            <div className="p-2 flex flex-col items-center">
              <Hash className="w-4 h-4 text-neutral-500 mb-1" />
              <span className="text-[10px] text-neutral-400 truncate max-w-full px-1">{item.name}</span>
            </div>
          )
        ) : (
          <div className="p-4 bg-neutral-800 animate-pulse w-full h-full"></div>
        )}
      </div>
    );
  };

  if (count === 1) {
    return <div className="mt-2 w-full max-w-md">{renderItem(attachments[0], "h-auto", "object-contain")}</div>;
  }

  if (count === 2) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-1 aspect-[2/1] w-full max-w-lg">
        {renderItem(attachments[0], "h-full")}
        {renderItem(attachments[1], "h-full")}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="mt-2 grid grid-cols-3 grid-rows-2 gap-1 aspect-[3/2] w-full max-w-lg">
        <div className="col-span-2 row-span-2">
          {renderItem(attachments[0], "h-full")}
        </div>
        <div className="col-span-1 row-span-1">
          {renderItem(attachments[1], "h-full")}
        </div>
        <div className="col-span-1 row-span-1">
          {renderItem(attachments[2], "h-full")}
        </div>
      </div>
    );
  }

  if (count === 4) {
    return (
      <div className="mt-2 grid grid-cols-2 grid-rows-2 gap-1 aspect-square w-full max-w-lg">
        {attachments.map((att) => renderItem(att, "h-full"))}
      </div>
    );
  }

  if (count === 5) {
    return (
      <div className="mt-2 grid grid-cols-6 grid-rows-2 gap-1 aspect-[3/2] w-full max-w-lg">
        <div className="col-span-3 row-span-1">{renderItem(attachments[0], "h-full")}</div>
        <div className="col-span-3 row-span-1">{renderItem(attachments[1], "h-full")}</div>
        <div className="col-span-2 row-span-1">{renderItem(attachments[2], "h-full")}</div>
        <div className="col-span-2 row-span-1">{renderItem(attachments[3], "h-full")}</div>
        <div className="col-span-2 row-span-1">{renderItem(attachments[4], "h-full")}</div>
      </div>
    );
  }

  if (count === 6) {
    return (
      <div className="mt-2 grid grid-cols-3 grid-rows-2 gap-1 aspect-[3/2] w-full max-w-lg">
        {attachments.map((att) => (
          renderItem(att, "h-full")
        ))}
      </div>
    );
  }

  if (count === 7) {
    return (
      <div className="mt-2 grid grid-cols-3 grid-rows-10 gap-1 aspect-[3/5] w-full max-w-lg">
        <div className="col-span-3 row-span-4">
          {renderItem(attachments[0], "h-full")}
        </div>
        {attachments.slice(1, 7).map((att, idx) => (
          <div key={idx} className="col-span-1 row-span-2">
            {renderItem(att, "h-full")}
          </div>
        ))}
      </div>
    );
  }

  if (count === 8) {
    return (
      <div className="mt-2 grid grid-cols-4 grid-rows-2 gap-1 aspect-[2/1] w-full max-w-lg">
        {attachments.map((att) => (
          renderItem(att, "h-full")
        ))}
      </div>
    );
  }

  if (count === 9) {
    return (
      <div className="mt-2 grid grid-cols-3 grid-rows-3 gap-1 aspect-square w-full max-w-lg">
        {attachments.map((att) => renderItem(att, "h-full"))}
      </div>
    );
  }

  if (count >= 10) {
    return (
      <div className="mt-2 grid grid-cols-3 grid-rows-4 gap-1 aspect-[3/4] w-full max-w-lg">
        <div className="col-span-3 row-span-1">
          {renderItem(attachments[0], "h-full")}
        </div>
        {attachments.slice(1, 10).map((att, idx) => (
          <div key={idx} className="col-span-1 row-span-1">
            {renderItem(att, "h-full")}
          </div>
        ))}
      </div>
    );
  }

  return null;
}

export default function ConnectionStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [results, setResults] = useState([]);
  const [isSending, setIsSending] = useState(true);
  const [stats, setStats] = useState({ success: 0, fail: 0, total: 0 });

  const connectionIds = location.state?.connectionIds || [];

  useEffect(() => {
    if (connectionIds.length === 0) {
      navigate("/connection");
      return;
    }

    async function processBatch() {
      setStats(prev => ({ ...prev, total: connectionIds.length }));
      
      const newResults = [];
      let successCount = 0;
      let failCount = 0;

      for (const id of connectionIds) {
        // Find connection info if available in state for immediate display
        const connectionInfo = location.state?.connections?.find(c => c.id === id);
        
        const currentResult = {
          id,
          name: connectionInfo ? `${connectionInfo.channel}` : id,
          composition: connectionInfo ? location.state?.compositions?.find(c => c.compositionId === connectionInfo.compositionId) : null,
          status: 'pending'
        };
        
        setResults(prev => [...prev, currentResult]);

        try {
          const res = await fetch(`${API_URL}/send/${id}`, {
            method: "POST",
            credentials: "include"
          });
          const data = await res.json();
          
          const success = data.success;
          if (success) successCount++;
          else failCount++;

          setResults(prev => prev.map(item => 
            item.id === id ? { ...item, status: success ? 'success' : 'fail', error: data.error } : item
          ));
          setStats(prev => ({ ...prev, success: successCount, fail: failCount }));
        } catch (error) {
          failCount++;
          setResults(prev => prev.map(item => 
            item.id === id ? { ...item, status: 'fail', error: 'Network error' } : item
          ));
          setStats(prev => ({ ...prev, fail: failCount }));
        }
      }
      setIsSending(false);
    }

    processBatch();
  }, [connectionIds, navigate, location.state]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/connection")} 
          className="panel2 buttonstyle2 flex items-center gap-2 px-4 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </button>
        <div className="text-right">
          <p className="text-sm text-neutral-500">{t("status")}</p>
          <h2 className="text-2xl font-bold">{isSending ? t("sendingProgress") : t("sendingComplete")}</h2>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="panel1 flex flex-col items-center justify-center p-6 space-y-2">
          <p className="text-neutral-500 text-sm uppercase tracking-wider">{t("total")}</p>
          <p className="text-3xl font-mono">{stats.total}</p>
        </div>
        <div className="panel1 flex flex-col items-center justify-center p-6 space-y-2 border-b-2 border-emerald-500">
          <p className="text-emerald-500 text-sm uppercase tracking-wider">{t("success")}</p>
          <p className="text-3xl font-mono text-emerald-500">{stats.success}</p>
        </div>
        <div className="panel1 flex flex-col items-center justify-center p-6 space-y-2 border-b-2 border-rose-500">
          <p className="text-rose-500 text-sm uppercase tracking-wider">{t("fail")}</p>
          <p className="text-3xl font-mono text-rose-500">{stats.fail}</p>
        </div>
      </div>

      <div className="panel1 overflow-hidden">
        <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
          <p className="font-semibold flex items-center gap-2">
            <Send className="w-4 h-4" />
            {t("sendingLog")}
          </p>
          {isSending && (
            <div className="flex items-center gap-2 text-sm text-sky-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("sendingWait")}
            </div>
          )}
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          {results.length === 0 ? (
             <div className="p-8 text-center text-neutral-500 italic">
               {t("preparingBatch")}
             </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {[...results].reverse().map((result) => (
                <div key={result.id} className="p-4 flex items-center justify-between hover:bg-neutral-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    {result.status === 'pending' && <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />}
                    {result.status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {result.status === 'fail' && <XCircle className="w-5 h-5 text-rose-500" />}
                    <div>
                      <p className="text-sm font-medium">{result.name}</p>
                      {result.error && <p className="text-xs text-rose-400 mt-1">{result.error}</p>}
                      
                      {/* Discord-like Preview */}
                      {result.composition && (
                        <div className="mt-3 p-4 bg-[#2b2d31] rounded-lg border border-neutral-700 max-w-md">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                              </svg>
                            </div>
                            <div className="flex-grow space-y-1 overflow-hidden">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">
                                  {location.state?.profileName || t("profile")}
                                </span>
                                <span className="text-[10px] text-neutral-400">
                                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-sm text-[#dbdee1] break-words whitespace-pre-wrap">
                                {result.composition.messages[Math.floor(Math.random() * result.composition.messages.length)]}
                              </p>
                              <DiscordAttachmentGrid 
                                attachments={
                                  result.composition.randomize 
                                    ? [...result.composition.attachments].sort(() => 0.5 - Math.random()).slice(0, result.composition.count)
                                    : result.composition.attachments.slice(0, result.composition.count)
                                } 
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {!isSending && (
        <div className="flex justify-center pt-4">
          <button 
            onClick={() => navigate("/connection")} 
            className="panel2 buttonstyle4 flex items-center gap-2 px-8 py-3"
          >
            {t("finish")}
          </button>
        </div>
      )}
    </div>
  );
}
