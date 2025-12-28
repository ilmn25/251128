import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {PencilRuler, UserPlus, Send} from "lucide-react";

export default function ProfileList() {
  const [items, setItems] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfiles() {
      const res = await fetch("http://localhost:8000/profile", {
        method: "GET",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        if (data.items.length === 0) navigate("/profile/new")
        else setItems(data.items);
      } else {
        console.error("Error fetching profiles:", data.error);
      }
    }

    fetchProfiles();
  }, [navigate, setItems]);

  if (!items) return <></>

  return (
    <>
      {items.map((p) => (
        <ProfileListItem key={p.id} {...p} />
      ))}

      <button
        onClick={() => navigate("/profile/new")}
        className="panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1"
      >
        <UserPlus/> <p>New Profile</p>
      </button>
    </>
  );
}


function ProfileListItem({ id, accountId, username}) {
  const navigate = useNavigate();

  function select(){
    let date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    document.cookie = "profile=" + id + "; expires=" + date.toUTCString() + "; path=/";
  }

  return (
    <div>
      <div className="panel1 flex content-between centered gap-3 !py-0">
        <div className="w-full">
          <p className="panel1-header">@{username}</p>
          <p className="comment">ID: {accountId}</p>
        </div>

        <div className="my-5 space-y-3 max-w-50 w-full">
          <button
            type="button"
            onClick={() => navigate("/profile/edit/" + accountId)}
            className="panel2 buttonstyle2 w-full flex centered space-x-1"
          >
            <PencilRuler /> <p>Edit</p>
          </button>

          <button
            type="button"
            onClick={() => select()}
            className="panel2 buttonstyle4 w-full flex centered space-x-1"
          >
            <Send /> <p>Select</p>
          </button>
        </div>
      </div>
    </div>
  );
}