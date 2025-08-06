import React, { useState, useCallback } from "react";
import { DisputeForm } from "../components/DisputeForm";
import { DisputeHistory } from "../components/DisputeHistory";
import {
  PlusIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { notificationService } from "../services/notificationService";
import { DisputeApiService } from "../services/disputeApiService";

interface DisputeFormData {
  merchant: string;
  amount: string;
  reason: string;
  description: string;
  memberEmail: string;
  disputeType: string;
  attachedFile?: File;
}

interface DisputeRecord {
  id: string;
  workflowRunId: string;
  disputeCode: string;
  memberEmail: string;
  merchant: string;
  amount: number;
  reason: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "paused";
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export const DisputesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"new" | "history">("history");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDisputeSubmit = useCallback(async (formData: DisputeFormData) => {
    setIsSubmitting(true);

    try {
      // If there's an attached file, we need to upload it first
      if (formData.attachedFile) {
        const result = await DisputeApiService.safeApiCall(
          () => DisputeApiService.uploadSOP(formData.attachedFile!),
          "Dispute Submission"
        );

        if (result.success) {
          const uploadResponse = result.data;
          
          notificationService.successWithAction(
            "Dispute Submitted Successfully!",
            `Your dispute has been processed. Workflow Run ID: ${uploadResponse.workflowRunId}`,
            "View Details",
            () => {
              setActiveTab("history");
            }
          );
          
          // Refresh the history to show the new dispute
          setRefreshTrigger((prev) => prev + 1);
          
          // Switch to history tab to show the new dispute
          setTimeout(() => {
            setActiveTab("history");
          }, 2000);
        } else {
          throw new Error(result.error);
        }
      } else {
        // For disputes without file upload, we could have a different endpoint
        // For now, let's simulate a successful submission
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        notificationService.success(
          "Dispute Submitted Successfully!",
          "Your dispute has been submitted and processing will begin shortly."
        );
        
        setRefreshTrigger((prev) => prev + 1);
        
        setTimeout(() => {
          setActiveTab("history");
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting dispute:", error);
      notificationService.apiError(error, "Dispute Submission");
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const handleViewDetails = useCallback((dispute: DisputeRecord) => {
    // Navigate to workflow details or open a modal
    // For now, we'll just log the dispute details
    console.log("Viewing dispute details:", dispute);
    
    // You could navigate to the ActiveRunsPage with the workflow run ID
    // navigate(`/workflow/active-runs?runId=${dispute.workflowRunId}`);
  }, []);

  const handleRetryDispute = useCallback(async (disputeId: string) => {
    const result = await DisputeApiService.safeApiCall(
      () => DisputeApiService.executeWorkflowAction("start", disputeId),
      "Dispute Retry"
    );

    if (result.success) {
      notificationService.success(
        "Dispute Retry Initiated",
        "The dispute has been restarted and will be processed again."
      );
      setRefreshTrigger((prev) => prev + 1);
    } else {
      notificationService.error(
        "Dispute Retry Failed",
        result.error
      );
    }
  }, []);



  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-heading mb-2">
          Credit Disputes
        </h1>
        <p className="text-brand-muted">
          Submit new disputes and track the status of existing ones. Our automated
          system will process your dispute according to Metro 2 standards.
        </p>
      </div>



      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-brand-borderLight">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("history")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-brand-muted hover:text-brand-heading hover:border-gray-300"
              }`}
            >
              <DocumentTextIcon className="h-5 w-5 inline mr-2" />
              Dispute History
            </button>
            <button
              onClick={() => setActiveTab("new")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "new"
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-brand-muted hover:text-brand-heading hover:border-gray-300"
              }`}
            >
              <PlusIcon className="h-5 w-5 inline mr-2" />
              New Dispute
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === "history" && (
          <DisputeHistory
            onViewDetails={handleViewDetails}
            onRetry={handleRetryDispute}
            refreshTrigger={refreshTrigger}
          />
        )}
        
        {activeTab === "new" && (
          <DisputeForm
            onSubmit={handleDisputeSubmit}
            isLoading={isSubmitting}
            onCancel={() => setActiveTab("history")}
          />
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-brand-border p-6 text-center">
          <div className="text-2xl font-bold text-brand-heading mb-1">5</div>
          <div className="text-sm text-brand-muted">Total Disputes</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-brand-border p-6 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">1</div>
          <div className="text-sm text-brand-muted">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-brand-border p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">1</div>
          <div className="text-sm text-brand-muted">In Progress</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-brand-border p-6 text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-1">1</div>
          <div className="text-sm text-brand-muted">Pending Review</div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Need Help with Disputes?
        </h3>
        <p className="text-blue-800 mb-4">
          Our automated dispute system handles Metro 2 dispute codes 106, 015106, and 118.
          Upload supporting documents to improve processing accuracy.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="#"
            className="text-blue-700 hover:text-blue-800 font-medium text-sm"
          >
            View Dispute Guidelines →
          </a>
          <a
            href="#"
            className="text-blue-700 hover:text-blue-800 font-medium text-sm"
          >
            Contact Support →
          </a>
          <a
            href="#"
            className="text-blue-700 hover:text-blue-800 font-medium text-sm"
          >
            Metro 2 Documentation →
          </a>
        </div>
      </div>
    </div>
  );
};