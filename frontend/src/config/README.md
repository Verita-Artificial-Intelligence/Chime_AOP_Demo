# Client Configuration Guide

This directory contains configuration files for customizing the application for different clients.

## Overview

The `content.ts` file contains all client-specific text, branding, and color configurations that can be easily modified when white-labeling the application for different clients.

## Configuration Structure

### Text Content
- `clientName`: The client's company name (e.g., "Chime", "JP Morgan")
- `platformName`: The platform name (e.g., "AOPS")
- `platformFullName`: Full platform name for display
- `pageTitleSuffix`: Browser tab title suffix
- `welcomeMessage`: Main welcome message on the home page
- `builderWelcomeMessage`: Welcome message in the AOP builder
- `builderDescription`: Description text in the builder
- `footerText`: Copyright text in the footer

### Colors
- `primary`: Primary brand color
- `primaryHover`: Hover state for primary color
- `secondary`: Secondary color for accents
- `background`: Main background color

## How to Customize for a New Client

1. Open `src/config/content.ts`
2. Update the values in the `content` object:

```typescript
const content: ContentConfig = {
  // Example for JP Morgan
  clientName: "JP Morgan",
  platformName: "AOPS",
  platformFullName: "JP Morgan AOPS Platform",
  pageTitleSuffix: "Automation Platform",
  welcomeMessage: "Welcome to the JP Morgan AOPS Platform",
  builderWelcomeMessage: "Welcome to the JP Morgan AOPS Builder",
  builderDescription: "JP Morgan workflows. Get started by selecting a workflow template.",
  footerText: "© 2025 JP Morgan AOPS",
  
  colors: {
    primary: "#003087", // JP Morgan blue
    primaryHover: "#002060", // Darker blue for hover
    secondary: "#6B7280",
    background: "#FFFFFF",
  }
};
```

3. Save the file and restart the development server

## Adding New Configuration Options

To add new configurable content:

1. Add the new field to the `ContentConfig` interface
2. Add the corresponding value to the `content` object
3. Import and use the configuration value in your components:

```typescript
import content from "../config/content";

// Use in component
<h1>{content.yourNewField}</h1>
```

## Dynamic Theming

The application automatically applies the configured colors as CSS variables when it loads. These can be referenced in Tailwind classes or custom CSS if needed.

## Future Enhancements

Consider these potential improvements:
- Multiple language support
- Logo/image configuration
- Feature flags for client-specific functionality
- Environment-based configuration loading 