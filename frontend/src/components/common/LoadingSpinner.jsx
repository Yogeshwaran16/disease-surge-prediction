import React from "react";

export default function LoadingSpinner({
  text = "Loading..."
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />

      <p className="text-slate-400 text-sm mt-4">
        {text}
      </p>
    </div>
  );
}
