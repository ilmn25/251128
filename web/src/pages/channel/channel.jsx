import '../../index.css';
import React, {useEffect} from "react";
import {Navigate, Route, Routes, useNavigate} from "react-router-dom";
import {ChannelNew} from "./channel_new.jsx";
import {ChannelEdit} from "./channel_edit.jsx";
import ChannelList from "./channel_list.jsx";
import Cookies from "js-cookie";

export default function Channel() {
  const navigate = useNavigate();

  useEffect(() => {
    const profile = Cookies.get("profile"); // get cookie by name
    if (!profile) {
      console.error("No profile selected");
      navigate("/profile");
    }
  }, [navigate]);

  return (
    <div className="space-y-4">
      <Routes>
        <Route path="/channel/" element={<ChannelList/>} />
        <Route path="/channel/new" element={<ChannelNew/>} />
        <Route path="/channel/edit/:channelId" element={<ChannelEdit/>} />
        <Route path="*" element={<Navigate to="/channel" replace />} />
      </Routes>
    </div>
  );
}

