import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <div className="theme-footer">
      <Link to="/support" className="theme-footer-link">
        <span>© 2023 221B-BakerScript.</span>
        <span>Vous voulez me soutenir ?</span>
      </Link>
    </div>
  );
}

export default Footer;
