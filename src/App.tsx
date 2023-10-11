import React from "react";
import Layout from "./components/Navigation/Layout";
import PublicRoutes from "./routes/Routes";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <DarkModeProvider>
        <Layout>
          <PublicRoutes />
        </Layout>
      </DarkModeProvider>
    </BrowserRouter>
  );
}

export default App;
