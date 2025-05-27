import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import mockData from "../data/mockData.json"; // Assuming mockData is accessible
import { SparklesIcon } from "@heroicons/react/24/outline";

interface AgentConfig {
  id: string;
  name: string;
  workflow: string;
  dataSources: string[];
  actions: string[];
  llm: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "agent" | "system";
  text: string;
  timestamp: string;
  config?: AgentConfig; // Optional: only for system messages that offer saving
}

interface MockPrompt {
  id: string;
  title: string;
  description: string;
  config: {
    workflow: string;
    dataSources: string[];
    actions: string[];
    llm: string;
  };
}

// Placeholder for mock prompts - we'll define these later
const MOCK_PROMPTS: MockPrompt[] = [
  // We will populate this using the mockData
  {
    id: "prompt-1",
    title: "Onboard a New Restaurant Partner",
    description:
      "Automate the full onboarding process for a new restaurant, from document verification to menu setup and welcome kit dispatch.",
    config: {
      workflow: "restaurant-onboarding",
      dataSources: [
        "Doordash Merchant API",
        "Internal CRM",
        "Payment Gateway Logs",
      ],
      actions: [
        "Verify legal documents",
        "Create merchant account",
        "Configure menu in Doordash system",
        "Schedule photoshoot",
        "Send welcome kit",
      ],
      llm: "doordash-support-llm",
    },
  },
  {
    id: "prompt-2",
    title: "Optimize Peak Time Driver Dispatch",
    description:
      "Dynamically adjust driver dispatch during peak hours using real-time data and predictive modeling to improve delivery times.",
    config: {
      workflow: "driver-dispatch",
      dataSources: [
        "Dasher Activity Database",
        "Customer Order System",
        "Google Maps API",
        "Weather Service API",
      ],
      actions: [
        "Analyze real-time order volume",
        "Predict demand hotspots using ML model",
        "Calculate optimal driver-to-order ratio",
        "Send dispatch notifications to available Dashers",
        "Monitor delivery ETAs and adjust routes dynamically",
      ],
      llm: "doordash-logistics-llm",
    },
  },
  {
    id: "prompt-3",
    title: "Process Customer Refund Requests Automatically",
    description:
      "Handle common customer refund scenarios automatically by verifying order details and applying refund policies.",
    config: {
      workflow: "customer-refund",
      dataSources: [
        "Customer Order System",
        "Payment Gateway Logs",
        "Internal CRM",
      ],
      actions: [
        "Receive refund request via API/Webhook",
        "Verify order details against order history",
        "Check against refund policy rules engine",
        "If approved, issue refund via Payment Gateway",
        "Notify customer of refund status",
        "Flag suspicious requests for manual review",
      ],
      llm: "doordash-support-llm",
    },
  },
  {
    id: "prompt-4",
    title: "Propagate Restaurant Menu Updates in Real-Time",
    description:
      "Ensure menu changes from restaurants are reflected instantly across all Doordash platforms and notify Dashers of significant updates.",
    config: {
      workflow: "menu-update",
      dataSources: ["Doordash Merchant API"],
      actions: [
        "Receive menu change request from restaurant portal",
        "Validate changes (e.g., price format, item availability)",
        "Update menu in central database",
        "Push updates to customer-facing apps",
        "Notify Dashers of significant changes (e.g., new items)",
      ],
      llm: "general-purpose-llm", // Or a more specific one if available
    },
  },
  {
    id: "prompt-5",
    title: "Monitor Restaurant Operational Hours",
    description:
      "Check and flag discrepancies in restaurant operating hours reported versus actual availability.",
    config: {
      workflow: "restaurant-ops-monitoring", // Invented workflow ID
      dataSources: ["Doordash Merchant API", "Dasher Activity Database"],
      actions: [
        "Fetch Stated Restaurant Hours",
        "Analyze Dasher Reports for Operational Status",
        "Compare Stated vs. Observed Hours",
        "Flag Discrepancies for Review",
      ],
      llm: "doordash-logistics-llm", // Plausible LLM for operational tasks
    },
  },
  {
    id: "prompt-6",
    title: "Proactive Dasher Peak Pay Adjustment",
    description:
      "Adjust Dasher peak pay incentives in real-time based on sudden demand surges or Dasher shortages.",
    config: {
      workflow: "dynamic-incentive-adjustment", // Invented workflow ID
      dataSources: [
        "Customer Order System",
        "Dasher Activity Database",
        "Weather Service API",
      ],
      actions: [
        "Monitor Real-Time Order Demand",
        "Assess Current Dasher Availability by Zone",
        "Identify Incentive Adjustment Triggers",
        "Calculate and Apply New Peak Pay Rates",
        "Notify Dashers of Incentive Changes",
      ],
      llm: "doordash-logistics-llm", // Logistics LLM for dynamic adjustments
    },
  },
];

