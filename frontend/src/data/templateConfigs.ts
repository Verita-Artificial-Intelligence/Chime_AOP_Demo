interface TemplateConfig {
  name: string;
  workflow: string;
  dataSources: string[];
  actions: string[];
  llm: string;
}

const templateConfigs: Record<string, TemplateConfig> = {
  "fcra-acdv-response": {
    name: "FCRA - Respond to ACDV case, Apply response code, Respond to consumer",
    workflow: "fcra-acdv-response",
    dataSources: [
      "ACDV Case Management System",
      "B-Point Verification Database",
      "Dispute Code Repository",
      "Compliance Database",
      "OSCAR System",
      "Consumer Communication System",
    ],
    actions: [
      "Receive ACDV case",
      "Perform B-Point verification",
      "Investigate dispute code",
      "Evaluate escalation requirements",
      "Notify Fraud-Ops",
      "Notify Legal/Compliance (if escalated)",
      "Process through AI Agent",
      "Save case to OSCAR system",
      "Send member acknowledgment",
      "Submit final response",
      "Apply admin notation",
      "Close case",
    ],
    llm: "compliance-llm",
  },
  "fcra-indirect-dispute": {
    name: "FCRA - Complete an ACDV indirect dispute",
    workflow: "fcra-indirect-dispute",
    dataSources: [
      "Email Communication System",
      "Dispute Management Database",
      "Identity Verification System",
      "Account Information Database",
      "B-Point Verification System",
      "Balance & Tradeline Database",
      "AI Processing Engine",
      "FCRA Response Templates",
      "Internal Notes System",
      "Dispute Status Tracker",
    ],
    actions: [
      "Check case email status",
      "Review dispute content",
      "Verify ID verification",
      "Verify account info",
      "Verify B-point",
      "Balance vs tradeline check",
      "Process through AI Agent",
      "Draft FCRA response",
      "Verify internal notes",
      "Update dispute status",
      "Save case",
    ],
    llm: "compliance-llm",
  },
  "aml-monitoring": {
    name: "Anti-Money Laundering (AML) Monitoring",
    workflow: "fraud-investigation",
    dataSources: [
      "Transaction Database",
      "Customer Profile System",
      "External Fraud Database",
      "Payment Gateway Logs",
    ],
    actions: [
      "Analyze transaction patterns",
      "Cross-reference with known fraud indicators",
      "Generate risk score",
      "Create investigation report",
      "Flag suspicious accounts",
      "Notify compliance team",
    ],
    llm: "fraud-detection-llm",
  },
  "regulatory-reporting": {
    name: "Regulatory Reporting Automation",
    workflow: "fcra-indirect-dispute",
    dataSources: [
      "Email Communication System",
      "Dispute Management Database",
      "Identity Verification System",
      "Account Information Database",
      "FCRA Response Templates",
      "Internal Notes System",
    ],
    actions: [
      "Check case email status",
      "Review dispute content",
      "Verify ID verification",
      "Verify account info",
      "Process through AI Agent",
      "Draft FCRA response",
      "Save case",
    ],
    llm: "compliance-llm",
  },
  "audit-trail": {
    name: "Audit Trail Generation",
    workflow: "fcra-indirect-dispute",
    dataSources: [
      "Dispute Management Database",
      "AI Processing Engine",
      "FCRA Response Templates",
      "Internal Notes System",
      "Dispute Status Tracker",
    ],
    actions: [
      "Review dispute content",
      "Process through AI Agent",
      "Draft FCRA response",
      "Verify internal notes",
      "Update dispute status",
      "Save case",
    ],
    llm: "compliance-llm",
  },
  "risk-assessment": {
    name: "Automated Risk Assessment",
    workflow: "fraud-investigation",
    dataSources: [
      "Transaction Database",
      "Customer Profile System",
      "External Fraud Database",
      "Payment Gateway Logs",
    ],
    actions: [
      "Analyze transaction patterns",
      "Cross-reference with known fraud indicators",
      "Generate risk score",
      "Create investigation report",
      "Flag suspicious accounts",
      "Notify compliance team",
    ],
    llm: "fraud-detection-llm",
  },
};

export default templateConfigs;
