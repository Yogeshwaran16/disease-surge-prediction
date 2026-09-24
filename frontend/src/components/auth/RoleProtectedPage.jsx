import React from "react";

import {
  useAuth,
} from "../../context/AuthContext";


export default function RoleProtected({

  children,

  allowedRoles = [],

}) {

  const {

    user,

    loading,

  } = useAuth();


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="
        min-h-[300px]
        flex
        items-center
        justify-center
        text-slate-400
      ">

        Checking permissions...

      </div>

    );

  }


  // ==========================================
  // USER NOT FOUND
  // ==========================================

  if (!user) {

    return (

      <div className="
        min-h-[300px]
        flex
        items-center
        justify-center
      ">

        <div className="
          bg-red-500/10
          border
          border-red-500/30
          rounded-xl
          p-6
          text-center
        ">

          <h2 className="
            text-xl
            font-bold
            text-red-400
          ">

            Authentication Required

          </h2>

        </div>

      </div>

    );

  }


  // ==========================================
  // ROLE CHECK
  // ==========================================

  const userRole =
    user.role?.toLowerCase();


  const normalizedRoles =
    allowedRoles.map(
      (role) =>
        role.toLowerCase()
    );


  const hasPermission =
    normalizedRoles.includes(
      userRole
    );


  // ==========================================
  // ACCESS DENIED
  // ==========================================

  if (!hasPermission) {

    return (

      <div className="
        min-h-[400px]
        flex
        items-center
        justify-center
      ">

        <div className="
          max-w-md
          w-full
          bg-slate-900
          border
          border-red-500/30
          rounded-2xl
          p-8
          text-center
          shadow-xl
        ">

          <div className="
            text-5xl
            mb-4
          ">

            🔒

          </div>


          <h2 className="
            text-2xl
            font-bold
            text-white
            mb-3
          ">

            Access Denied

          </h2>


          <p className="
            text-slate-400
            text-sm
          ">

            Your role does not have permission
            to access this feature.

          </p>


          <div className="
            mt-5
            text-xs
            text-cyan-400
          ">

            Current Role: {user.role}

          </div>

        </div>

      </div>

    );

  }


  // ==========================================
  // ACCESS GRANTED
  // ==========================================

  return children;

}
