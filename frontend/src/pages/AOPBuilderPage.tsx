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
  "compliance-audit": {
    id: "template-compliance",
    title: "Automated Compliance Audit Trail",
    description:
      "Comprehensive compliance audit trail with automated data collection and analysis.",
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
};

export function AOPBuilderPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  // Check if we're loading from a template
  useEffect(() => {
    const templateId = searchParams.get("template");
    if (templateId && TEMPLATE_CONFIGS[templateId]) {
      // For template initialization, we'll handle it differently to avoid duplicates
      const template = TEMPLATE_CONFIGS[templateId];
      setShowAISuggestions(false);
      // Only add the initial user message
      setMessages([{
        id: Date.now().toString(),
        sender: "user",
        text: `I want to: ${template.title}`,
        timestamp: new Date().toISOString(),
      }]);
      // Then trigger the build process after a short delay
      setTimeout(() => {
        handlePromptSelectFromTemplate(template);
      }, 500);
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

  const handlePromptSelectFromTemplate = async (prompt: MockPrompt) => {
    if (isBuilding) return;
    setIsBuilding(true);
    
    // Don't add user message as it's already added in the template initialization
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

  const handlePromptSelect = async (prompt: MockPrompt) => {
    if (isBuilding) return;
    setIsBuilding(true);
    setShowAISuggestions(false);
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

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isBuilding) return;

    const userMessage = chatInput.trim();
    setChatInput("");

    // Check for keywords and trigger appropriate workflow
    const lowerCaseMessage = userMessage.toLowerCase();

    if (lowerCaseMessage.includes("fraud")) {
      // Trigger fraud investigation workflow
      const fraudPrompt = AI_SUGGESTIONS.find(
        (s) => s.id === "ai-fraud-investigation"
      );
      if (fraudPrompt) {
        handlePromptSelect(fraudPrompt);
      }
    } else if (lowerCaseMessage.includes("compliance")) {
      // Trigger compliance audit workflow
      const compliancePrompt = AI_SUGGESTIONS.find(
        (s) => s.id === "ai-compliance-audit"
      );
      if (compliancePrompt) {
        handlePromptSelect(compliancePrompt);
      }
    } else {
      // For other messages, just add them to the chat
      addMessage("user", userMessage);
      addMessage(
        "agent",
        "I understand you're looking for help with automation. Try mentioning 'fraud' for fraud investigation workflows or 'compliance' for audit trail automation."
      );
    }
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
                  ? "bg-brand-primary text-white"
                  : msg.sender === "agent"
                  ? "bg-gray-100 text-brand-dark"
                  : "bg-brand-light text-brand-primary text-sm italic w-full text-center"
              }`}
            >
              {msg.text}
              {msg.id === "save-button" && msg.config && (
                <button
                  onClick={() => saveAgent(msg.config as AgentConfig)}
                  className="mt-2 px-4 py-2 bg-brand-primary text-brand-dark rounded-md hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 w-full transition-all duration-200 font-semibold"
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

      <form
        onSubmit={handleChatSubmit}
        className="mt-auto p-4 bg-brand-card border-t border-brand-border rounded-b-lg"
      >
        <input
          type="text"
          placeholder="Type your AOP request..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          disabled={isBuilding}
          className="w-full p-3 border border-brand-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </form>
    </div>
  );
}
