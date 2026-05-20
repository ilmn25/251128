import '../../index.css';
import React from 'react';
import {Route, Routes, Navigate} from "react-router-dom";
import ConnectionStatus from "./connection_status.jsx";

export default function Connection() {
  return (
    <div className="space-y-4">
      <Routes>
        <Route path="status" element={<ConnectionStatus />} />
        <Route path="*" element={<Navigate to="/composition" replace />} />
      </Routes>
    </div>
  );
}
