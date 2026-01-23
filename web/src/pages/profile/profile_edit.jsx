import '../../index.css';

import {SaveIcon, Shield, Trash} from "lucide-react";
import React, {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {toast} from "sonner";
import {API_URL} from "../../main.jsx";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

export default function ProfileEdit() {
  const { accountId } = useParams();
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  async function submit() {
    if (!token || !token.includes("."))
      return toast.error(t("toastInvalidToken"));

    const res = await fetch(API_URL + "/profile", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({accountId, token}),
    });

    const data = await res.json();
    if (data.success) {
      Cookies.set("profile", accountId, { expires: 365, path: "/" });
      toast.success(t("toastSaveSuccess"));
      navigate("/profile");
    } else {
      toast.error(data.error || t("toastSaveError"));
    }
  }

  async function Delete() {
    const res = await fetch(API_URL + "/profile/" + accountId, {
      method: "DELETE",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
    });

    const data = await res.json();
    if (data.success) {
      toast.success(t("toastDeleteSuccess"));
      navigate("/profile");
    } else {
      toast.error(data.error || t("toastDeleteError"));
    }
  }

  return (
    <div>
      <div className="panel1 space-y-3">
        <div>
          <p className="panel1-header py-1">
            {accountId ? t("updateProfileToken") : t("newProfile")}
          </p>
          {accountId && <p className="comment">ID: {accountId}</p>}
        </div>

        <div className="panel2 flex space-x-4 !p-4">
          <Shield className="comment !size-6" />
          <div className="space-y-2">
            <p>{t("securityWarning")}</p>
            <ul className="comment list-disc pl-5 space-y-1">
              <li>{t("securityLine1")}</li>
              <li>{t("securityLine2")}</li>
              <li>{t("securityLine3")}</li>
              <li>{t("securityLine4")}</li>
            </ul>
          </div>
        </div>

        <div className="justify-between">
          <input
            className="panel2 input font-mono"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value.trim())}
            placeholder={t("tokenPlaceholder")}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={submit} className="panel2 buttonstyle4 w-50 !my-5 flex centered space-x-1">
          <SaveIcon /> <p>{t("save")}</p>
        </button>
        {accountId && (
          <button onClick={Delete} className="panel2 buttonstyle5 w-50 !my-5 flex centered space-x-1">
            <Trash /> <p>{t("delete")}</p>
          </button>
        )}
      </div>
    </div>
  );
}
