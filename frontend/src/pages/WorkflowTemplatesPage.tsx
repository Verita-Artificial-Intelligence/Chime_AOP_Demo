import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCardIcon,
  UserIcon,
  MagnifyingGlassIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import { templatesApiService, WorkflowTemplate } from "../services/templatesApiService";

// Map template IDs to icons
const iconMap: Record<string, React.ElementType> = {
  "credit-dispute-credit-bureau": CreditCardIcon,
  "direct-dispute-member": UserIcon,
  "complex-dispute-equifax": MagnifyingGlassIcon,
  "kyc-kyb-workflow": UserIcon,
  "vendor-workflow": CreditCardIcon,
  "vendor-maintenance-offboarding": UserIcon,
  "compliance-operations-workflow": MagnifyingGlassIcon,
  "kyb-audit-workflow": UserIcon,
};

// Function to get icon for template
const getTemplateIcon = (template: any): React.ElementType => {
  if (template.id.startsWith("generated-")) {
    return CpuChipIcon; // Use CPU chip icon for generated workflows
  }
  return iconMap[template.id] || MagnifyingGlassIcon;
};

export const WorkflowTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates from API on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedTemplates = await templatesApiService.getTemplates();
        setTemplates(fetchedTemplates);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setError('Failed to load templates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const filterOptions = [
    { value: "all", label: "All Workflows" },
    { value: "compliance", label: "Compliance" },
    { value: "legal", label: "Legal" },
    { value: "generated", label: "Generated" },
  ];

  const handleTemplateClick = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);

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

  const filteredTemplates = templates.filter((template) => {
    if (selectedFilter === "all") return true;
    // Handle special case for "generated" workflows
    if (selectedFilter === "generated") {
      return template.category.toLowerCase() === "generated";
    }
    // Match based on category or keywords in title/description
    const searchText =
      `${template.title} ${template.description} ${template.category}`.toLowerCase();
    return searchText.includes(selectedFilter.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-brand-heading mb-2">
            Workflow Library
          </h1>
          <p className="text-brand-muted">
            Pre-built automation workflows and generated workflows from SOP documents
          </p>
        </div>

      </div>

      {/* Filter Options */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedFilter(option.value)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              selectedFilter === option.value
                ? "bg-brand-primary text-white shadow-sm ring-2 ring-brand-primary ring-opacity-20"
                : "bg-white text-gray-700 border border-gray-300 hover:border-brand-primary hover:bg-brand-light"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          <span className="ml-3 text-brand-muted">Loading workflows...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Error loading workflows</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      {!loading && !error && (
        <div className="grid gap-6 md:grid-cols-2">
        {filteredTemplates.map((template) => {
          const IconComponent = getTemplateIcon(template);
          const isGenerated = template.category === "GENERATED";

          return (
            <div
              key={template.id}
              onClick={() => handleTemplateClick(template.id)}
              className="bg-white rounded-xl p-6 shadow-sm border border-brand-border hover:border-2 hover:border-brand-primary hover:shadow-md hover:ring-2 hover:ring-brand-primary hover:ring-opacity-10 transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl ${isGenerated ? 'bg-purple-100 group-hover:bg-purple-600' : 'bg-brand-primaryLight group-hover:bg-brand-primary'} transition-colors`}
                >
                  <IconComponent
                    className={`h-6 w-6 ${isGenerated ? 'text-purple-600 group-hover:text-white' : 'text-brand-primary group-hover:text-white'} transition-colors`}
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
      )}

      {/* Empty State */}
      {!loading && !error && templates.length === 0 && (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No workflows are available at the moment.
          </p>
        </div>
      )}

      {/* No filtered results */}
      {!loading && !error && templates.length > 0 && filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows match your filter</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try selecting a different category or filter option.
          </p>
        </div>
      )}
    </div>
  );
};
