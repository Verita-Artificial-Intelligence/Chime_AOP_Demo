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
  "compliance-audit": {
    name: "KYC Compliance Verification",
    workflow: "compliance-audit",
    dataSources: [
      "System Activity Logs",
      "User Access Database",
      "Transaction Records",
    ],
    actions: [
      "Collect system activities",
      "Map user actions to compliance requirements",
      "Generate audit reports",
      "Archive for regulatory review",
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
    workflow: "compliance-audit",
    dataSources: [
      "System Activity Logs",
      "User Access Database",
      "Transaction Records",
    ],
    actions: [
      "Collect system activities",
      "Map user actions to compliance requirements",
      "Generate audit reports",
      "Archive for regulatory review",
    ],
    llm: "compliance-llm",
  },
  "audit-trail": {
    name: "Audit Trail Generation",
    workflow: "compliance-audit",
    dataSources: [
      "System Activity Logs",
      "User Access Database",
      "Transaction Records",
    ],
    actions: [
      "Collect system activities",
      "Map user actions to compliance requirements",
      "Generate audit reports",
      "Archive for regulatory review",
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
