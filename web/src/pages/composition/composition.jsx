import '../../index.css';
import React from 'react';
import {Route, Routes, Navigate} from "react-router-dom";
import CompositionList from "./composition_list.jsx";
import CompositionEdit from "./composition_edit.jsx";

export default function Composition() {
  return (
    <div className="space-y-4">
      <Routes>
        <Route path="/composition" element={<CompositionList />} />
        <Route path="/composition/new" element={<CompositionEdit />} />
        <Route path="/composition/edit/:compositionId" element={<CompositionEdit />} />
        <Route path="*" element={<Navigate to="/composition" replace />} />
      </Routes>
    </div>
  );
}
