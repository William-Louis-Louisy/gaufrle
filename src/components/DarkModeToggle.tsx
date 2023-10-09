import React from "react";
import { HiSun, HiMoon } from "react-icons/hi2";
import { useDarkMode } from "../contexts/DarkModeContext";

function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button onClick={toggleDarkMode} className="p-1.5 mb-1 rounded-full">
      {isDarkMode ? (
        <HiMoon className="text-moon text-xl" />
      ) : (
        <HiSun className="text-sun text-xl" />
      )}
    </button>
  );
}

export default DarkModeToggle;
