import React from "react";
import Layout from "./components/Navigation/Layout";
import PublicRoutes from "./routes/Routes";
import { DarkModeProvider } from "./contexts/DarkModeContext";

function App() {
  return (
    <DarkModeProvider>
      <Layout>
        <PublicRoutes />
      </Layout>
    </DarkModeProvider>
  );
}

export default App;
