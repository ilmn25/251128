import '../../index.css';
import React from 'react';
import ChannelEdit from "./channel_edit.jsx";
import {Route, Routes} from "react-router-dom";

export default function Channel() {
  return (
    <div className="space-y-4">
      <Routes>
        <Route path="/channel/edit/:channelId" element={<ChannelEdit/>} />
      </Routes>
    </div>
  );
}
