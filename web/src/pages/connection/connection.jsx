import '../../index.css';
import React from 'react';
import ConnectionEdit from "./connection_edit.jsx";
import {Route, Routes, Navigate} from "react-router-dom";
import ConnectionList from "./connection_list.jsx";

export default function Connection() {
  return (
    <div className="space-y-4">
      <Routes>
        <Route path="/connection" element={<ConnectionList />} />
        <Route path="/connection/new" element={<ConnectionEdit />} />
        <Route path="/connection/edit/:connectionId" element={<ConnectionEdit />} />
        <Route path="*" element={<Navigate to="/connection" replace />} />
      </Routes>
    </div>
  );
}
