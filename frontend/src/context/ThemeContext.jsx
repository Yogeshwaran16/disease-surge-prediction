import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({
  children,
}) => {
  const [theme, setTheme] =
    useState(() => {
      return (
        localStorage.getItem("theme") ||
        "dark"
      );
    });

  useEffect(() => {
    localStorage.setItem(
      "theme",
      theme
    );

    document.documentElement.classList.remove(
      "light",
      "dark"
    );

    document.documentElement.classList.add(
      theme
    );
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === "dark"
        ? "light"
        : "dark"
    );
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark:
      theme === "dark",
  };

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
