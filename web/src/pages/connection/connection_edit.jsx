import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {PencilRuler, Repeat, SaveIcon, Shuffle, ArrowBigRightDash} from "lucide-react";

const MODE = {
  DEFAULT: "DEFAULT",
  CHANNEL: "CHANNEL",
  COMPOSITION: "COMPOSITION",
}
export default function ConnectionEdit() {
  const navigate = useNavigate();
  const {connectionId} = useParams();
  const [channel, setChannel] = useState(null);
  const [composition, setComposition] = useState(null);

  const [compositions, setCompositions] = useState([]);
  const [channels, setChannels] = useState([]);
  const [mode, setMode] = useState(MODE.DEFAULT);

  useEffect(() => {
    async function fetchChannelsAndCompositions() {
      // channels
      let res = await fetch("http://localhost:8000/channel", {
        method: "GET",
        credentials: "include"
      });
      let data = await res.json();
      if (data.success) {
        if (data.items.length === 0) navigate("/channel/new");
        else setChannels(data.items);
      }

      // compositions
      res = await fetch("http://localhost:8000/composition", {
        method: "GET",
        credentials: "include"
      });
      data = await res.json();
      if (data.success) {
        if (data.items.length === 0) navigate("/composition/new");
        else setCompositions(data.items);
      }
    }

    fetchChannelsAndCompositions();
  }, [navigate]);

  useEffect(() => {
    async function fetchConnection() {
      if (!connectionId) {
        setChannel(channels[0]);
        setComposition(compositions[0]);
        return;
      }

      const res = await fetch(`http://localhost:8000/connection/${connectionId}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setChannel(channels.find(c => c.id === data.item.channelId));
        setComposition(compositions.find(comp => comp.compositionId === data.item.compositionId));
      } else {
        navigate("/connection/new");
        console.error(data.error || "Failed to fetch connection info");
      }
    }

    if (channels.length > 0 && compositions.length > 0) {
      fetchConnection();
    }
  }, [channels, compositions, connectionId, navigate]);

  if (!composition || !channel) return null;

  async function submit() {
    const res = await fetch("http://localhost:8000/connection", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({id: connectionId, channelId: channel.id, compositionId: composition.compositionId}),
    });
    const data = await res.json();
    if (data.success)
      navigate("/connection");
    else
      console.error(data.error || "Failed to save connection");
  }

  return (
    <div>
      <div className="panel1 space-y-3 ">
        <div>
          <p className="panel1-header">Connection</p>
          {connectionId && <p className="comment">ID: {connectionId}</p>}
        </div>

        {mode === MODE.CHANNEL ? (
          <>
            {channels.map((p) => (
              <ChannelListItem key={p.channelId} item={p} setChannel={setChannel} setMode={setMode}/>
            ))}
          </>
        ) : mode === MODE.COMPOSITION ? (
          <>
            {compositions.map((c) => (
              <CompositionListItem key={c.compositionId} item={c} setComposition={setComposition} setMode={setMode}/>
            ))}
          </>
        ) : (
          <>
            <div className="panel2 flex content-between centered gap-3 !py-0">
              <div className="w-full">
                <p className="panel1-header">{channel.name}</p>
                <p className="comment">ID: {channel.channelId}</p>
              </div>

              <div className="my-5 space-y-3 max-w-50 w-full">
                <button
                  type="button"
                  onClick={() => setMode(MODE.CHANNEL)}
                  className="panel2 buttonstyle2 w-full flex centered space-x-1"
                >
                  <PencilRuler/> <p>Change</p>
                </button>
              </div>
            </div>

            <div className="panel2 flex content-between centered gap-3">
              <div className="w-full">
                <div className="panel1-header flex justify-start gap-2 items-center">
                  <p>{composition.message}</p>
                  {composition.randomize ? (
                    <Shuffle className="size-4"/>
                  ) : (
                    <Repeat className="size-4"/>
                  )}
                </div>
                <p className="comment">
                  Select {composition.count} Attachments from {composition.attachmentsCount} Files to Send
                </p>
                <p className="comment">ID: {composition.compositionId}</p>
              </div>

              <div className="my-5 space-y-3 max-w-50 w-full">
                <button
                  type="button"
                  onClick={() => setMode(MODE.COMPOSITION)}
                  className="panel2 buttonstyle2 w-full flex centered space-x-1"
                >
                  <PencilRuler/> <p>Change</p>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <button onClick={() => submit()} className={`panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1`}>
        <SaveIcon/> <p>Save</p>
      </button>
    </div>
  );
}

function ChannelListItem({ item, setChannel, setMode }) {
  return (
    <div className="panel2 flex content-between centered gap-3 !py-0">
      <div className="w-full">
        <p className="panel1-header">{item.name}</p>
        <p className="comment">ID: {item.channelId}</p>
      </div>

      <div className="my-5 space-y-3 max-w-50 w-full">
        <button
          type="button"
          onClick={() => {
            setMode(MODE.DEFAULT);
            setChannel(item);
          }}
          className="panel2 buttonstyle4 w-full flex centered space-x-1"
        >
          <ArrowBigRightDash/> <p>Select</p>
        </button>
      </div>
    </div>
  );
}

function CompositionListItem({ item, setComposition, setMode }) {
  return (
    <div>
      <div className="panel2 flex content-between centered gap-3">
        <div className="w-full">
          <div className="panel1-header flex justify-start gap-2 items-center">
            <p className="">{item.message}</p>
            {item.randomize ? (
              <Shuffle className="size-4"/>
            ) : (
              <Repeat className="size-4"/>
            )}
          </div>
          <p className="comment">Select {item.count} Attachments from {item.attachmentsCount} Files to Send</p>
          <p className="comment">ID: {item.compositionId}</p>
        </div>

        <div className="my-5 space-y-3 max-w-50 w-full">
          <button
            type="button"
            onClick={() => {
              setMode(MODE.DEFAULT);
              setComposition(item);
            }}
            className="panel2 buttonstyle4 w-full flex centered space-x-1"
          >
            <ArrowBigRightDash/> <p>Select</p>
          </button>
        </div>
      </div>
    </div>
  );
}