import React, { useState, useEffect } from "react";
import ProgressTracker from "./ProgressTracker";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  BriefcaseIcon,
  ServerStackIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

interface AIAgentExecutionSimulationProps {
  workflow: string;
  dataSources: string[];
  actions: string[];
  llm: string;
  onRestart: () => void;
}

// Helper: Render a table for a list of objects
function SimpleTable({ data }: { data: any[] }) {
  if (!data || !Array.isArray(data) || data.length === 0)
    return <div className="text-brand-muted">No data available.</div>;
  const columns = Object.keys(data[0]);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs bg-brand-card border border-brand-border rounded-card">
        <thead>
          <tr className="bg-brand-background">
            {columns.map((col) => (
              <th
                key={col}
                className="border border-brand-border p-2 text-left capitalize text-brand-heading bg-brand-background"
              >
                {col.replace(/([A-Z])/g, " $1")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="bg-white hover:bg-gray-100">
              {columns.map((col) => (
                <td
                  key={col}
                  className="border border-brand-border p-2 text-brand-heading"
                >
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AIAgentExecutionSimulation({
  workflow,
  dataSources,
  actions,
  llm,
  onRestart,
}: AIAgentExecutionSimulationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [executionComplete, setExecutionComplete] = useState(false);
  const [mockData, setMockData] = useState<any>(null);
  const [runStartTime] = useState(new Date().toISOString());

  // Build the step sequence: init, data sources, actions, complete
  const stepSequence = [
    { type: "init", label: `Initializing workflow for ${workflow}` },
    ...dataSources.map((ds) => ({
      type: "datasource",
      label: `Analyzing data source: ${ds}`,
      ds,
    })),
    ...actions.map((action) => ({
      type: "action",
      label: `Executing action: ${action}`,
      action,
    })),
    { type: "complete", label: "All steps completed!" },
  ];

  useEffect(() => {
    import("../data/mockData.json").then((data) => setMockData(data));
  }, []);

  useEffect(() => {
    if (!mockData) return;
    if (currentStep < stepSequence.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1400);
      return () => clearTimeout(timer);
    } else if (currentStep === stepSequence.length - 1 && !executionComplete) {
      setExecutionComplete(true);
      // Save the completed run to localStorage
      saveCompletedRun();
    }
  }, [currentStep, stepSequence.length, mockData, executionComplete]);

  const saveCompletedRun = () => {
    const workflowDetails = mockData?.workflows?.find(
      (wf: any) => wf.id === workflow
    );
    const isCustomWorkflow = workflow === "custom-workflow";

    const completedRun = {
      id: `run-${workflow}-${Date.now()}`,
      name:
        workflowDetails?.name ||
        (isCustomWorkflow ? "Custom Workflow" : workflow),
      description:
        workflowDetails?.description ||
        (isCustomWorkflow
          ? "A dynamically generated workflow based on user requirements"
          : `Automated workflow execution for ${workflow}`),
      category:
        workflowDetails?.category || (isCustomWorkflow ? "Custom" : "General"),
      status: "Completed",
      lastRun: new Date().toISOString(),
      runHistory: [
        {
          timestamp: runStartTime,
          status: "Started",
          details: "AOP workflow execution started",
        },
        ...dataSources.map((ds, index) => ({
          timestamp: new Date(
            new Date(runStartTime).getTime() + (index + 1) * 2000
          ).toISOString(),
          status: "Success",
          details: `Analyzed data source: ${ds}`,
        })),
        ...actions.map((action, index) => ({
          timestamp: new Date(
            new Date(runStartTime).getTime() +
              (dataSources.length + index + 1) * 2000
          ).toISOString(),
          status: "Success",
          details: `Executed action: ${action}`,
        })),
        {
          timestamp: new Date().toISOString(),
          status: "Success",
          details: "AOP workflow completed successfully",
        },
      ],
      metrics: {
        dataSourcesAnalyzed: String(dataSources.length),
        actionsExecuted: String(actions.length),
        totalSteps: String(stepSequence.length - 1),
        executionTime: `${Math.round(
          (new Date().getTime() - new Date(runStartTime).getTime()) / 1000
        )}s`,
      },
    };

    // Get existing run history from localStorage
    const existingHistory = localStorage.getItem("aopRunHistory");
    let runHistory: any[] = [];

    if (existingHistory) {
      try {
        runHistory = JSON.parse(existingHistory);
      } catch (e) {
        console.error("Error parsing existing run history:", e);
        runHistory = [];
      }
    }

    // Add the new completed run
    runHistory.push(completedRun);

    // Save back to localStorage
    localStorage.setItem("aopRunHistory", JSON.stringify(runHistory));
  };

  // Auto-scroll to the current step card
  useEffect(() => {
    if (currentStep > 0) {
      // Small delay to ensure the element is rendered
      setTimeout(() => {
        const stepElement = document.getElementById(
          `agent-step-card-${currentStep - 1}`
        );
        if (stepElement) {
          stepElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      }, 100);
    }
  }, [currentStep]);

  // Helper to get a human-readable summary/table for each data source
  const getDataSourceSummary = (ds: string) => {
    if (!mockData) return null;

    // For custom workflows, generate appropriate mock data
    if (workflow === "custom-workflow") {
      return getCustomDataSourceSummary(ds);
    }

    // Attempt to fetch from the new dataSourceSamples section first
    if (mockData.dataSourceSamples && mockData.dataSourceSamples[ds]) {
      const sampleData = mockData.dataSourceSamples[ds];
      return (
        <SimpleTable
          data={
            Array.isArray(sampleData) ? sampleData.slice(0, 3) : [sampleData]
          }
        />
      );
    }

    // Fallback to existing specific logic if needed (or can be removed if dataSourceSamples is comprehensive)
    if (ds.toLowerCase().includes("orbit")) {
      // Show first 3 receivables as example
      return (
        <SimpleTable data={mockData.receivablesTableData?.slice(0, 3) || []} />
      );
    }
    if (ds.toLowerCase().includes("oracle")) {
      // Show first 3 payables as example
      return (
        <SimpleTable data={mockData.payablesTableData?.slice(0, 3) || []} />
      );
    }
    if (ds.toLowerCase().includes("powerbi")) {
      // Show first 3 payroll runs as example
      return <SimpleTable data={mockData.payrollRuns?.slice(0, 3) || []} />;
    }
    if (ds.toLowerCase().includes("manual")) {
      // Show first 3 entitlements as example
      return (
        <SimpleTable data={mockData.entitlementsTableData?.slice(0, 3) || []} />
      );
    }
    if (ds.toLowerCase().includes("web api")) {
      // Show first webApiData response as example
      const api = mockData.webApiData?.[0];
      return api && api.response ? (
        <SimpleTable data={api.response.slice(0, 3)} />
      ) : (
        <div className="text-brand-muted">No data available for Web API.</div>
      );
    }
    if (ds.toLowerCase().includes("powerapps")) {
      // Show first powerAppsData results as example
      const app = mockData.powerAppsData?.[0];
      return app && app.results ? (
        <SimpleTable data={app.results.slice(0, 3)} />
      ) : (
        <div className="text-brand-muted">
          No data available for Power Apps.
        </div>
      );
    }
    if (ds.toLowerCase().includes("excel")) {
      // Show first excelData rows as example
      const excel = mockData.excelData?.[0];
      return excel && excel.rows ? (
        <SimpleTable data={excel.rows.slice(0, 3)} />
      ) : (
        <div className="text-brand-muted">No data available for Excel.</div>
      );
    }
    return (
      <div className="text-brand-muted">
        No specific sample data configured for this source.
      </div>
    );
  };

  // Helper for custom workflow data sources
  const getCustomDataSourceSummary = (ds: string) => {
    const dsLower = ds.toLowerCase();

    // Generate contextual mock data based on data source name
    if (dsLower.includes("invoice") || dsLower.includes("billing")) {
      return (
        <SimpleTable
          data={[
            {
              invoiceId: "INV-2024-001",
              vendor: "Acme Corp",
              amount: 5000,
              status: "Pending",
            },
            {
              invoiceId: "INV-2024-002",
              vendor: "Tech Solutions",
              amount: 3500,
              status: "Approved",
            },
            {
              invoiceId: "INV-2024-003",
              vendor: "Global Services",
              amount: 7200,
              status: "Processing",
            },
          ]}
        />
      );
    } else if (dsLower.includes("employee") || dsLower.includes("hr")) {
      return (
        <SimpleTable
          data={[
            {
              employeeId: "EMP-001",
              name: "John Doe",
              department: "Engineering",
              status: "Active",
            },
            {
              employeeId: "EMP-002",
              name: "Jane Smith",
              department: "Marketing",
              status: "Onboarding",
            },
            {
              employeeId: "EMP-003",
              name: "Bob Johnson",
              department: "Sales",
              status: "Active",
            },
          ]}
        />
      );
    } else if (dsLower.includes("customer") || dsLower.includes("client")) {
      return (
        <SimpleTable
          data={[
            {
              customerId: "CUST-001",
              name: "Alpha Industries",
              tier: "Premium",
              lastContact: "2024-07-15",
            },
            {
              customerId: "CUST-002",
              name: "Beta Corp",
              tier: "Standard",
              lastContact: "2024-07-18",
            },
            {
              customerId: "CUST-003",
              name: "Gamma LLC",
              tier: "Premium",
              lastContact: "2024-07-19",
            },
          ]}
        />
      );
    } else if (dsLower.includes("api") || dsLower.includes("gateway")) {
      return (
        <SimpleTable
          data={[
            {
              endpoint: "/api/v1/process",
              method: "POST",
              status: 200,
              responseTime: "125ms",
            },
            {
              endpoint: "/api/v1/validate",
              method: "GET",
              status: 200,
              responseTime: "45ms",
            },
            {
              endpoint: "/api/v1/submit",
              method: "PUT",
              status: 201,
              responseTime: "230ms",
            },
          ]}
        />
      );
    } else {
      // Generic data for unrecognized data sources
      return (
        <SimpleTable
          data={[
            {
              id: "REC-001",
              type: "Data Entry",
              status: "Processed",
              timestamp: new Date().toISOString(),
            },
            {
              id: "REC-002",
              type: "Data Entry",
              status: "Pending",
              timestamp: new Date().toISOString(),
            },
            {
              id: "REC-003",
              type: "Data Entry",
              status: "Processed",
              timestamp: new Date().toISOString(),
            },
          ]}
        />
      );
    }
  };

  // Helper to get a human-readable summary/result for each action
  const getActionSummary = (action: string) => {
    if (!mockData) return null;

    // For custom workflows, generate appropriate action results
    if (workflow === "custom-workflow") {
      return getCustomActionSummary(action);
    }

    if (action.toLowerCase().includes("invoice")) {
      return (
        <SimpleTable data={mockData.receivablesTableData?.slice(0, 3) || []} />
      );
    }
    if (action.toLowerCase().includes("reminder")) {
      return (
        <SimpleTable data={mockData.payablesTableData?.slice(0, 3) || []} />
      );
    }
    if (action.toLowerCase().includes("report")) {
      // Show a stat summary for receivables/payables
      const isReceivable = workflow.toLowerCase().includes("receivable");
      const table = isReceivable
        ? mockData.receivablesTableData
        : mockData.payablesTableData;
      const total = table?.reduce(
        (sum: number, row: any) => sum + row.amount,
        0
      );
      const overdue = table?.filter(
        (row: any) => row.status === "Overdue"
      ).length;
      const dueSoon = table?.filter(
        (row: any) => row.status === "Due Soon"
      ).length;
      return (
        <div className="flex gap-6 flex-wrap">
          <div className="bg-brand-card border border-brand-border rounded-lg p-4 flex-1 min-w-[120px]">
            <div className="text-xs text-brand-muted mb-1">
              Total Outstanding
            </div>
            <div className="text-xl font-bold text-brand-primary">
              ${total?.toLocaleString()}
            </div>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-lg p-4 flex-1 min-w-[120px]">
            <div className="text-xs text-brand-muted mb-1">Overdue</div>
            <div className="text-xl font-bold text-brand-primary">
              {overdue}
            </div>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-lg p-4 flex-1 min-w-[120px]">
            <div className="text-xs text-brand-muted mb-1">Due Soon</div>
            <div className="text-xl font-bold text-brand-primary">
              {dueSoon}
            </div>
          </div>
        </div>
      );
    }
    if (action.toLowerCase().includes("payroll")) {
      // Show latest payroll run
      const run = mockData.payrollRuns?.[0];
      if (!run) return null;
      return (
        <div className="flex gap-6 flex-wrap">
          <div className="bg-brand-card border border-brand-border rounded-lg p-4 flex-1 min-w-[120px]">
            <div className="text-xs text-brand-muted mb-1">Payroll ID</div>
            <div className="text-xl font-bold text-brand-primary">{run.id}</div>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-lg p-4 flex-1 min-w-[120px]">
            <div className="text-xs text-brand-muted mb-1">Employees</div>
            <div className="text-xl font-bold text-brand-primary">
              {run.employees}
            </div>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-lg p-4 flex-1 min-w-[120px]">
            <div className="text-xs text-brand-muted mb-1">Amount</div>
            <div className="text-xl font-bold text-brand-primary">
              ${run.amount?.toLocaleString()}
            </div>
          </div>
        </div>
      );
    }
    if (action.toLowerCase().includes("leave")) {
      return (
        <SimpleTable data={mockData.entitlementsTableData?.slice(0, 3) || []} />
      );
    }
    // NEW: Try to find a matching action result in mockData.actionResults
    const actionResult = mockData.actionResults?.find(
      (ar: any) => ar.action === action
    );
    if (
      actionResult &&
      actionResult.results &&
      actionResult.results.length > 0
    ) {
      return <SimpleTable data={actionResult.results} />;
    }
    return (
      <div className="text-brand-muted">
        No summary available for this action.
      </div>
    );
  };

  // Helper for custom workflow actions
  const getCustomActionSummary = (action: string) => {
    const actionLower = action.toLowerCase();

    // Generate contextual results based on action name
    if (actionLower.includes("validate") || actionLower.includes("verify")) {
      return (
        <div className="text-sm text-brand-muted">
          <div className="mb-2 font-semibold text-brand-success">
            ✓ Validation Successful
          </div>
          <div>• All required fields present</div>
          <div>• Data format verified</div>
          <div>• Business rules passed</div>
        </div>
      );
    } else if (actionLower.includes("send") || actionLower.includes("notify")) {
      return (
        <div className="text-sm text-brand-muted">
          <div className="mb-2 font-semibold text-brand-success">
            ✓ Notifications Sent
          </div>
          <div>• Email notifications: 3 recipients</div>
          <div>• SMS alerts: 1 recipient</div>
          <div>• System logs updated</div>
        </div>
      );
    } else if (
      actionLower.includes("generate") ||
      actionLower.includes("create")
    ) {
      return (
        <div className="text-sm text-brand-muted">
          <div className="mb-2 font-semibold text-brand-success">
            ✓ Generation Complete
          </div>
          <div>• Document ID: DOC-{Date.now()}</div>
          <div>• Format: PDF</div>
          <div>• Size: 2.3 MB</div>
          <div>• Status: Ready for download</div>
        </div>
      );
    } else if (actionLower.includes("update") || actionLower.includes("save")) {
      return (
        <div className="text-sm text-brand-muted">
          <div className="mb-2 font-semibold text-brand-success">
            ✓ Update Successful
          </div>
          <div>• Records updated: 15</div>
          <div>• Database: Primary</div>
          <div>• Timestamp: {new Date().toLocaleTimeString()}</div>
        </div>
      );
    } else {
      // Generic success message for other actions
      return (
        <div className="text-sm text-brand-muted">
          <div className="mb-2 font-semibold text-brand-success">
            ✓ Action Completed
          </div>
          <div>• Execution time: {Math.floor(Math.random() * 500) + 100}ms</div>
          <div>• Status: Success</div>
          <div>• Next step: Ready</div>
        </div>
      );
    }
  };

  // Stepper steps for all steps
  const stepperSteps = stepSequence.map((step, i) => ({
    title: `Step ${i + 1}`,
  }));

  // Render all completed steps (timeline)
  const renderedSteps = stepSequence
    .slice(0, currentStep + 1)
    .map((step, idx) => {
      // Do not render the 'complete' step card
      if (step.type === "complete") return null;
      return (
        <div
          key={idx}
          id={`agent-step-card-${idx}`}
          className="bg-brand-card border border-brand-border rounded-card shadow-card p-card animate-fadeIn mb-8"
        >
          <h3 className="text-lg font-semibold text-brand-heading mb-2">
            {step.label}
          </h3>
          {step.type === "datasource" && (
            <div className="mt-4">
              <div className="text-xs text-brand-muted mb-2">
                Sample data being analyzed:
              </div>
              {getDataSourceSummary((step as any).ds)}
            </div>
          )}
          {step.type === "action" && (
            <div className="mt-4">
              <div className="text-xs text-brand-muted mb-2">Result:</div>
              {getActionSummary((step as any).action)}
            </div>
          )}
          {step.type === "init" && (
            <div className="mt-4 text-brand-muted text-sm">
              Preparing environment and loading configuration...
            </div>
          )}
        </div>
      );
    });

  // PDF download handler
  const handleDownloadPDF = async () => {
    const element = document.getElementById("agent-simulation-content");
    if (!element) return;

    // Show loading state (optional)
    const downloadButton = document.querySelector(
      'button[onClick*="handleDownloadPDF"]'
    ) as HTMLButtonElement;
    if (downloadButton) {
      downloadButton.textContent = "Generating...";
      downloadButton.setAttribute("disabled", "true");
    }

    try {
      // Clone the element to avoid modifying the actual DOM
      const clonedElement = element.cloneNode(true) as HTMLElement;

      // Apply inline styles to ensure colors are captured correctly
      // Brand colors from Tailwind config
      const brandColors = {
        "text-brand-primary": "#117ACA",
        "text-brand-heading": "#1F4E79",
        "text-brand-muted": "#333333",
        "text-brand-success": "#4A90A4",
        "bg-brand-card": "#FFFFFF",
        "bg-brand-background": "#FFFFFF",
        "border-brand-border": "#E5E7EB",
      };

      // Apply inline styles to all elements with brand color classes
      Object.entries(brandColors).forEach(([className, color]) => {
        const elements = clonedElement.querySelectorAll(`.${className}`);
        elements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (className.startsWith("text-")) {
            htmlEl.style.color = color;
          } else if (className.startsWith("bg-")) {
            htmlEl.style.backgroundColor = color;
          } else if (className.startsWith("border-")) {
            htmlEl.style.borderColor = color;
          }
        });
      });

      // Also handle text color for specific elements
      const headings = clonedElement.querySelectorAll("h1, h2, h3, h4, h5, h6");
      headings.forEach((heading) => {
        (heading as HTMLElement).style.color = "#1F4E79"; // Navy blue for headings
      });

      const mutedTexts = clonedElement.querySelectorAll(".text-xs, .text-sm");
      mutedTexts.forEach((text) => {
        if (!(text as HTMLElement).style.color) {
          (text as HTMLElement).style.color = "#333333"; // Dark gray for small text
        }
      });

      // Create a temporary container in the document
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "-9999px";
      tempContainer.appendChild(clonedElement);
      document.body.appendChild(tempContainer);

      // Better html2canvas options for quality
      const canvas = await html2canvas(clonedElement, {
        scale: 2, // Reduced from 3 to make text smaller
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        imageTimeout: 0,
        allowTaint: true,
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL("image/png", 1.0); // Max quality

      // Initialize PDF with better settings
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: false, // Disable compression for better quality
      });

      // A4 dimensions in mm
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15; // 15mm margins
      const contentWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - 2 * margin;

      // Calculate dimensions maintaining aspect ratio
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = imgProps.width;
      const imgHeight = imgProps.height;
      const ratio = imgWidth / imgHeight;

      // Calculate how many pages we need
      const pdfWidth = contentWidth;
      const pdfHeight = pdfWidth / ratio;
      const totalPages = Math.ceil(pdfHeight / contentHeight);

      // Add metadata
      pdf.setProperties({
        title: `Workflow Report - ${workflow}`,
        subject: "AI Agent Execution Report",
        author: "Verita AI",
        keywords: "workflow, report, ai, agent",
        creator: "Verita AI Platform",
      });

      // Add content to PDF
      if (totalPages === 1) {
        // Single page - center the content
        const yOffset = (contentHeight - pdfHeight) / 2;
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          margin + Math.max(0, yOffset),
          pdfWidth,
          pdfHeight
        );
      } else {
        // Multiple pages - split the image
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) {
            pdf.addPage();
          }

          // Calculate the portion of the image to show on this page
          const sourceY = (page * contentHeight * imgWidth) / pdfWidth;
          const sourceHeight = (contentHeight * imgWidth) / pdfWidth;

          // Create a temporary canvas for this page's content
          const pageCanvas = document.createElement("canvas");
          const pageCtx = pageCanvas.getContext("2d");
          if (!pageCtx) continue; // Skip if context is not available
          pageCanvas.width = imgWidth;
          pageCanvas.height = Math.min(sourceHeight, imgHeight - sourceY);

          // Draw the portion of the original canvas
          pageCtx.drawImage(
            canvas,
            0,
            sourceY, // Source x, y
            imgWidth,
            pageCanvas.height, // Source width, height
            0,
            0, // Destination x, y
            imgWidth,
            pageCanvas.height // Destination width, height
          );

          const pageImgData = pageCanvas.toDataURL("image/png", 1.0);
          const pageImgHeight = (pageCanvas.height * pdfWidth) / imgWidth;

          pdf.addImage(
            pageImgData,
            "PNG",
            margin,
            margin,
            pdfWidth,
            Math.min(pageImgHeight, contentHeight)
          );

          // Add page number
          pdf.setFontSize(10);
          pdf.setTextColor(17, 122, 202); // JP Morgan blue
          pdf.text(
            `Page ${page + 1} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
          );
        }
      }

      // Generate filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const filename = `workflow-report-${workflow}-${timestamp}.pdf`;

      // Save the PDF
      pdf.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      // Reset button state
      if (downloadButton) {
        downloadButton.textContent = "Download Report";
        downloadButton.removeAttribute("disabled");
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Horizontal progress bar at the top */}
      <div className="mb-8">
        <ProgressTracker steps={stepperSteps} currentStep={currentStep} />
      </div>
      <div id="agent-simulation-content">
        {/* Modern summary card with pills/badges */}
        <div className="bg-brand-card border border-brand-border rounded-card shadow-card p-6 flex flex-col gap-4 items-center mb-8 text-white">
          <div className="flex flex-wrap gap-3 justify-center">
            <span className="inline-flex items-center justify-start px-3 py-1 rounded-full text-brand-primary font-semibold text-sm">
              <BriefcaseIcon className="w-4 h-4 mr-1" /> {workflow}
            </span>
            {dataSources.map((ds, i) => (
              <span
                key={ds + i}
                className="inline-flex items-center justify-start px-3 py-1 rounded-full text-brand-primary font-semibold text-sm"
              >
                <ServerStackIcon className="w-4 h-4 mr-1" /> {ds}
              </span>
            ))}
            <span className="inline-flex items-center justify-start px-3 py-1 rounded-full text-brand-primary font-semibold text-sm">
              <SparklesIcon className="w-4 h-4 mr-1" /> {llm}
            </span>
          </div>
        </div>
        {/* Timeline of steps */}
        {renderedSteps}
        {/* Loader and Completion */}
        {!executionComplete && (
          <div className="text-center mt-10">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-brand-primary h-12 w-12 mb-4 mx-auto"></div>
            <p className="text-lg text-brand-muted">
              {stepSequence[currentStep].label}...
            </p>
          </div>
        )}
        {executionComplete && (
          <div className="flex flex-col items-center justify-center mt-20 mb-12">
            <div className="bg-brand-card border border-brand-border rounded-card shadow-card px-8 py-6 flex flex-col items-center w-full max-w-md">
              <span className="inline-flex items-center text-brand-success text-base font-semibold gap-2 mb-4">
                <svg
                  className="w-5 h-5 text-brand-success"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12l2.5 2.5L16 9"
                  />
                </svg>
                Agent workflow completed successfully!
              </span>
              <p className="text-sm text-gray-600 mb-4 text-center">
                The fraud investigation workflow has been executed and all
                suspicious activities have been analyzed.
              </p>
              <div className="flex justify-center gap-4 mt-2 w-full">
                <button className="btn-primary w-1/2" onClick={onRestart}>
                  New Agent
                </button>
                <button
                  className="btn-primary w-1/2"
                  onClick={handleDownloadPDF}
                >
                  Download Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Loader and fadeIn animation (add to your global CSS if not present)
/*
.loader {
  border-top-color: #635BFF;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
*/
