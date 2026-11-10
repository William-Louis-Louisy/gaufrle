import React from "react";
import Layout from "./components/Navigation/Layout";
import PublicRoutes from "./routes/Routes";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./components/Navigation/ScrollToTop";
import SeoHead from "./components/SeoHead";

function App() {
  return (
    <BrowserRouter>
      <DarkModeProvider>
        <ScrollToTop />
        <SeoHead />
        <Layout>
          <PublicRoutes />
        </Layout>
      </DarkModeProvider>
    </BrowserRouter>
  );
}

export default App;
