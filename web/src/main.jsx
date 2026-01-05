import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Dashboard from "./pages/dashboard.jsx";
import Landing from "./pages/landing.jsx";
import { Toaster } from 'sonner'

// leave empty if server serves static frontend
export const API_URL = "/api";

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <BrowserRouter>
      <Toaster position="bottom-center" />
      <Routes>
        <Route path="*" element={<Dashboard/>} />
        <Route path="/login" element={<Landing/>} />
        <Route path="/register" element={<Landing/>} />
      </Routes>
    </BrowserRouter>
)
