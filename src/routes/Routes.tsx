import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "../pages/Homepage";
import Loading from "../components/Navigation/Loading";

// Keep the landing page light: puzzle catalogs and game dependencies are only
// requested when a visitor actually opens the corresponding route.
const NormalGamepage = lazy(() => import("../pages/NormalGamepage"));
const MediumGamepage = lazy(() => import("../pages/MediumGamepage"));
const HardGamepage = lazy(() => import("../pages/HardGamepage"));
const Supportpage = lazy(() => import("../pages/Supportpage"));
const Errorpage = lazy(() => import("../pages/Errorpage"));

export default function PublicRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/normal-game" element={<NormalGamepage />} />
        <Route path="/medium-game" element={<MediumGamepage />} />
        <Route path="/hard-game" element={<HardGamepage />} />
        <Route path="/support" element={<Supportpage />} />
        <Route path="*" element={<Errorpage />} />
      </Routes>
    </Suspense>
  );
}
