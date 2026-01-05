import '../../index.css';

import {SaveIcon, Shield, Trash} from "lucide-react";
import React, {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {toast} from "sonner";
import {SERVER_URL} from "../../main.jsx";
import Cookies from "js-cookie";

export default function ProfileEdit() {
  const { accountId } = useParams();
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  async function submit() {
    if (!token || !token.includes("."))
      return toast.error("Please enter a valid token");

    const res = await fetch(SERVER_URL + "/profile", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({accountId, token}),
    });

    const data = await res.json();
    if (data.success) {
      Cookies.set("profile", accountId, { expires: 365, path: "/" });
      toast.success("Changes saved sucessfully");
      navigate("/profile");
    } else {
      toast.error(data.error);
    }
  }

  async function Delete() {
    const res = await fetch(SERVER_URL + "/profile/" + accountId, {
      method: "DELETE",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
    });

    const data = await res.json();
    if (data.success) {
      toast.success("Changes saved sucessfully");
      navigate("/profile");
    } else {
      toast.error(data.error);
    }
  }

  return (
    <div>
      <div className="panel1 space-y-3">
        <div>
          <p className="panel1-header py-1">{accountId? "Update Profile Token" : "New Profile"}</p>
          {accountId && <p className="comment">ID: {accountId}</p>}
        </div>

        <div className="panel2 flex space-x-4 !p-4">
          <Shield className="comment !size-6"></Shield>
          <div className="space-y-2" >
            <p>Security Warning</p>
            <ul className="comment list-disc pl-5 space-y-1">
              <li>Your Discord token allows communicating with the Discord API to send messages, read messages, and more.</li>
              <li>Tokens are encrypted before being stored in the cloud</li>
              <li>Automated messaging (Self-Bots) may violate Discord's Terms of Service</li>
              <li>Never share your token with anyone you don't trust</li>
            </ul>
          </div>
        </div>

        <div className="justify-between">
          <input
            className="panel2 input font-mono"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value.trim())}
            placeholder="Enter Discord Session Token and press Submit..."
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => submit()} className={`panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1`} >
          <SaveIcon></SaveIcon> <p>Save</p>
        </button>
        {accountId === null && <button onClick={() => Delete()} className={`panel2 buttonstyle5 w-50 !my-5 flex centered space-x-1`} >
          <Trash></Trash> <p>Delete</p>
        </button>}
      </div>
    </div>
  );
}
