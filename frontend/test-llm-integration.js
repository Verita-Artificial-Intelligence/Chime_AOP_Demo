// Test script for LLM integration
// Run this with: node test-llm-integration.js

const testQueries = [
  "fraud", // Should use predefined fraud workflow
  "compliance", // Should use predefined compliance workflow
  "automate invoice processing", // Should trigger LLM/mock for invoice workflow
  "employee onboarding automation", // Should trigger LLM/mock for HR workflow
  "customer support ticket routing", // Should trigger LLM/mock for support workflow
  "automate inventory management", // Should trigger LLM/mock for generic workflow
];

console.log("LLM Integration Test Cases:");
console.log("===========================\n");

testQueries.forEach((query, index) => {
  console.log(`Test ${index + 1}: "${query}"`);

  const lowerQuery = query.toLowerCase();

  if (
    lowerQuery.includes("fraud") &&
    !lowerQuery.includes("not") &&
    !lowerQuery.includes("except")
  ) {
    console.log("→ Result: Will use PREDEFINED fraud workflow");
  } else if (
    lowerQuery.includes("compliance") &&
    !lowerQuery.includes("not") &&
    !lowerQuery.includes("except")
  ) {
    console.log("→ Result: Will use PREDEFINED compliance workflow");
  } else {
    console.log("→ Result: Will call LLM API to generate custom workflow");

    // Simulate what mock response would be returned
    if (lowerQuery.includes("invoice") || lowerQuery.includes("billing")) {
      console.log("  Mock: Invoice Processing Workflow");
    } else if (
      lowerQuery.includes("employee") ||
      lowerQuery.includes("onboarding")
    ) {
      console.log("  Mock: Employee Onboarding Workflow");
    } else if (
      lowerQuery.includes("customer") ||
      lowerQuery.includes("support")
    ) {
      console.log("  Mock: Customer Support Workflow");
    } else {
      console.log("  Mock: Generic Custom Workflow");
    }
  }

  console.log("");
});

console.log("\nEnvironment Variables Required:");
console.log("==============================");
console.log("REACT_APP_LLM_API_KEY=<your_api_key>");
console.log(
  "REACT_APP_LLM_API_ENDPOINT=https://api.openai.com/v1/chat/completions (optional)"
);
console.log(
  "\nNote: If API key is not set, the system will use mock responses for testing."
);
