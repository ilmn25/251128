import '../../index.css';
import React, { useEffect, useState } from 'react';
import {Route, Routes, Navigate, useNavigate} from "react-router-dom";
import CompositionList from "./composition_list.jsx";
import CompositionEdit from "./composition_edit.jsx";
import Cookies from "js-cookie";
import { User, ShieldAlert, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Composition() {
  const [profileId, setProfileId] = useState(Cookies.get("profile"));
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const checkProfile = () => {
      setProfileId(Cookies.get("profile"));
    };
    
    // Check every second or on focus to react to selection changes
    const interval = setInterval(checkProfile, 1000);
    window.addEventListener('focus', checkProfile);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkProfile);
    };
  }, []);

  if (!profileId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-500">
        <div className="panel1 max-w-md w-full p-10 text-center space-y-6 border-2 border-amber-500/20 bg-amber-500/5 backdrop-blur-sm">
          <div className="mx-auto w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 mb-2">
            <ShieldAlert className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">
              {t("profileRequired")}
            </h2>
            <p className="text-sm text-neutral-400 font-medium leading-relaxed">
              {t("profileRequiredDesc")}
            </p>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="w-full panel2 buttonstyle4 flex items-center justify-center gap-3 py-4 text-lg font-bold group"
          >
            <User className="w-5 h-5" />
            {t("goToProfiles")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Routes>
        <Route index element={<CompositionList />} />
        <Route path="new" element={<CompositionEdit />} />
        <Route path="edit/:compositionId" element={<CompositionEdit />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </div>
  );
}
