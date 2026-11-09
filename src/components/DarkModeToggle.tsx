import React from "react";
import { HiSun, HiMoon } from "react-icons/hi2";
import { useDarkMode } from "../contexts/DarkModeContext";

function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? "Activer le thème clair" : "Activer le thème sombre"}
      className="p-1.5 mb-1 rounded-full"
      title="Changez le thème de l'application"
    >
      {isDarkMode ? (
        <HiMoon className="text-moon text-xl" />
      ) : (
        <HiSun className="text-sun text-xl" />
      )}
    </button>
  );
}

export default DarkModeToggle;
