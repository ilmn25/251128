import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import Toggle from "../../components/toggle.jsx";
import {SaveIcon} from "lucide-react";
import {toast} from "sonner";
import {SERVER_URL} from "../../main.jsx";

export function ChannelEdit() {
  const navigate = useNavigate();
  const {channelId} = useParams();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [attachmentPerm, setAttachmentPerm] = useState(true);
  const [linkFilter, setLinkFilter] = useState(false);
  const [mediaFilter, setMediaFilter] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!channelId) {
        navigate("/channel/new");
        return;
      }
      const res = await fetch(SERVER_URL + "/channel/" + channelId, {
        method: "GET",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
      })

      const data = await res.json();
      if (data.success) {
        setId(data.item.id);
        setName(data.item.name);
        setCooldown(data.item.cooldown);
        setAttachmentPerm(data.item.attachmentPerm);
        setLinkFilter(data.item.linkFilter);
        setMediaFilter(data.item.mediaFilter);
      } else {
        navigate("/channel/new");
        toast.error(data.error || "Failed to fetch channel info");
      }
    }

    fetchData();
  }, [channelId, navigate]);

  async function submit() {
    const res = await fetch(SERVER_URL + "/channel/edit", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({id, linkFilter, mediaFilter})
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Changes added successfully");
      navigate("/channel");
    }
    else
      toast.error(data.error || "Failed to submit channel");
  }

  return (
    <div>
      <div className="panel1 space-y-3">
        <p className="panel1-header">Editing {name}</p>
        <p className="comment">ID: {channelId}</p>

        <div className="panel2 space-y-3 !py-5">
          <p className="panel1-subheader">Role Restrictions</p>

          <div className="flex justify-between text-neutral-400">
            <span>Message cooldown</span>
            <span>{cooldown}s</span>
          </div>

          <div className="flex justify-between text-neutral-400">
            <span>Has permissions to send attachments</span>
            <span>{attachmentPerm ? "Yes" : "No"}</span>
          </div>

          <p className="panel1-subheader">Server Bot Filters</p>
          <div className="flex justify-between text-neutral-400">
            <span>Has permissions to send attachments</span>
            <Toggle item={mediaFilter} setItem={setMediaFilter}/>
          </div>

          <div className="flex justify-between text-neutral-400">
            <span>Has permissions to send links</span>
            <Toggle item={linkFilter} setItem={setLinkFilter}/>
          </div>

        </div>
      </div>

      <button onClick={() => submit()} className={`panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1`}>
        <SaveIcon></SaveIcon> <p>Submit</p>
      </button>
    </div>
  );
}