import React from "react";

export default function AuthLayout({
  children,
  title = "Disease Surge Predictor",
  subtitle = "AI Powered Public Health Intelligence",
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">

          <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-4xl">
            🏥
          </div>

          <h1 className="text-3xl font-black text-white mt-4">
            {title}
          </h1>

          <p className="text-slate-400 mt-2">
            {subtitle}
          </p>

        </div>

        {/* Auth Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">

          {children}

        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          © 2026 Disease Surge Prediction System
        </p>

      </div>

    </div>
  );
}
