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
import WorkflowRunHistoryPage from "./pages/AgentsPage";
import { HomePage } from "./pages/HomePage";
import { WorkflowTemplatesPage } from "./pages/WorkflowTemplatesPage";
import { ActiveRunsPage } from "./pages/ActiveRunsPage";
import { SecurityPage } from "./pages/SecurityPage";
import { WorkflowReviewPage } from "./pages/WorkflowReviewPage";

import { SOPToWorkflowPage } from "./pages/SOPToAOPPage";

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
        <Route
          path="/workflow"
          element={<Navigate to="/workflow/templates" replace />}
        />
        <Route path="/workflow/run" element={<WorkflowRunHistoryPage />} />
        <Route path="/workflow/templates" element={<WorkflowTemplatesPage />} />
        <Route path="/workflow/review" element={<WorkflowReviewPage />} />
        <Route path="/workflow/active-runs" element={<ActiveRunsPage />} />
        
        <Route
          path="/workflow/sop-to-workflow"
          element={<SOPToWorkflowPage />}
        />
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
