import { MessageCircle } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

export default function Loading() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="p-4 bg-white rounded-2xl">
        <MessageCircle className="text-black size-13" />
      </div>
      <p className="text-3xl font-bold m-4 text-center">{t("title")}</p>
      <p className="text-1xl text-neutral-500 mb-7 text-center">
        {t("description1")} <br />
        <br /> {t("description2")}
        <br /> <br /> {t("loadingConnecting")}
      </p>
    </div>
  );
}
