import React, {
  createContext,
  useContext,
  useState,
} from "react";

const DiseaseContext =
  createContext();

export const useDisease =
  () => {
    return useContext(
      DiseaseContext
    );
  };

export const DiseaseProvider =
  ({ children }) => {
    const [
      activeDisease,
      setActiveDisease,
    ] = useState("dengue");

    const [
      selectedDistrict,
      setSelectedDistrict,
    ] = useState("");

    const [
      searchQuery,
      setSearchQuery,
    ] = useState("");

    const [
      alertCount,
      setAlertCount,
    ] = useState(0);

    const diseaseInfo = {
      dengue: {
        label: "Dengue",
        icon: "🦟",
        color: "#f97316",
        season: "Oct-Dec",
      },

      scrub_typhus: {
        label: "Scrub Typhus",
        icon: "🌿",
        color: "#a855f7",
        season: "Oct-Nov",
      },

      gastroenteritis: {
        label:
          "Gastroenteritis",
        icon: "💧",
        color: "#06b6d4",
        season: "Jun-Jul",
      },

      respiratory: {
        label:
          "Respiratory",
        icon: "🫁",
        color: "#3b82f6",
        season: "Dec-Jan",
      },
    };

    const value = {
      activeDisease,
      setActiveDisease,

      selectedDistrict,
      setSelectedDistrict,

      searchQuery,
      setSearchQuery,

      alertCount,
      setAlertCount,

      diseaseInfo,
    };

    return (
      <DiseaseContext.Provider
        value={value}
      >
        {children}
      </DiseaseContext.Provider>
    );
  };

export default DiseaseContext;
