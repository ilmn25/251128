import '../../index.css';
import {CheckCircle2, XCircle, Loader2, ArrowLeft, Send} from "lucide-react";
import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {API_URL} from "../../main.jsx";
import { useTranslation } from "react-i18next";

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
          name: connectionInfo ? `${connectionInfo.channel} (${connectionInfo.message})` : id,
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
                    </div>
                  </div>
                  <div className="text-xs font-mono text-neutral-500">
                    ID: {result.id.substring(0, 8)}...
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
