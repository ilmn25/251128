import '../index.css';

import Composition from "./composition/composition.jsx";
import React, {useEffect, useState} from "react";
import Profile from "./profile/profile.jsx";
import {useLocation, useNavigate, Routes, Route, Navigate} from "react-router-dom";
import Loading from "../components/loading.jsx";
import {MessageCircle, FolderOpen, Database, LogOut} from "lucide-react";
import Connection from "./connection/connection.jsx";
import Channel from "./channel/channel.jsx";
import {toast} from "sonner";
import {API_URL, LanguageToggle} from "../main.jsx";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  async function openLocation(type) {
    try {
      const res = await fetch(`${API_URL}/system/open?type=${type}`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || t("openingLocation"), {
          description: `Internal path: ${data.path}`,
          duration: 5000
        });
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error(t("toastFetchError"));
    }
  }

  async function handleLogout() {
    await fetch(`${API_URL}/user/logout`, { method: "POST", credentials: "include" });
    navigate("/login");
  }

  useEffect(() => {
    (async () => {
      const res = await fetch(API_URL + "/user/info", {
        method: "GET",
        credentials: "include"
      });
      const data = await res.json();

      if (data.success) {
        setUser(data);
        if (location.pathname === "/") navigate("/composition");
      } else {
        toast.error(data.error || t("toastFetchError"));
        navigate("/login");
      }
    })();
  }, [location.pathname, navigate, t]);

  if (!user) return <Loading/>;

  return (
    <div className="space-y-4 w-full p-12 h-screen">

      <div className="flex items-center gap-5 pb-5">
        <div className="flex flex-wrap gap-2">
          <div className="p-3 bg-white rounded-2xl aspect-square w-13 h-13">
            <MessageCircle className="text-black size-7" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{t("title")}</p>
            <p className="comment">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/composition")}
            className={`panel1 ${location.pathname.startsWith("/composition") ? "buttonstyle3" : "buttonstyle2"}`}
          >
            {t("composition")}
          </button>
          <button
            onClick={() => navigate("/profile")}
            className={`panel1 ${location.pathname.startsWith("/profile") ? "buttonstyle3" : "buttonstyle2"}`}
          >
            {t("profile")}
          </button>
        </div>

        <div className="flex gap-2 ml-auto">
          <LanguageToggle />
          <button
            onClick={handleLogout}
            className="panel1 buttonstyle5 flex items-center gap-2 !bg-rose-500/10 hover:!bg-rose-500/20 !text-rose-500 !border-rose-500/20"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>

      <Routes>
        <Route path="/composition/*" element={<Composition/>} />
        <Route path="/profile/*" element={<Profile/>} />
        <Route path="/connection/*" element={<Connection/>} />
        <Route path="/channel/*" element={<Channel/>} />
        <Route path="/" element={<Navigate to="/composition" replace />} />
      </Routes>
    </div>
  );
}
