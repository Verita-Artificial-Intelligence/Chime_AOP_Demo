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
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    background: string;
  };
}

const content: ContentConfig = {
  // Client branding
  clientName: "Verita",
  platformName: "Workflows",
  platformFullName: "Verita AI Platform",

  // Page titles and metadata
  pageTitleSuffix: "AI Demo",

  // Welcome messages
  welcomeMessage: "Verita Dashboard",
  builderWelcomeMessage: "Verita AI Builder",
  builderDescription:
    "Verita AI workflows. Get started by selecting a workflow template.",

  // Footer
  footerText: "© 2025 Verita AI",

  // Brand colors
  colors: {
    primary: "#04BAF7", // Bright Sky Blue
    primaryHover: "#0396D1", // Darker blue for hover
    secondary: "#FFDD04", // Vivid Yellow
    background: "#FFFFFF", // White background
  },
};

// Function to apply colors as CSS variables
export function applyThemeColors() {
  const root = document.documentElement;
  root.style.setProperty("--color-brand-primary", content.colors.primary);
  root.style.setProperty("--color-brand-hover", content.colors.primaryHover);
  root.style.setProperty("--color-brand-secondary", content.colors.secondary);
  root.style.setProperty("--color-brand-background", content.colors.background);
}

export default content;
