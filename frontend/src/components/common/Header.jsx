import React, {
  useState,
} from "react";

import {
  FaShieldAlt,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";

import {
  useAuth,
} from "../../context/AuthContext";


export default function Header({
  title = "TN Disease Surge Predictor",
  subtitle = "PS08 • 14–21 Day Forecast • 38 Districts",
  time,
}) {

  const {
    user,
    logout,
  } = useAuth();


  const [
    showMenu,
    setShowMenu,
  ] = useState(false);


  const handleLogout =
    async () => {

      try {

        await logout();

      } catch (error) {

        console.error(
          "Logout failed:",
          error
        );

      }

    };


  return (

    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">


        {/* LEFT SIDE */}

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">

            <FaShieldAlt />

          </div>


          <div>

            <h1 className="text-sm font-bold text-white tracking-tight">

              {title}

            </h1>


            <p className="text-xs text-slate-500">

              {subtitle}

            </p>

          </div>

        </div>


        {/* RIGHT SIDE */}

        <div className="flex items-center gap-5">


          {/* LIVE */}

          <div className="flex items-center gap-2">

            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

            <span className="text-xs text-slate-400">

              Live

            </span>

          </div>


          {/* TIME */}

          <span className="text-xs text-slate-500 hidden md:block">

            {time?.toLocaleTimeString()}

          </span>


          {/* USER MENU */}

          <div className="relative">


            <button

              onClick={() =>
                setShowMenu(
                  !showMenu
                )
              }

              className="
                flex
                items-center
                gap-3
                px-3
                py-2
                rounded-lg
                hover:bg-slate-800
                transition
              "

            >


              <FaUserCircle
                className="
                  text-cyan-400
                  text-xl
                "
              />


              <div className="hidden md:block text-right">


                <p className="text-xs font-semibold text-white">

                  {user?.name ||
                    "TechNova Admin"}

                </p>


                <p className="text-[10px] text-cyan-400 uppercase">

                  {user?.role ||
                    "ADMIN"}

                </p>


              </div>


            </button>


            {/* DROPDOWN */}

            {showMenu && (

              <div className="
                absolute
                right-0
                mt-2
                w-52
                bg-slate-900
                border
                border-slate-700
                rounded-xl
                shadow-2xl
                overflow-hidden
                z-50
              ">


                {/* USER INFO */}

                <div className="
                  px-4
                  py-3
                  border-b
                  border-slate-800
                ">


                  <p className="
                    text-sm
                    font-semibold
                    text-white
                  ">

                    {user?.name}

                  </p>


                  <p className="
                    text-xs
                    text-slate-400
                    mt-1
                  ">

                    {user?.email}

                  </p>


                </div>


                {/* LOGOUT */}

                <button

                  onClick={
                    handleLogout
                  }

                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    text-sm
                    text-red-400
                    hover:bg-red-500/10
                    transition
                  "

                >

                  <FaSignOutAlt />

                  Logout

                </button>


              </div>

            )}


          </div>


        </div>


      </div>

    </header>

  );

}
