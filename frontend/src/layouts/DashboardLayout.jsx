import React from "react";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";

export default function DashboardLayout({
  children,
  activeTab,
  setActiveTab,
  time,
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <Header time={time} />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>

        {/* Footer */}
        <Footer />

      </div>

    </div>
  );
}
