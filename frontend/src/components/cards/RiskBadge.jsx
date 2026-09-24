import React from "react";

export default function RiskBadge({ level }) {
  const colors = {
    HIGH:
      "bg-red-500/20 text-red-400 border-red-500/30",

    MEDIUM:
      "bg-orange-500/20 text-orange-400 border-orange-500/30",

    LOW:
      "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <span
      className={`
        px-2
        py-1
        text-xs
        font-bold
        rounded
        border
        ${colors[level]}
      `}
    >
      {level}
    </span>
  );
}
