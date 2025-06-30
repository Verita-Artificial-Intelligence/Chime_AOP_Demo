import React from "react";
import { useNavigate } from "react-router-dom";
import content from "../config/content";

export function WorkflowPage() {
  const navigate = useNavigate();

  return (
    <div className="container p-4 mx-auto max-w-4xl">
      <div className="p-6 md:p-8 mt-8 bg-brand-card rounded-lg border border-brand-border">
        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-brand-heading mb-2">
            Create Automated Workflows to streamline your{" "}
            <span className="text-brand-primary">daily operations</span>
          </h1>
          <p className="text-brand-muted">
            Create automated workflows to streamline your{" "}
            {content.builderDescription}
          </p>
          <button
            onClick={() => navigate("/workflow/templates")}
            className="w-full px-8 py-4 bg-brand-primary text-brand-dark rounded-lg shadow-md hover:bg-brand-hover transition-all duration-200 font-semibold text-lg"
          >
            View Workflow Templates
          </button>
          <button
            onClick={() => navigate("/workflow/builder")}
            className="w-full px-8 py-4 bg-white text-brand-dark border border-brand-border rounded-lg shadow-md hover:bg-brand-light transition-all duration-200 font-semibold text-lg"
          >
            Create Custom Workflow
          </button>
        </div>
      </div>
    </div>
  );
}
