import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCardIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { templateConfigs } from "../data/templateConfigs";
import { WorkflowReview } from "../components/WorkflowReview";

// Map template IDs to icons
const iconMap: Record<string, React.ElementType> = {
  'credit-dispute-credit-bureau': CreditCardIcon,
  'direct-dispute-member': UserIcon,
  'complex-dispute-equifax': MagnifyingGlassIcon,
};

export const WorkflowTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const handleTemplateClick = (templateId: string) => {
    const template = templateConfigs.find(t => t.id === templateId);

    if (template) {
      // Navigate to workflow review page with the template
      navigate('/workflow/review', { 
        state: { 
          templateId: template.id,
          templateTitle: template.title,
          jsonFile: template.jsonFile 
        } 
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Workflow Templates
        </h1>
        <p className="text-gray-600">
          Pre-built automation templates for common compliance and operational
          workflows
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templateConfigs.map((template, index) => {
          const IconComponent = iconMap[template.id] || MagnifyingGlassIcon;
          
          return (
            <div
              key={template.id}
              onClick={() => handleTemplateClick(template.id)}
              className={`bg-white rounded-lg shadow-sm border ${
                index === 0 ? "border-brand-primary border-2" : "border-gray-200"
              } p-6 hover:shadow-lg transition-all cursor-pointer group h-full flex flex-col`}
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
                  <IconComponent
                    className={`h-6 w-6 ${
                      index === 0 ? "text-brand-primary" : "text-gray-600"
                    } group-hover:text-brand-primary`}
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-brand-primary transition-colors">
                {template.title}
              </h3>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
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
          );
        })}
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Need a custom template?
        </h2>
        <p className="text-gray-600 mb-4">
          Create your own automation workflow from scratch using our Workflow
          Builder.
        </p>
        <button
          onClick={() => navigate("/workflow/builder")}
          className="px-4 py-2 bg-brand-primary text-brand-dark rounded-md hover:bg-brand-hover transition-colors font-semibold"
        >
          Create Custom Workflow
        </button>
      </div>
    </div>
  );
};
