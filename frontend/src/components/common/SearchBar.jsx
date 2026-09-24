import React from "react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search district..."
}) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="
        bg-slate-800
        border
        border-slate-700
        rounded-lg
        px-3
        py-2
        text-sm
        text-white
        placeholder-slate-500
        focus:outline-none
        focus:border-cyan-500
        w-full
      "
    />
  );
}
