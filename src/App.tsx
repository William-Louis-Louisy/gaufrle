import React from "react";
import Layout from "./components/Navigation/Layout";
import PublicRoutes from "./routes/Routes";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./components/Navigation/ScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <DarkModeProvider>
        <ScrollToTop />
        <Layout>
          <PublicRoutes />
        </Layout>
      </DarkModeProvider>
    </BrowserRouter>
  );
}

export default App;
