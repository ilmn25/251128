import '../../index.css';
import React from 'react';
import ProfileEdit from "./profile_edit.jsx";
import {Route, Routes} from "react-router-dom";
import ProfileList from "./profile_list.jsx";

export default function Profile() {
  return (
    <div className="space-y-4">
      <Routes>
        <Route path="/profile" element={<ProfileList/>} />
        <Route path="/profile/new" element={<ProfileEdit/>} />
        <Route path="/profile/edit/:accountId" element={<ProfileEdit/>} />
      </Routes>
    </div>
  );
}
