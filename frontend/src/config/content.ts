// Client-specific content configuration
// This file contains all text and branding elements that may change per client

export interface ContentConfig {
  clientName: string;
  platformName: string;
  platformFullName: string;
  pageTitleSuffix: string;
  welcomeMessage: string;
  builderWelcomeMessage: string;
  builderDescription: string;
  footerText: string;
}

const content: ContentConfig = {
  // Client branding
  clientName: "JP Morgan",
  platformName: "AOPS",
  platformFullName: "JP Morgan AOPS Platform",

  // Page titles and metadata
  pageTitleSuffix: "Automation Platform",

  // Welcome messages
  welcomeMessage: "JP Morgan AOPS Platform",
  builderWelcomeMessage: "JP Morgan AOPS Builder",
  builderDescription:
    "JP Morgan workflows. Get started by selecting a workflow template.",

  // Footer
  footerText: "© 2025 JP Morgan AOPS",
};

export default content;
