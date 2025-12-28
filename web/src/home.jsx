import { useState, useEffect } from "react";
import "./index.css";
import Dashboard from "./pages/dashboard.jsx";
import Landing from "./pages/landing.jsx";
import {MessageCircle} from "lucide-react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const res = await fetch("http://localhost:8000/user/info", {
      credentials: "include"
    });
    const data = await res.json();

    if (data.success) {
      setUser(data);
    } else {
      setUser(null);
    }
    setLoading(false);
  }

  useEffect(() => {(async () => {await refresh()})()}, []);

  return (
    <>
      {loading ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="p-4 bg-white rounded-2xl">
            <MessageCircle className="text-black size-13"></MessageCircle>
          </div>
          <p className="text-3xl font-bold m-4 text-center">Discord Message Automation Tool</p>
          <p className="text-1xl text-neutral-500 mb-7 text-center">
            Automate sending hiring posts on commission boards, sharing new social media posts, and more! <br/>
            <br/> Made by illu
            <br/> <br/> Connecting to Server...</p>
        </div>
      ) : user !== null ? (
        <Dashboard/>
      ) : (
        <Landing refresh={refresh}/>
      )}
    </>
  );
}
