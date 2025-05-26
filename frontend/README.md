# Partner Assistant Workflows Demo

An interactive demonstration of Partner Assistant (PA) workflows focused on co-selling scenarios.

## Overview

This web application demonstrates the various workflows that the Partner Assistant can handle, focusing on streamlining partner-related processes for different user personas. The demo showcases how PA can help with AWS co-selling, GSI/Service partner collaborations, and other partner-related tasks.

## Features

- **Persona-based Navigation**: Select from different user personas including Partner Manager, Partner Leader, Account Manager, and Sales Leadership
- **Workflow Catalog**: Browse workflows organized by use case categories
- **Interactive Workflow Execution**: Step-by-step visualization of how PA processes each request
- **Chat Simulation**: See how users would interact with PA through natural language
- **Realistic Visualizations**: View partner mapping grids, opportunity lists, and other data representations

## Workflows Demonstrated

### AWS Co-Selling
- Identifying & Tagging AWS Opportunities
- Partner Manager ACE Deal Registrations
- Account Manager ACE Deal Registration
- Monitor Movement of Partner Related Deals
- Keep AWS ACE Filings in Sync

### GSI/Service Partner Co-Selling
- Partner Help for Customer Retention
- Co-Marketing Opportunities
- Quick Wins for New Partnerships

## Technical Details

This demo is built using:
- React + TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Headless UI components

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Screenshots

The demo includes several screens:

1. Persona Selection - Choose which role you want to simulate
2. Workflow Selection - Browse available workflows based on your persona
3. Workflow Execution - Interactive step-by-step execution with visualizations
4. Results Display - See the output of each workflow with realistic data

## Use Cases

This demo is designed to illustrate how PA can help with:

- Automating the identification and tagging of AWS opportunities
- Facilitating deal registrations in partner systems
- Monitoring partner-related deals
- Identifying partners for customer retention
- Finding co-marketing opportunities
- Discovering quick wins for new partnerships

The demonstration highlights the capabilities of the Partner Assistant in improving efficiency, data accuracy, and collaboration in partner-related activities.

# Project Task Checklist

## 1. Populate All Charts with Realistic Fake Data
- [X] Identify all chart and data visualization areas in `App.tsx` (Budget, Forecast, etc.)
- [X] Replace placeholder or static values with realistic fake data from `src/data/mockData.ts` or similar
- [X] Add/replace chart components (e.g., bar, line, pie) for Budget, Forecast, and other analytics
- [X] Ensure all summary cards and tables use mock data

## 2. Make PowerBI and Orbit Integration Buttons Functional (with Mock Data)
- [X] Add click handlers to PowerBI and Orbit Analytics integration buttons
- [X] On click, show a modal or side panel with mock integration data (e.g., sample charts, connection status, last sync)
- [X] Use mock data to simulate integration status and data fetch
- [X] Ensure UI feedback for successful/failed (mock) integration

## 3. Build an AI Agent Section for Back Office Workflows
- [ ] Add a new section/component for "Build an AI Agent" in the main UI
- [ ] Implement a stepper or wizard for the following workflow:
    1. [ ] Click "Create AI Agent"
    2. [ ] Choose a predefined workflow (Accounts Payable, Receivable, Payroll, Entitlements)
    3. [ ] Choose data sources to connect (show mock options)
    4. [ ] Choose actions/results (e.g., "Send payment reminder", "Run payroll report")
    5. [ ] Choose the LLM (show Perplexity or other model options with a short use-case description)
    6. [ ] Start the agent and show a mock execution summary/results
- [ ] Use only fake/mock data for all steps and results
- [ ] Ensure the UI is clear, modern, and user-friendly

## 4. General
- [ ] Add/adjust mock data in `src/data/` as needed for new features
- [ ] Test all new UI flows for usability and completeness
- [ ] Update documentation/screenshots as needed