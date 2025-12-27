export default function Toggle({ item, setItem }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={item}
        onChange={() => setItem(!item)}
      />
      <div className="w-11 h-6 bg-neutral-700 rounded-full peer peer-checked:bg-indigo-600
                      peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                      after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5
                      after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white">
      </div>
    </label>
  );
}
