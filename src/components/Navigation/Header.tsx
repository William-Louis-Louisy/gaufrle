import React from "react";
import DarkModeToggle from "../DarkModeToggle";

function Header() {
  return (
    <div className="theme-header theme-lmnt">
      <span className="theme-text">GAUFRLE</span>

      <DarkModeToggle />
    </div>
  );
}

export default Header;
