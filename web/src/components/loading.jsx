import {MessageCircle} from "lucide-react";
import React from "react";

export default function Loading() {
  return (
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
  );
}