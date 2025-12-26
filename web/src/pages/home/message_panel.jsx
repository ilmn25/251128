import TextareaAutosize from "react-textarea-autosize";
import {X} from "lucide-react";

export default function MessagePanel({ items, setItems }) {
  function add() {
    setItems(prevItems => [...prevItems, ""]);
  }

  function update(index, newText) {
    if (!newText.trim()) remove(index)
    else setItems(prevItems => {return prevItems.map((msg, i) => (i === index ? newText : msg))});
  }

  function remove(index) {
    return setItems(prevItems => {return prevItems.filter((_, i) => i !== index)});
  }

  return (
    <div className="space-y-2">
      <button className="panel2 buttonstyle1 centered w-full" onClick={() => add()}>Add</button>

      {items.map((text, i) => (
        <div className="relative">
          <TextareaAutosize
            key={i}
            className="panel2 input resize-none overflow-hidden"
            placeholder={"Enter message"}
            value={text}
            onChange={e => update(i, e.target.value)}
            spellCheck={false}
          />
          <button
            onClick={() => remove(i)}
            className="absolute top-2 right-2 p-1 rounded bg-black/50 hover:bg-neutral-800"
          >
            <X className="w-4 h-4 text-neutral-300"/>
          </button>
        </div>
      ))}
    </div>
  );
}
