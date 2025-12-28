import '../index.css';
import {PencilRuler, SaveIcon, Send} from 'lucide-react';
import React, {useState, createContext, useContext, useEffect} from 'react';
import ProfileEdit from "./profile_edit.jsx";
import {Route, Routes, useNavigate} from "react-router-dom";

const ProfileContext = createContext();
export function UseProfiles() {
  return useContext(ProfileContext);
}

export default function Profile() {

  function select(id) {
    console.log('selected', id);
  }

  return (
    <ProfileContext.Provider
      value={{select }}
    >
      <div className="space-y-4">
        <Routes>
          <Route path="/profile" element={<ProfileList/>} />
          <Route path="/profile/new" element={<ProfileEdit/>} />
          <Route path="/profile/edit/:id" element={<ProfileEdit/>} />
        </Routes>
      </div>
    </ProfileContext.Provider>
  );
}

function ProfileList() {
  const [items, setItems] = useState([]);
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

  return (
    <>
      {items.map((p) => (
        <ProfileListItem key={p.id} {...p} />
      ))}

      <button
        onClick={() => navigate("/profile/new")}
        className="panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1"
      >
        <SaveIcon /> <p>New Profile</p>
      </button>
    </>
  );
}

function ProfileListItem({ id, username}) {
  const { select } = UseProfiles();
  const navigate = useNavigate();

  return (
    <div>
      <div className="panel1 flex content-between centered gap-3 !py-0">
        <div className="w-full">
          <p className="panel1-header">@{username}</p>
          <p className="comment">ID: {id}</p>
        </div>

        <div className="my-5 space-y-3 max-w-50 w-full">
          <button
            type="button"
            onClick={() => navigate("/profile/edit/" + id)}
            className="panel2 buttonstyle2 w-full flex centered space-x-1"
          >
            <PencilRuler /> <p>Edit</p>
          </button>

          <button
            type="button"
            onClick={() => select(id)}
            className="panel2 buttonstyle4 w-full flex centered space-x-1"
          >
            <Send /> <p>Select</p>
          </button>
        </div>
      </div>
    </div>
  );
}
