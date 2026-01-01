import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({value, setValue}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className="input w-full pr-10 panel2"
        placeholder="Password"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
      >
        {visible ? <Eye size={18}/> : <EyeOff size={18}/>}
      </button>
    </div>
  );
}
