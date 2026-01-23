import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/dashboard.jsx';
import Landing from './pages/landing.jsx';
import { Toaster } from 'sonner';
import './i18n';
import {useTranslation} from "react-i18next";

// leave empty if server serves static frontend
export const API_URL = "/api";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster position="bottom-center" />
      <LanguageToggle />
      <Routes>
        <Route path="*" element={<Dashboard />} />
        <Route path="/login" element={<Landing />} />
        <Route path="/register" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

function LanguageToggle() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="absolute top-4 right-4 flex gap-2">
      <button
        onClick={() => changeLanguage("en")}
        className={`panel2 px-3 py-1 rounded ${
          i18n.language === "en" ? "buttonstyle3" : "buttonstyle2"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage("zh")}
        className={`panel2 px-3 py-1 rounded ${
          i18n.language === "zh" ? "buttonstyle3" : "buttonstyle2"
        }`}
      >
        中
      </button>
    </div>
  );
}
