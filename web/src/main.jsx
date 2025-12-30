import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Dashboard from "./pages/dashboard.jsx";
import Landing from "./pages/landing.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Dashboard/>} />
        <Route path="/login" element={<Landing/>} />
        <Route path="/register" element={<Landing/>} />
      </Routes>
    </BrowserRouter>
)
