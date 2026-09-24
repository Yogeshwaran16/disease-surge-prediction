import React from "react";
import { motion } from "framer-motion";


// ============================================
// SUMMARY COUNTER
// ============================================

export default function SummaryCounter({
  title,
  value = 0,
  subtitle = "",
  icon,
  type = "default",
}) {

  const typeClasses = {

    default:
      "border-slate-700 bg-slate-900",

    high:
      "border-red-500/40 bg-red-500/10",

    medium:
      "border-yellow-500/40 bg-yellow-500/10",

    low:
      "border-green-500/40 bg-green-500/10",

    districts:
      "border-blue-500/40 bg-blue-500/10",

  };


  const iconClasses = {

    default:
      "bg-slate-800 text-slate-300",

    high:
      "bg-red-500/20 text-red-400",

    medium:
      "bg-yellow-500/20 text-yellow-400",

    low:
      "bg-green-500/20 text-green-400",

    districts:
      "bg-blue-500/20 text-blue-400",

  };


  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 15,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      transition={{
        duration: 0.35,
      }}

      className={`
        rounded-2xl
        border
        p-5
        shadow-lg
        ${typeClasses[type] || typeClasses.default}
      `}
    >

      <div className="flex items-start justify-between">

        {/* LEFT CONTENT */}

        <div>

          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>


          <motion.h2

            key={value}

            initial={{
              opacity: 0,
              scale: 0.85,
            }}

            animate={{
              opacity: 1,
              scale: 1,
            }}

            transition={{
              duration: 0.25,
            }}

            className="mt-2 text-3xl font-bold text-white"
          >
            {value}
          </motion.h2>


          {subtitle && (

            <p className="mt-1 text-xs text-slate-500">
              {subtitle}
            </p>

          )}

        </div>


        {/* ICON */}

        {icon && (

          <div
            className={`
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              text-xl
              ${iconClasses[type] || iconClasses.default}
            `}
          >
            {icon}
          </div>

        )}

      </div>

    </motion.div>

  );
}
