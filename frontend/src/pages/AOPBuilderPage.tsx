import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import mockData from "../data/mockData.json"; // Assuming mockData is accessible
import {
  SparklesIcon,
  PaperClipIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { llmService } from "../services/llmService";

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
  files?: UploadedFile[]; // Add support for file attachments
}

interface UploadedFile {
  id: string;
  file: File;
  type: "image" | "video";
  url: string;
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
    id: "ai-fcra-acdv",
    title: "FCRA - Respond to ACDV case, Apply response code, Respond to consumer",
    description:
      "Based on your compliance needs, automate the Fair Credit Reporting Act (FCRA) response process for ACDV cases, including verification, investigation, escalation handling, and consumer communication.",
    config: {
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
        "Notify Legal/Compliance",
        "Process through AI Agent",
        "Save case to OSCAR system",
        "Send member acknowledgment",
        "Submit final response",
        "Apply admin notation",
        "Close case",
      ],
      llm: "compliance-llm",
    },
  },
  {
    id: "ai-fcra-indirect",
    title: "FCRA - Complete an ACDV indirect dispute",
    description:
      "Based on your compliance needs, automate the Fair Credit Reporting Act (FCRA) process for handling indirect disputes, including verification, AI processing, and response generation.",
    config: {
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
  },
];

