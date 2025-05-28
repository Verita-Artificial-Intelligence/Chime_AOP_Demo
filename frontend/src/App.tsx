import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import content, { applyThemeColors } from "./config/content";

import { Layout } from "./components/Layout";
// Page Components
import { IntegrationsPage } from "./pages/IntegrationsPage";
import { AOPPage } from "./pages/AOPPage";
import AOPRunPage from "./pages/AOPRunPage";
import { AOPBuilderPage } from "./pages/AOPBuilderPage";
import AgentsPage from "./pages/AgentsPage";
import { HomePage } from "./pages/HomePage";
import { AOPTemplatesPage } from "./pages/AOPTemplatesPage";
import { ActiveRunsPage } from "./pages/ActiveRunsPage";
import { SecurityPage } from "./pages/SecurityPage";

export function App() {
  // Update document title based on configuration
  React.useEffect(() => {
    document.title = `${content.clientName} ${content.pageTitleSuffix}`;
    // Apply theme colors as CSS variables
    applyThemeColors();
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/aop" element={<AOPPage />} />
        <Route path="/aop/run" element={<AgentsPage />} />
        <Route path="/aop/run/:id" element={<AOPRunPage />} />
        <Route path="/aop/builder" element={<AOPBuilderPage />} />
        <Route path="/aop/templates" element={<AOPTemplatesPage />} />
        <Route path="/aop/active-runs" element={<ActiveRunsPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
