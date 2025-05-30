# Client Configuration Guide

This directory contains configuration files for customizing the application for different clients.

## Overview

The `content.ts` file contains all client-specific text and branding content that can be easily modified when white-labeling the application for different clients. Visual styling (colors, fonts, etc.) is handled directly in the Tailwind configuration and other relevant files.

## Configuration Structure

### Text Content (in content.ts)
- `clientName`: The client's company name (e.g., "Chime", "JP Morgan")
- `platformName`: The platform name (e.g., "AOPS")
- `platformFullName`: Full platform name for display
- `pageTitleSuffix`: Browser tab title suffix
- `welcomeMessage`: Main welcome message on the home page
- `builderWelcomeMessage`: Welcome message in the AOP builder
- `builderDescription`: Description text in the builder
- `footerText`: Copyright text in the footer

### Visual Styling (in tailwind.config.js)
- Brand colors
- Font families
- Border radius values
- Shadow styles
- Other visual properties

## How to Customize for a New Client

### 1. Update Text Content
Edit `src/config/content.ts`:

```typescript
const content: ContentConfig = {
  // Example for JP Morgan
  clientName: "JP Morgan",
  platformName: "AOPS",
  platformFullName: "JP Morgan AOPS Platform",
  pageTitleSuffix: "Automation Platform",
  welcomeMessage: "JP Morgan AOPS Platform",
  builderWelcomeMessage: "JP Morgan AOPS Builder",
  builderDescription: "JP Morgan workflows. Get started by selecting a workflow template.",
  footerText: "© 2025 JP Morgan AOPS",
};
```

### 2. Update Visual Styling
Edit `tailwind.config.js` to update colors, fonts, and other visual properties:

```javascript
colors: {
  brand: {
    primary: "#117ACA", // JP Morgan blue
    primaryDark: "#0E5FA0",
    // ... other colors
  }
}
```

### 3. Update Custom CSS (if needed)
Check `src/App.css` for any hardcoded colors that need updating.

## Example Configurations

This directory includes example configurations for different clients:

- `content.chime.example.ts` - Chime text configuration
- `content.jpmorgan.example.ts` - JP Morgan text configuration

Root directory includes:
- `tailwind.config.chime.example.js` - Chime visual styling
- Current `tailwind.config.js` - JP Morgan visual styling

To switch between clients:
1. Copy the desired content example to `content.ts`
2. Copy the desired Tailwind config to `tailwind.config.js`
3. Restart the development server

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

## Best Practices

1. Keep all text content in the configuration file
2. Use Tailwind classes for styling rather than inline styles
3. Document any client-specific customizations
4. Test thoroughly when switching between configurations

## Future Enhancements

Consider these potential improvements:
- Multiple language support
- Logo/image configuration  
- Feature flags for client-specific functionality
- Environment-based configuration loading 