import '../index.css';
import { useState } from "react";
import PasswordInput from "../components/password_panel.jsx";
import { MessageCircle, GitCommit } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_URL } from "../main.jsx";
import { useTranslation } from "react-i18next";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  async function login() {
    const res = await fetch(API_URL + "/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });
    const data = await res.json();
    if (data.success) {
      toast.success(t("toastLoginSuccess"));
      navigate("/");
    } else {
      toast.error(data.error);
    }
  }

  async function register() {
    const res = await fetch(API_URL + "/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });
    const data = await res.json();
    if (data.success) {
      toast.success(t("toastRegisterSuccess"));
      navigate("/login");
    } else {
      toast.error(data.error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen ">
      <div className="p-4 bg-white rounded-2xl">
        <MessageCircle className="text-black size-13" />
      </div>
      <p className="text-3xl font-bold m-2 text-center">{t("title")}</p>
      <div className="text-1xl text-neutral-500 mb-7 text-center max-w-100 space-y-2">
        <p>{t("description1")}</p>
        <p>{t("description2")}</p>
      </div>
      <div className="panel1 min-2xl space-y-4 max-w-120">
        <div className="flex space-x-2">
          <button
            onClick={() => navigate("/login")}
            className={`panel2 w-full ${
              location.pathname === "/login" ? "buttonstyle3" : "buttonstyle2"
            }`}
          >
            {t("login")}
          </button>
          <button
            onClick={() => navigate("/register")}
            className={`panel2 w-full ${
              location.pathname === "/register" ? "buttonstyle3" : "buttonstyle2"
            }`}
          >
            {t("register")}
          </button>
        </div>

        <p className="panel2-header">{t("email")}</p>
        <input
          className="panel2 input"
          placeholder="example@gmail.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <p className="panel2-header">{t("password")}</p>
        <PasswordInput
          className="panel2 input"
          placeholder={t("password")}
          value={password}
          setValue={setPassword}
        />

        <button onClick={() => {location.pathname === "/login" ? login() : register();}} className={`panel2 w-full centered buttonstyle4`}>
          {location.pathname === "/login" ? t("login") : t("register")}
        </button>

        <div className="panel2 flex space-x-2 !p-4">
          <GitCommit className="comment !size-6" />
          <p className="comment">{t("createdBy")}</p>
        </div>
      </div>
    </div>
  );
}
