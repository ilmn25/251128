import '../index.css';

import { useState } from "react";
import PasswordInput from "../components/password_panel.jsx";
import {MessageCircle, GitCommit} from "lucide-react";
import {useLocation, useNavigate} from "react-router-dom";
import {toast} from "sonner";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  async function login() {
    const res = await fetch("http://localhost:8000/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Account created successfully");
      navigate("/");
    }
    else toast.error(data.error)
  }

  async function register() {
    const res = await fetch("http://localhost:8000/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Account created successfully");
      navigate("/");
    }
    else toast.error(data.error)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen ">
      <div className="p-4 bg-white rounded-2xl">
        <MessageCircle className="text-black size-13"></MessageCircle>
      </div>
      <p className="text-3xl font-bold m-2 text-center">Discord Message Automation Tool</p>
      <div className="text-1xl text-neutral-500 mb-7 text-center max-w-100 space-y-2">
        <p>Automate sending hiring posts on commission boards, sharing new social media posts, and more!</p>
        <p> Made by illu</p>
      </div>
      <div className="panel1 min-2xl space-y-4 max-w-120">
        <div className="flex space-x-2">
          <button
            onClick={() => navigate("/login")}
            className={`panel2 w-full ${
              location.pathname === "/login" ? "buttonstyle3" : "buttonstyle2"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className={`panel2 w-full ${
              location.pathname === "/register" ? "buttonstyle3" : "buttonstyle2"
            }`}
          >
            Register
          </button>
        </div>

        <p className="panel2-header">Email Address</p>
        <input
          className="panel2 input"
          placeholder="example@gmail.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <p className="panel2-header">Password</p>
        <PasswordInput
          className="panel2 input"
          placeholder="Password"
          value={password}
          setValue={setPassword}
        />
        <button onClick={() => {location.pathname === "/login"? login() : register()}} className={`panel2 w-full centered buttonstyle4`}>
          {location.pathname === "/login"? "Login" : "Register"}
        </button>

        <div className="panel2 flex space-x-2 !p-4">
          <GitCommit className="comment !size-6"></GitCommit> <p className="comment">Created by illu for personal use and showcase, built with React, FastAPI, and MongoDB.</p>
        </div>
      </div>
    </div>
  );
}

