import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { templateConfigs } from "../data/templateConfigs";
import {
  SparklesIcon,
  PaperClipIcon,
  XMarkIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { llmService } from "../services/llmService";

interface AgentConfig {
  id: string;
  name: string;
  workflow: string;
  dataSources: string[];
  actions: string[];
  llm: string;
  verificationRequired: "no" | "yes"; // Add verification requirement field
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
const AI_SUGGESTIONS: MockPrompt[] = templateConfigs.map((template) => ({
  id: template.id,
  title: template.title,
  description: template.description,
  config: {
    workflow: template.id,
    dataSources: [],
    actions: [],
    llm: "default",
  },
}));

// Template configurations
const TEMPLATE_CONFIGS: { [key: string]: MockPrompt } = templateConfigs.reduce(
  (acc, template) => {
    acc[template.id] = {
      id: template.id,
      title: template.title,
      description: template.description,
      config: {
        workflow: template.id,
        dataSources: [],
        actions: [],
        llm: "default",
      },
    };
    return acc;
  },
  {} as { [key: string]: MockPrompt }
);

export function WorkflowBuilderPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showReview, setShowReview] = useState(false);
  const [reviewConfig, setReviewConfig] = useState<any>(null);

  // Check if we're loading from a template
  useEffect(() => {
    const templateId = searchParams.get("template");
    if (templateId && TEMPLATE_CONFIGS[templateId]) {
      const template = TEMPLATE_CONFIGS[templateId];
      // Redirect directly to workflow review page
      navigate("/workflow/review", {
        state: {
          templateId: template.id,
          templateTitle: template.title,
          jsonFile: templateConfigs.find((t) => t.id === template.id)?.jsonFile,
        },
      });
    }
  }, [searchParams, navigate]);

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
    // This function is no longer needed since we redirect in useEffect
    // But keeping it for consistency if called elsewhere
    const templateConfig = templateConfigs.find((t) => t.id === prompt.id);

    if (templateConfig) {
      navigate("/workflow/review", {
        state: {
          templateId: templateConfig.id,
          templateTitle: templateConfig.title,
          jsonFile: templateConfig.jsonFile,
        },
      });
    }
  };

  const handlePromptSelect = async (prompt: MockPrompt) => {
    // Find the template config to get the jsonFile
    const templateConfig = templateConfigs.find((t) => t.id === prompt.id);

    if (templateConfig) {
      // Redirect directly to workflow review page
      navigate("/workflow/review", {
        state: {
          templateId: templateConfig.id,
          templateTitle: templateConfig.title,
          jsonFile: templateConfig.jsonFile,
        },
      });
    }
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
      (lowerCaseMessage.includes("credit") &&
        lowerCaseMessage.includes("bureau")) ||
      (lowerCaseMessage.includes("credit dispute") &&
        lowerCaseMessage.includes("bureau"))
    ) {
      // Trigger Credit Dispute through Credit Bureau workflow
      const creditBureauPrompt = AI_SUGGESTIONS.find(
        (s) => s.id === "credit-dispute-credit-bureau"
      );
      if (creditBureauPrompt) {
        handlePromptSelect(creditBureauPrompt);
      }
    } else if (
      (lowerCaseMessage.includes("direct") &&
        lowerCaseMessage.includes("member")) ||
      lowerCaseMessage.includes("direct dispute")
    ) {
      // Trigger Direct Dispute from Member workflow
      const directPrompt = AI_SUGGESTIONS.find(
        (s) => s.id === "direct-dispute-member"
      );
      if (directPrompt) {
        handlePromptSelect(directPrompt);
      }
    } else if (
      (lowerCaseMessage.includes("complex") &&
        lowerCaseMessage.includes("equifax")) ||
      lowerCaseMessage.includes("equifax dispute")
    ) {
      // Trigger Complex Dispute via Equifax workflow
      const complexPrompt = AI_SUGGESTIONS.find(
        (s) => s.id === "complex-dispute-equifax"
      );
      if (complexPrompt) {
        handlePromptSelect(complexPrompt);
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
      const introMessage = hasFiles
        ? "Let me analyze your request along with the uploaded files to create a custom workflow..."
        : "Let me analyze your request and create a custom workflow for you...";

      addMessage("agent", introMessage);

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

    addMessage("agent", "Setting up Data Sources:");
    for (const ds of prompt.config.dataSources) {
      addMessage("agent", `• ${ds}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    addMessage("agent", "Configuring automation Actions:");
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
      verificationRequired: "no",
      createdAt: new Date().toISOString(),
    };

    addMessage(
      "system",
      `Your custom workflow "${prompt.title}" is ready!`,
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

      // Find the template config for redirection
      const templateConfig = templateConfigs.find(
        (t) => t.id === agentConfig.workflow
      );

      if (templateConfig) {
        // Redirect to workflow review page
        navigate("/workflow/review", {
          state: {
            templateId: templateConfig.id,
            templateTitle: templateConfig.title,
            jsonFile: templateConfig.jsonFile,
          },
        });
      } else {
        // For custom workflows, redirect to review with custom config
        navigate("/workflow/review", {
          state: {
            templateId: agentConfig.workflow,
            templateTitle: agentConfig.name,
            jsonFile: null,
            customConfig: agentConfig,
          },
        });
      }
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
      <h1 className="text-2xl font-bold text-brand-heading mb-2">
        Workflow Builder
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
                  ? "bg-gray-100 text-brand-text"
                  : "bg-brand-secondaryLight text-brand-text text-sm italic w-full text-center"
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
                <div className="mt-3">
                  <div className="mb-3 p-3 bg-brand-primaryLight rounded-md">
                    <h4 className="text-sm font-semibold text-brand-heading mb-2">
                      Configuration Summary:
                    </h4>
                    <div className="text-xs space-y-1 text-brand-text">
                      <div>
                        <span className="font-medium">Data Sources:</span>{" "}
                        {msg.config.dataSources.length} configured
                      </div>
                      <div>
                        <span className="font-medium">Actions:</span>{" "}
                        {msg.config.actions.length} steps
                      </div>
                      <div>
                        <span className="font-medium">LLM:</span>{" "}
                        {msg.config.llm}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          Verification Required:
                        </span>
                        <select
                          value={msg.config.verificationRequired}
                          onChange={(e) => {
                            // Update the config in the message
                            setMessages((prev) =>
                              prev.map((m) =>
                                m.id === "save-button" && m.config
                                  ? {
                                      ...m,
                                      config: {
                                        ...m.config,
                                        verificationRequired: e.target.value as
                                          | "no"
                                          | "yes",
                                      },
                                    }
                                  : m
                              )
                            );
                          }}
                          className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        >
                          <option value="no">No verification needed</option>
                          <option value="yes">Verification needed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => saveAgent(msg.config as AgentConfig)}
                    className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primaryDark focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 w-full transition-all duration-200 font-semibold"
                  >
                    Save & Run This Workflow
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* AI Suggestions - Show only at the beginning */}
      {!isBuilding && messages.length === 0 && showAISuggestions && (
        <div className="mb-4 p-4 bg-brand-primaryLight rounded-lg">
          <div className="flex items-center mb-3">
            <SparklesIcon className="h-5 w-5 text-brand-primary mr-2" />
            <h3 className="text-sm font-semibold text-brand-heading">
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
                className="p-3 border border-brand-primary/20 rounded-lg text-left bg-white hover:bg-brand-primaryLight focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 transition-all duration-150"
              >
                <h4 className="text-sm font-medium text-brand-heading">
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
        <div className="mb-2 p-3 bg-brand-primaryLight rounded-lg">
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
                  <div className="h-20 w-20 bg-brand-primaryLight rounded border border-brand-border flex items-center justify-center">
                    <span className="text-xs text-brand-muted">Video</span>
                  </div>
                )}
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute -top-2 -right-2 bg-brand-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
            placeholder="Type your workflow request or upload files..."
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
            className="p-3 border border-brand-border rounded-md bg-white hover:bg-brand-primaryLight focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            <PaperClipIcon className="h-5 w-5 text-brand-primary" />
          </button>
          <button
            type="submit"
            disabled={
              isBuilding || (!chatInput.trim() && uploadedFiles.length === 0)
            }
            className="px-4 py-3 bg-brand-primary text-white rounded-md hover:bg-brand-primaryDark focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