// AI-generated suggestions based on "history"
const AI_SUGGESTIONS: MockPrompt[] = [
  {
    id: "ai-fraud-investigation",
    title: "Automating the discovery process for fraud investigation",
    description:
      "Based on your previous searches, streamline fraud detection and investigation workflows by automatically collecting and analyzing suspicious activities.",
    config: {
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
  },
  {
    id: "ai-compliance-audit",
    title: "Automated Compliance Audit Trail",
    description:
      "Based on your compliance workflows, automatically generate comprehensive audit trails for regulatory requirements.",
    config: {
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
  },
];

// Template configurations
const TEMPLATE_CONFIGS: { [key: string]: MockPrompt } = {
  "fraud-investigation": {
    id: "template-fraud",
    title: "Automating the discovery process for fraud investigation",
    description:
      "Comprehensive fraud detection and investigation workflow with automated data collection and analysis.",
    config: {
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
  },
  // Add other template configurations as needed
};

export function AOPBuilderPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  // Check if we're loading from a template
  useEffect(() => {
    const templateId = searchParams.get("template");
    if (templateId && TEMPLATE_CONFIGS[templateId]) {
      handlePromptSelect(TEMPLATE_CONFIGS[templateId]);
    }
  }, [searchParams]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const addMessage = (
    sender: ChatMessage["sender"],
    text: string,
    config?: AgentConfig
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: config ? "save-button" : Date.now().toString(),
        sender,
        text,
        timestamp: new Date().toISOString(),
        config,
      },
    ]);
  };

  const handlePromptSelect = async (prompt: MockPrompt) => {
    if (isBuilding) return;
    setIsBuilding(true);
    addMessage("user", `I want to: ${prompt.title}`);

    addMessage("agent", `Okay, let's build an AOP for: "${prompt.title}".`);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const workflowDetails = mockData.workflows.find(
      (wf) => wf.id === prompt.config.workflow
    );
    addMessage(
      "agent",
      `Selecting workflow: ${
        workflowDetails?.name || prompt.config.workflow
      }...`
    );
    await new Promise((resolve) => setTimeout(resolve, 1500));

    for (const ds of prompt.config.dataSources) {
      addMessage("agent", `Adding data source: ${ds}...`);
      await new Promise((resolve) => setTimeout(resolve, 700));
    }

    if (prompt.config.actions.length > 0) {
      for (const action of prompt.config.actions) {
        addMessage("agent", `Adding action: ${action}...`);
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
    } else {
      addMessage("agent", `No specific actions required for this workflow.`);
      await new Promise((resolve) => setTimeout(resolve, 700));
    }

    const llmDetails = mockData.llmOptions.find(
      (llm) => llm.id === prompt.config.llm
    );
    addMessage(
      "agent",
      `Selecting LLM: ${llmDetails?.name || prompt.config.llm}...`
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const finalAgentConfig: AgentConfig = {
      id: prompt.config.workflow + "-" + Date.now(),
      name: prompt.title,
      workflow: prompt.config.workflow,
      dataSources: prompt.config.dataSources,
      actions: prompt.config.actions,
      llm: prompt.config.llm,
      createdAt: new Date().toISOString(),
    };

    addMessage(
      "system",
      `AOP Configuration for "${prompt.title}" is complete!`,
      finalAgentConfig
    );

    setIsBuilding(false);
  };

  const saveAgent = (agentConfig: AgentConfig) => {
    try {
      const storedAgentsString = localStorage.getItem("aopAgents");
      const storedAgents = storedAgentsString
        ? JSON.parse(storedAgentsString)
        : [];
      localStorage.setItem(
        "aopAgents",
        JSON.stringify([...storedAgents, agentConfig])
      );
      addMessage("system", `Agent "${agentConfig.name}" saved successfully!`);
      setMessages((prev) => prev.filter((msg) => msg.id !== "save-button"));
      setTimeout(() => {
        // Navigate to active runs instead of run history
        navigate("/aop/active-runs", {
          state: {
            workflow: agentConfig.workflow,
            dataSources: agentConfig.dataSources,
            actions: agentConfig.actions,
            llm: agentConfig.llm,
            id: agentConfig.id,
          },
        });
      }, 1500);
    } catch (error) {
      console.error("Failed to save agent:", error);
      addMessage(
        "system",
        `Error saving agent "${agentConfig.name}". Please check console.`
      );
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-4 flex flex-col h-[calc(100vh-100px)] bg-brand-card">
      <h1 className="text-3xl font-bold text-brand-dark mb-6 text-center">
        AOP Builder
      </h1>

      <div className="flex-grow bg-brand-card p-6 rounded-lg overflow-y-auto mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-lg max-w-md ${
                msg.sender === "user"
                  ? "bg-brand-primary text-brand-dark"
                  : msg.sender === "agent"
                  ? "bg-brand-card text-brand-dark"
                  : "bg-brand-light text-brand-primary text-sm italic w-full text-center"
              }`}
            >
              {msg.text}
              {msg.id === "save-button" && msg.config && (
                <button
                  onClick={() => saveAgent(msg.config as AgentConfig)}
                  className="mt-2 px-4 py-2 bg-brand-primary text-brand-dark rounded-md hover:bg-brand-primaryDark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 w-full transition-all duration-200 font-semibold"
                >
                  Save & Run This AOP
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* AI Suggestions - Show only at the beginning */}
      {!isBuilding && messages.length === 0 && showAISuggestions && (
        <div className="mb-4 p-4 bg-brand-light rounded-lg">
          <div className="flex items-center mb-3">
            <SparklesIcon className="h-5 w-5 text-brand-primary mr-2" />
            <h3 className="text-sm font-semibold text-brand-dark">
              Based on your previous searches
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {AI_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => {
                  setShowAISuggestions(false);
                  handlePromptSelect(suggestion);
                }}
                className="p-3 border border-brand-primary/20 rounded-lg text-left bg-white hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 transition-all duration-150"
              >
                <h4 className="text-sm font-medium text-brand-dark">
                  {suggestion.title}
                </h4>
                <p className="text-xs text-brand-muted mt-1">
                  {suggestion.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto p-4 bg-brand-card border-t border-brand-border rounded-b-lg">
        <input
          type="text"
          placeholder="Chat disabled in demo mode (select a prompt above to begin building your AOP)..."
          disabled
          className="w-full p-3 border border-brand-border rounded-md bg-brand-light cursor-not-allowed"
        />
      </div>
    </div>
  );
}
