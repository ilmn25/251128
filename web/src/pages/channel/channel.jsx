import '../../index.css';
import React, {useEffect} from "react";
import {Route, Routes, useNavigate} from "react-router-dom";
import {ChannelNew} from "./channel_new.jsx";
import {ChannelEdit} from "./channel_edit.jsx";
import ChannelList from "./channel_list.jsx";
import Loading from "../../components/loading.jsx";

export default function Channel() {
  const navigate = useNavigate();

  useEffect(() => {
    const cookies = document.cookie.split(";").map(c => c.trim());
    if (!cookies.some(c => c.startsWith("profile="))) {
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
      </Routes>
    </div>
  );
}