// Template configurations
const TEMPLATE_CONFIGS: { [key: string]: MockPrompt } = {
  "fcra-acdv-response": {
    id: "template-fcra",
    title: "FCRA - Respond to ACDV case, Apply response code, Respond to consumer",
    description:
      "Comprehensive FCRA compliance workflow for handling ACDV cases with automated verification, investigation, and response processes.",
    config: {
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
        "Notify Fraud-Ops (if escalated)",
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
  },
  // Add other template configurations as needed
  "fcra-indirect-dispute": {
    id: "template-fcra-indirect",
    title: "FCRA - Complete an ACDV indirect dispute",
    description:
      "Comprehensive FCRA workflow for handling indirect disputes with automated verification and response generation.",
    config: {
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
  },
};

export function AOPBuilderPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if we're loading from a template
  useEffect(() => {
    const templateId = searchParams.get("template");
    if (templateId && TEMPLATE_CONFIGS[templateId]) {
      // For template initialization, we'll handle it differently to avoid duplicates
      const template = TEMPLATE_CONFIGS[templateId];
      setShowAISuggestions(false);
      // Only add the initial user message
      setMessages([
        {
          id: Date.now().toString(),
          sender: "user",
          text: `I want to: ${template.title}`,
          timestamp: new Date().toISOString(),
        },
      ]);
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
    config?: AgentConfig,
    files?: UploadedFile[]
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: config ? "save-button" : Date.now().toString(),
        sender,
        text,
        timestamp: new Date().toISOString(),
        config,
        files,
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = [];
    const errors: string[] = [];
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit
    const MAX_TOTAL_FILES = 3; // Maximum 3 files at once

    // Check total file limit
    if (uploadedFiles.length + files.length > MAX_TOTAL_FILES) {
      addMessage(
        "system",
        `You can only upload up to ${MAX_TOTAL_FILES} files at once. Currently have ${uploadedFiles.length} file(s).`
      );
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} exceeds the 10MB size limit`);
        continue;
      }

      const fileType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : null;

      if (fileType) {
        const url = URL.createObjectURL(file);
        newFiles.push({
          id: Date.now().toString() + "-" + i,
          file,
          type: fileType,
          url,
        });
      } else {
        errors.push(`${file.name} is not a supported image or video format`);
      }
    }

    // Show errors if any
    if (errors.length > 0) {
      addMessage("system", `File upload issues: ${errors.join(", ")}`);
    }

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.url);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!chatInput.trim() && uploadedFiles.length === 0) || isBuilding) return;

    const userMessage = chatInput.trim();
    const attachedFiles = [...uploadedFiles];
    setChatInput("");
    setUploadedFiles([]);
    setShowAISuggestions(false);

    // Check for keywords and trigger appropriate workflow
    const lowerCaseMessage = userMessage.toLowerCase();

    if (
      (lowerCaseMessage.includes("fcra") || lowerCaseMessage.includes("acdv") || lowerCaseMessage.includes("credit dispute")) &&
      !lowerCaseMessage.includes("not") &&
      !lowerCaseMessage.includes("except")
    ) {
      // Trigger FCRA ACDV response workflow
      const fcraPrompt = AI_SUGGESTIONS.find(
        (s) => s.id === "ai-fcra-acdv"
      );
      if (fcraPrompt) {
        handlePromptSelect(fcraPrompt);
      }
    } else if (
      (lowerCaseMessage.includes("indirect") || lowerCaseMessage.includes("email dispute") || lowerCaseMessage.includes("consumer dispute")) &&
      !lowerCaseMessage.includes("not") &&
      !lowerCaseMessage.includes("except")
    ) {
      // Trigger FCRA indirect dispute workflow
      const indirectPrompt = AI_SUGGESTIONS.find(
        (s) => s.id === "ai-fcra-indirect"
      );
      if (indirectPrompt) {
        handlePromptSelect(indirectPrompt);
      }
    } else {
      // For any other input, use LLM to generate workflow
      addMessage(
        "user",
        userMessage || "Uploaded files for analysis",
        undefined,
        attachedFiles
      );
      setIsBuilding(true);

      const hasFiles = attachedFiles.length > 0;
      const analysisMessage = hasFiles
        ? "Let me analyze your request along with the uploaded files to create a custom AOP workflow..."
        : "Let me analyze your request and create a custom AOP workflow for you...";

      addMessage("agent", analysisMessage);

      try {
        // Call LLM service to generate workflow with visual context
        const llmResponse = await llmService.generateWorkflowWithVisuals(
          userMessage,
          attachedFiles
        );

        if ("error" in llmResponse) {
          // Handle error response
          addMessage(
            "agent",
            `I encountered an issue: ${llmResponse.message}. Let me use a template approach instead.`
          );

          // Fallback to a generic workflow
          const fallbackPrompt: MockPrompt = {
            id: "llm-generated",
            title: userMessage || "Visual-based workflow",
            description: hasFiles
              ? "Custom workflow based on your uploaded visuals"
              : "Custom workflow based on your request",
            config: {
              workflow: "custom-workflow",
              dataSources: [
                "Primary Database",
                "API Gateway",
                "Document Store",
                "Media Storage",
              ],
              actions: [
                "Initialize process",
                "Analyze visual data",
                "Extract key information",
                "Execute automation",
                "Generate report",
              ],
              llm: "general-purpose-llm",
            },
          };

          await handlePromptSelect(fallbackPrompt);
        } else {
          // Successfully generated workflow
          const generatedPrompt: MockPrompt = {
            id: "llm-generated-" + Date.now(),
            title: llmResponse.name,
            description: llmResponse.description,
            config: {
              workflow: llmResponse.workflow,
              dataSources: llmResponse.dataSources,
              actions: llmResponse.actions,
              llm: llmResponse.llm,
            },
          };

          // Process the generated workflow
          await handleLLMGeneratedPrompt(generatedPrompt, llmResponse.category);
        }
      } catch (error) {
        console.error("Error generating workflow:", error);
        addMessage(
          "agent",
          "I encountered an unexpected error. Please try again or be more specific about your automation needs."
        );
        setIsBuilding(false);
      }
    }

    // Clean up file URLs
    attachedFiles.forEach((file) => URL.revokeObjectURL(file.url));
  };

  const handleLLMGeneratedPrompt = async (
    prompt: MockPrompt,
    category: string
  ) => {
    // Similar to handlePromptSelect but for LLM-generated workflows
    addMessage("agent", `I've created a custom workflow: "${prompt.title}"`);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    addMessage("agent", `Category: ${category}`);
    addMessage("agent", prompt.description);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    addMessage("agent", "Setting up data sources:");
    for (const ds of prompt.config.dataSources) {
      addMessage("agent", `• ${ds}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    addMessage("agent", "Configuring automation actions:");
    for (const action of prompt.config.actions) {
      addMessage("agent", `• ${action}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    addMessage(
      "agent",
      `Using LLM: ${
        prompt.config.llm === "general-purpose-llm"
          ? "OpenAI GPT-4o"
          : prompt.config.llm
      }`
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
      `Your custom AOP "${prompt.title}" is ready!`,
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
        // Navigate to active runs with the agent configuration
        navigate("/aop/active-runs", {
          state: {
            id: agentConfig.id,
            name: agentConfig.name,
            workflow: agentConfig.workflow,
            dataSources: agentConfig.dataSources,
            actions: agentConfig.actions,
            llm: agentConfig.llm,
            fromBuilder: true,
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
              {msg.files && msg.files.length > 0 && (
                <div className="mt-2 space-y-2">
                  {msg.files.map((file) => (
                    <div
                      key={file.id}
                      className="border border-white/20 rounded p-2"
                    >
                      {file.type === "image" ? (
                        <img
                          src={file.url}
                          alt={file.file.name}
                          className="max-w-full h-auto max-h-48 rounded"
                        />
                      ) : (
                        <video
                          src={file.url}
                          controls
                          className="max-w-full h-auto max-h-48 rounded"
                        />
                      )}
                      <p className="text-xs mt-1 opacity-80">
                        {file.file.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
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

      {/* File preview section */}
      {uploadedFiles.length > 0 && (
        <div className="mb-2 p-3 bg-brand-light rounded-lg">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="relative group">
                {file.type === "image" ? (
                  <img
                    src={file.url}
                    alt={file.file.name}
                    className="h-20 w-20 object-cover rounded border border-brand-border"
                  />
                ) : (
                  <div className="h-20 w-20 bg-gray-200 rounded border border-brand-border flex items-center justify-center">
                    <span className="text-xs text-gray-600">Video</span>
                  </div>
                )}
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={handleChatSubmit}
        className="mt-auto p-4 bg-brand-card border-t border-brand-border rounded-b-lg"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your AOP request or upload files..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isBuilding}
            className="flex-1 p-3 border border-brand-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBuilding}
            className="p-3 border border-brand-border rounded-md bg-white hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            <PaperClipIcon className="h-5 w-5 text-brand-dark" />
          </button>
          <button
            type="submit"
            disabled={
              isBuilding || (!chatInput.trim() && uploadedFiles.length === 0)
            }
            className="px-4 py-3 bg-brand-primary text-white rounded-md hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
