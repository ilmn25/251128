import '../../index.css';
import React from 'react';
import ProfileEdit from "./profile_edit.jsx";
import {Route, Routes} from "react-router-dom";
import ProfileList from "./profile_list.jsx";

export default function Profile() {
  return (
    <div className="space-y-4">
      <Routes>
        <Route index element={<ProfileList/>} />
        <Route path="new" element={<ProfileEdit/>} />
        <Route path="edit/:accountId" element={<ProfileEdit/>} />
      </Routes>
    </div>
  );
}
