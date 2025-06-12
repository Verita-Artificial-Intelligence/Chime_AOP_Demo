import React from "react";
import { useNavigate } from "react-router-dom";
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ScaleIcon,
  BanknotesIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import templateConfigsData from "../data/templateConfigs";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  steps: number;
  estimatedTime: string;
}

const templates: Template[] = [
  {
    id: "fcra-acdv-response",
    name: "FCRA - Respond to ACDV case, Apply response code, Respond to consumer",
    description:
      "Automate the Fair Credit Reporting Act (FCRA) response process for ACDV cases, including verification, investigation, escalation handling, and consumer communication.",
    category: "Compliance & Legal",
    icon: ShieldCheckIcon,
    steps: 13,
    estimatedTime: "20-25 mins",
  },
  {
    id: "fcra-indirect-dispute",
    name: "FCRA - Complete an ACDV indirect dispute",
    description:
      "Automate the Fair Credit Reporting Act (FCRA) process for handling indirect disputes, including verification, AI processing, and response generation.",
    category: "Compliance & Legal",
    icon: UserGroupIcon,
    steps: 11,
    estimatedTime: "15-20 mins",
  },
  {
    id: "aml-monitoring",
    name: "Anti-Money Laundering (AML) Monitoring",
    description:
      "Continuous monitoring of transactions for suspicious patterns and automated reporting to regulatory authorities.",
    category: "Compliance",
    icon: BanknotesIcon,
    steps: 12,
    estimatedTime: "20-25 mins",
  },
  {
    id: "regulatory-reporting",
    name: "Regulatory Reporting Automation",
    description:
      "Automate the generation and submission of regulatory reports including GDPR, SOX, and other compliance requirements.",
    category: "Compliance",
    icon: DocumentTextIcon,
    steps: 6,
    estimatedTime: "8-12 mins",
  },
  {
    id: "audit-trail",
    name: "Audit Trail Generation",
    description:
      "Create comprehensive audit trails for all system activities, ensuring compliance with regulatory requirements.",
    category: "Compliance",
    icon: MagnifyingGlassIcon,
    steps: 7,
    estimatedTime: "10-15 mins",
  },
  {
    id: "risk-assessment",
    name: "Automated Risk Assessment",
    description:
      "Evaluate and score risks across various business processes using predefined criteria and machine learning models.",
    category: "Risk Management",
    icon: ScaleIcon,
    steps: 9,
    estimatedTime: "12-18 mins",
  },
];

export const AOPTemplatesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleTemplateClick = (templateId: string) => {
    // Get template configuration from mockData
    const templateConfig = templateConfigsData[templateId];

    if (templateConfig) {
      // Navigate directly to active runs with the template configuration
      navigate("/aop/active-runs", {
        state: {
          id: `run-${templateId}-${Date.now()}`,
          name: templateConfig.name,
          workflow: templateConfig.workflow,
          dataSources: templateConfig.dataSources,
          actions: templateConfig.actions,
          llm: templateConfig.llm,
          fromTemplate: true,
          templateId: templateId,
        },
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AOP Templates</h1>
        <p className="text-gray-600">
          Pre-built automation templates for common compliance and operational
          workflows
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, index) => (
          <div
            key={template.id}
            onClick={() => handleTemplateClick(template.id)}
            className={`bg-white rounded-lg shadow-sm border ${
              index === 0 ? "border-brand-primary border-2" : "border-gray-200"
            } p-6 hover:shadow-lg transition-all cursor-pointer group`}
          >
            {index === 0 && (
              <div className="mb-3">
                <span className="px-3 py-1 bg-brand-primary text-brand-dark text-xs font-medium rounded-full">
                  Recommended
                </span>
              </div>
            )}

            <div className="flex items-start mb-4">
              <div
                className={`p-3 rounded-lg ${
                  index === 0 ? "bg-brand-light" : "bg-gray-100"
                } group-hover:bg-brand-light transition-colors`}
              >
                <template.icon
                  className={`h-6 w-6 ${
                    index === 0 ? "text-brand-primary" : "text-gray-600"
                  } group-hover:text-brand-primary`}
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-brand-primary transition-colors">
              {template.name}
            </h3>

            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {template.description}
            </p>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{template.steps} steps</span>
              <span className="text-gray-500">{template.estimatedTime}</span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                {template.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Need a custom template?
        </h2>
        <p className="text-gray-600 mb-4">
          Create your own automation workflow from scratch using our AOP
          Builder.
        </p>
        <button
          onClick={() => navigate("/aop/builder")}
          className="px-4 py-2 bg-brand-primary text-brand-dark rounded-md hover:bg-brand-hover transition-colors font-semibold"
        >
          Create Custom AOP
        </button>
      </div>
    </div>
  );
};
