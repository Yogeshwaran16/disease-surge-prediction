import React from "react";

export default function About() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

      <h1 className="text-2xl font-bold text-white mb-4">
        About Disease Surge Predictor
      </h1>

      <p className="text-slate-300 leading-relaxed">
        Disease Surge Predictor is an AI-powered
        public health intelligence system that
        predicts disease outbreaks 14-21 days
        before they occur.
      </p>

      <div className="mt-6">

        <h2 className="text-lg font-bold text-cyan-400 mb-3">
          Features
        </h2>

        <ul className="space-y-2 text-slate-400">
          <li>✔ Disease Risk Prediction</li>
          <li>✔ District Ranking</li>
          <li>✔ Resource Planning</li>
          <li>✔ Alert Generation</li>
          <li>✔ Model Performance Analysis</li>
        </ul>

      </div>

      <div className="mt-6">

        <h2 className="text-lg font-bold text-cyan-400 mb-3">
          Technology Stack
        </h2>

        <ul className="space-y-2 text-slate-400">
          <li>React.js</li>
          <li>Node.js</li>
          <li>Express.js</li>
          <li>MongoDB</li>
          <li>Python</li>
          <li>Scikit-Learn</li>
        </ul>

      </div>

    </div>
  );
}
