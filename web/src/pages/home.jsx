import '../index.css';

import Composition from "./composition.jsx";
import { useState } from "react";

const Tabs = {
  COMPOSITION: "COMPOSITION",
  CONNECTION: "CONNECTION",
  SETTINGS: "SETTIINGS",
};

export default function Home() {
  const [selected, setSelected] = useState(Tabs.COMPOSITION);

  return (
    <div>
      <div className="flex space-x-2">
        <button
          onClick={() => setSelected(Tabs.COMPOSITION)}
          className={`panel2 ${selected === Tabs.COMPOSITION ? "buttonstyle3" : "buttonstyle2"}`}
        >
          Composition
        </button>
        <button
          onClick={() => setSelected(Tabs.CONNECTION)}
          className={`panel2 ${selected === Tabs.CONNECTION ? "buttonstyle3" : "buttonstyle2"}`}
        >
          Connection
        </button>
        <button
          onClick={() => setSelected(Tabs.SETTINGS)}
          className={`panel2 ${selected === Tabs.SETTINGS ? "buttonstyle3" : "buttonstyle2"}`}
        >
          Settings
        </button>
      </div>

      <div className="mt-4">
        {selected === Tabs.COMPOSITION && <Composition />}
        {selected === Tabs.CONNECTION && <div className="panel2">Placeholder One</div>}
        {selected === Tabs.SETTINGS && <div className="panel2">Placeholder Two</div>}
      </div>
    </div>
  );
}

