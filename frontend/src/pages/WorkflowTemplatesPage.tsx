import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCardIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { templateConfigs } from "../data/templateConfigs";

// Map template IDs to icons
const iconMap: Record<string, React.ElementType> = {
  "credit-dispute-credit-bureau": CreditCardIcon,
  "direct-dispute-member": UserIcon,
  "complex-dispute-equifax": MagnifyingGlassIcon,
};

export const WorkflowTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filterOptions = [
    { value: "all", label: "All Templates" },
    { value: "compliance", label: "Compliance" },
    { value: "legal", label: "Legal" },
    { value: "onboarding", label: "Onboarding" },
  ];

  const handleTemplateClick = (templateId: string) => {
    const template = templateConfigs.find((t) => t.id === templateId);

    if (template) {
      // Navigate to workflow review page with the template
      navigate("/workflow/review", {
        state: {
          templateId: template.id,
          templateTitle: template.title,
          jsonFile: template.jsonFile,
        },
      });
    }
  };

  const filteredTemplates = templateConfigs.filter((template) => {
    if (selectedFilter === "all") return true;
    // Match based on category or keywords in title/description
    const searchText =
      `${template.title} ${template.description} ${template.category}`.toLowerCase();
    return searchText.includes(selectedFilter.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-brand-heading mb-2">
          Workflow Templates
        </h1>
        <p className="text-brand-muted">
          Pre-built automation templates for common compliance and operational
          workflows
        </p>
      </div>

      {/* Filter Options */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedFilter(option.value)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              selectedFilter === option.value
                ? "bg-brand-primary text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:border-brand-primary hover:bg-brand-light"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredTemplates.map((template) => {
          const IconComponent = iconMap[template.id] || MagnifyingGlassIcon;

          return (
            <div
              key={template.id}
              onClick={() => handleTemplateClick(template.id)}
              className="bg-white rounded-xl p-6 shadow-sm border border-brand-border hover:border-brand-primary hover:shadow-lg transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl bg-brand-primaryLight group-hover:bg-brand-primary transition-colors`}
                >
                  <IconComponent
                    className={`h-6 w-6 text-brand-primary group-hover:text-white transition-colors`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-brand-heading mb-2 group-hover:text-brand-primary transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-sm text-brand-muted mb-4 line-clamp-3">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-brand-muted">
                      {template.steps} steps • {template.estimatedTime}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        template.steps < 40
                          ? "bg-brand-success text-black"
                          : template.steps < 60
                          ? "bg-brand-warning text-black"
                          : "bg-brand-purple text-white"
                      }`}
                    >
                      {template.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
