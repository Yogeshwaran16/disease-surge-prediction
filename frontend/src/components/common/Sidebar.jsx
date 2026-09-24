import React from "react";

import {
  FaHome,
  FaChartLine,
  FaMapMarkedAlt,
  FaHospital,
  FaBell,
  FaInfoCircle,
  FaBrain,
  FaDatabase,
  FaCheckCircle,
  FaRobot,
  FaHistory,
  FaServer,
} from "react-icons/fa";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  PAGE_PERMISSIONS,
} from "../../config/permissions";


const tabs = [

  {
    id: "dashboard",
    label: "Dashboard",
    icon: <FaHome />,
  },

  {
    id: "predictions",
    label: "Predictions",
    icon: <FaChartLine />,
  },

  {
    id: "district-analysis",
    label: "District Analysis",
    icon: <FaMapMarkedAlt />,
  },

  {
  id: "district-management",
  label: "District Management",
  icon: <FaMapMarkedAlt />,
},

  {
    id: "validation-scorecard",
    label: "Validation Scorecard",
    icon: <FaCheckCircle />,
  },

  {
    id: "shap-analysis",
    label: "SHAP Feature Breakdown",
    icon: <FaBrain />,
  },

  {
    id: "ai-recommendations",
    label: "AI Recommendations",
    icon: <FaRobot />,
  },

  {
    id: "resource-planning",
    label: "Resource Planning",
    icon: <FaHospital />,
  },

    {
    id: "reports",
    label: "Reports Center",
    icon: <FaServer />,
  },

  {
    id: "data-sources",
    label: "Data Source Citation Panel",
    icon: <FaDatabase />,
  },


  // ==========================================
  // FEATURE STORE EXPLORER ⭐ MODULE 4
  // ==========================================

  {
    id: "feature-store",
    label: "Feature Store Explorer",
    icon: <FaServer />,
  },


  {
    id: "alerts",
    label: "ASHA Alert Generator",
    icon: <FaBell />,
  },

  {
    id: "about",
    label: "About",
    icon: <FaInfoCircle />,
  },

  {
    id: "alert-history",
    label: "Alert History",
    icon: <FaHistory />,
  },

];


export default function Sidebar({

  activeTab,

  setActiveTab,

}) {


  // ==========================================
  // GET LOGGED-IN USER
  // ==========================================

  const {

    user,

  } = useAuth();


  const userRole =
    user?.role?.toLowerCase();


  // ==========================================
  // FILTER MENUS BY ROLE
  // ==========================================

  const visibleTabs =
    tabs.filter(
      (tab) => {

        const allowedRoles =
          PAGE_PERMISSIONS[
            tab.id
          ] || [];


        return allowedRoles.includes(
          userRole
        );

      }
    );


  return (

    <aside

      className="
        w-72
        bg-slate-900
        border-r
        border-slate-800
        min-h-screen
        hidden
        lg:block
      "

    >


      {/* LOGO */}

      <div

        className="
          p-6
          border-b
          border-slate-800
        "

      >

        <h2

          className="
            text-3xl
            font-black
            text-cyan-400
          "

        >

          DiseaseSurge AI

        </h2>


        <p

          className="
            text-slate-500
            text-sm
            mt-2
          "

        >

          Early Warning System

        </p>

      </div>


      {/* USER ROLE */}

      <div

        className="
          mx-4
          mt-4
          p-3
          bg-slate-800
          rounded-xl
          border
          border-slate-700
        "

      >

        <p className="text-xs text-slate-500">

          Logged in as

        </p>


        <p className="text-sm text-cyan-400 font-semibold mt-1">

          {user?.name ||
            "TechNova User"}

        </p>


        <p className="text-xs text-slate-400 uppercase mt-1">

          {userRole ||
            "viewer"}

        </p>

      </div>


      {/* MENU */}

      <nav

        className="
          p-4
        "

      >

        {

          visibleTabs.map(
            (tab) => (

              <button

                key={
                  tab.id
                }

                onClick={() =>
                  setActiveTab(
                    tab.id
                  )
                }

                className={`

                  w-full

                  flex

                  items-center

                  gap-3

                  px-4

                  py-4

                  rounded-xl

                  mb-3

                  transition-all

                  duration-200

                  ${

                    activeTab ===
                    tab.id

                      ? `

                        bg-cyan-500/20

                        text-cyan-400

                        border

                        border-cyan-500/30

                      `

                      : `

                        text-slate-400

                        hover:bg-slate-800

                        hover:text-white

                      `

                  }

                `}

              >

                <span className="text-lg">

                  {tab.icon}

                </span>


                <span

                  className="
                    font-medium
                    text-left
                  "

                >

                  {tab.label}

                </span>

              </button>

            )
          )

        }

      </nav>

    </aside>

  );

}

