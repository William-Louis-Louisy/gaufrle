import React from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "../pages/Homepage";
import Errorpage from "../pages/Errorpage";
import NormalGamepage from "../pages/NormalGamepage";
import MediumGamepage from "../pages/MediumGamepage";
import HardGamepage from "../pages/HardGamepage";
import Supportpage from "../pages/Supportpage";

export default function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/normal-game" element={<NormalGamepage />} />
      <Route path="/medium-game" element={<MediumGamepage />} />
      <Route path="/hard-game" element={<HardGamepage />} />

      <Route path="/support" element={<Supportpage />} />
      <Route path="*" element={<Errorpage />} />
    </Routes>
  );
}
