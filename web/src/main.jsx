import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/dashboard.jsx';
import Landing from './pages/landing.jsx';
import { Toaster } from 'sonner';
import './i18n';
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

// leave empty if server serves static frontend
export const API_URL = "/api";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster position="bottom-center" />
      <Routes>
        <Route path="*" element={<Dashboard />} />
        <Route path="/login" element={<Landing />} />
        <Route path="/register" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'ja', label: '日本語', short: '日' },
    { code: 'zh-TW', label: '繁體中文', short: '繁' },
    { code: 'zh-CN', label: '简体中文', short: '简' },
    { code: 'ko', label: '한국어', short: '한' },
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="panel1 buttonstyle2 flex items-center gap-2 px-3 py-1.5 shadow-lg border border-black/5"
      >
        <Languages className="size-4 opacity-70" />
        <span className="text-xs font-bold uppercase tracking-wider">{currentLang.short}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 p-2 panel2 border border-black/5 shadow-2xl rounded-xl flex flex-col gap-1 min-w-[100px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                i18n.language === lang.code
                  ? "buttonstyle3"
                  : "hover:bg-black/5 text-gray-600"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
