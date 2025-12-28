import '../index.css';

import { useState } from "react";
import PasswordInput from "../components/password_panel.jsx";
import {MessageCircle, Shield} from "lucide-react";

const Tabs = {
  LOGIN: "LOGIN",
  REGISTER: "REGISTER",
};

export default function Landing({refresh}) {
  const [selected, setSelected] = useState(Tabs.LOGIN);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const res = await fetch("http://localhost:8000/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include" // important for cookies
    });
    const data = await res.json();
    console.log("Login response:", data);
    refresh();
  }

  async function register() {
    const res = await fetch("http://localhost:8000/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    console.log("Register response:", data);
    refresh();
  }

  return (
    <div className="flex flex-col items-center justify-center h-1/2">
      <div className="p-4 bg-white rounded-2xl">
        <MessageCircle className="text-black size-13"></MessageCircle>
      </div>
      <p className="text-3xl font-bold m-4 text-center">Discord Message Automation Tool</p>
      <p className="text-1xl text-neutral-500 mb-7 text-center">
        Automate sending hiring posts on commission boards, sharing new social media posts, and more!
        <br/> <br/> Made by illu
      </p>
      <div className="panel1 min-2xl space-y-4">
        <div className="flex space-x-2">
          <button onClick={() => setSelected(Tabs.LOGIN)} className={`panel2 w-full ${selected === Tabs.LOGIN ? "buttonstyle3" : "buttonstyle2"}`}>Login</button>
          <button onClick={() => setSelected(Tabs.REGISTER)} className={`panel2 w-full ${selected === Tabs.REGISTER ? "buttonstyle3" : "buttonstyle2"}`}>Register</button>
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
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={() => {selected === Tabs.LOGIN? login() : register()}} className={`panel2 w-full centered buttonstyle4`}>{selected === Tabs.LOGIN? "Login" : "Register"}</button>

        <div className="panel2 flex space-x-2 !p-4">
          <Shield className="comment !size-6"></Shield> <p className="comment">Created by illu for personal use and showcase, built with React, FastAPI, and MongoDB.</p>
        </div>
      </div>
    </div>
  );
}

