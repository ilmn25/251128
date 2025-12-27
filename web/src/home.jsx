import { useState, useEffect } from "react";
import "./index.css";
import Dashboard from "./pages/dashboard.jsx";
import Landing from "./pages/landing.jsx";

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
        <div>Loading...</div>
      ) : user !== null ? (
        <Dashboard/>
      ) : (
        <Landing refresh={refresh}/>
      )}
    </>
  );
}
