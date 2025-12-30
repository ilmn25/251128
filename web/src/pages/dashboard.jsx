import '../index.css';

import Composition from "./composition/composition.jsx";
import React, {useEffect, useState} from "react";
import Profile from "./profile/profile.jsx";
import {useLocation, useNavigate} from "react-router-dom";
import Loading from "../components/loading.jsx";
import {MessageCircle} from "lucide-react";
import Channel from "./channel/channel.jsx";
import Connection from "./connection/connection.jsx";


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:8000/user/info", {
        method: "GET",
        credentials: "include"
      });
      const data = await res.json();

      if (data.success) {
        setUser(data);
        if (location.pathname === "/") navigate("/composition");
      } else {
        console.error(data.error);
        navigate("/login");
      }
    })();
  }, [location.pathname, navigate]);

  if (!user) return <Loading/>

  return (
    <div className="space-y-4 w-full p-12 h-screen">

      <div className="flex items-center gap-5 pb-5">
        <div className="p-3 bg-white rounded-2xl aspect-square w-13 h-13">
          <MessageCircle className="text-black size-7"></MessageCircle>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold">Discord Message Automation Tool</p>
          <p className="comment">User ID: {user.id}</p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => navigate("/composition")}
          className={`panel1 ${location.pathname === "/composition" ? "buttonstyle3" : "buttonstyle2"}`}
        >
          Compositions
        </button>
        <button
          onClick={() => navigate("/profile")}
          className={`panel1 ${location.pathname === "/profile" ? "buttonstyle3" : "buttonstyle2"}`}
        >
          Profiles
        </button>
        <button
          onClick={() => navigate("/channel")}
          className={`panel1 ${location.pathname === "/channel" ? "buttonstyle3" : "buttonstyle2"}`}
        >
          Channels
        </button>
        <button
          onClick={() => navigate("/connection")}
          className={`panel1 ${location.pathname === "/connection" ? "buttonstyle3" : "buttonstyle2"}`}
        >
          Connections
        </button>
      </div>

      {location.pathname.startsWith("/composition") && <Composition/>}
      {location.pathname.startsWith("/channel") && <Channel/>}
      {location.pathname.startsWith("/profile") && <Profile/>}
      {location.pathname.startsWith("/connection") && <Connection/>}
    </div>
  );
}

