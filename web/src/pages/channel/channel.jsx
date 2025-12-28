import '../../index.css';
import React from "react";
import {Route, Routes} from "react-router-dom";
import {ChannelNew} from "./channel_new.jsx";
import {ChannelEdit} from "./channel_edit.jsx";
import ChannelList from "./channel_list.jsx";

export default function Channel() {
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

