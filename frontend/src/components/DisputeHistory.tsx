import React, { useState, useEffect } from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

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

interface DisputeHistoryProps {
  onViewDetails?: (dispute: DisputeRecord) => void;
  onRetry?: (disputeId: string) => void;
  refreshTrigger?: number;
}

export const DisputeHistory: React.FC<DisputeHistoryProps> = ({
  onViewDetails,
  onRetry,
  refreshTrigger = 0,
}) => {
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status">("date");

  // Mock data - replace with actual API calls
  const mockDisputes: DisputeRecord[] = [
    {
      id: "disp_001",
      workflowRunId: "run_123456",
      disputeCode: "106",
      memberEmail: "john.doe@example.com",
      merchant: "Amazon",
      amount: 299.99,
      reason: "Incorrect balance",
      status: "completed",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T11:45:00Z",
      description: "Customer disputes the current balance showing on their credit report.",
    },
    {
      id: "disp_002",
      workflowRunId: "run_123457",
      disputeCode: "015106",
      memberEmail: "jane.smith@example.com",
      merchant: "Walmart",
      amount: 150.00,
      reason: "Credit limit discrepancy",
      status: "in_progress",
      createdAt: "2024-01-14T14:20:00Z",
      updatedAt: "2024-01-14T14:20:00Z",
      description: "Dispute regarding both current balance and credit limit reporting.",
    },
    {
      id: "disp_003",
      workflowRunId: "run_123458",
      disputeCode: "118",
      memberEmail: "bob.johnson@example.com",
      merchant: "Best Buy",
      amount: 89.99,
      reason: "Past due amount incorrect",
      status: "paused",
      createdAt: "2024-01-13T09:15:00Z",
      updatedAt: "2024-01-13T10:30:00Z",
      description: "Customer disputes past due amount and current balance.",
    },
    {
      id: "disp_004",
      workflowRunId: "run_123459",
      disputeCode: "106",
      memberEmail: "alice.brown@example.com",
      merchant: "Target",
      amount: 45.50,
      reason: "Unauthorized charge",
      status: "failed",
      createdAt: "2024-01-12T16:45:00Z",
      updatedAt: "2024-01-12T17:00:00Z",
      description: "Current balance dispute for unauthorized charges.",
    },
    {
      id: "disp_005",
      workflowRunId: "run_123460",
      disputeCode: "015106",
      memberEmail: "charlie.wilson@example.com",
      merchant: "Home Depot",
      amount: 1200.00,
      reason: "Balance and limit incorrect",
      status: "pending",
      createdAt: "2024-01-11T11:00:00Z",
      updatedAt: "2024-01-11T11:00:00Z",
      description: "Dispute for both balance and credit limit reporting errors.",
    },
  ];

  useEffect(() => {
    fetchDisputes();
  }, [refreshTrigger]);

  const fetchDisputes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDisputes(mockDisputes);
    } catch (err) {
      setError("Failed to load dispute history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <PlayIcon className="h-5 w-5 text-blue-500" />;
      case "paused":
        return <PauseIcon className="h-5 w-5 text-yellow-500" />;
      case "failed":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "pending":
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "in_progress":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "paused":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "pending":
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getDisputeTypeLabel = (code: string) => {
    switch (code) {
      case "106":
        return "Current Balance";
      case "015106":
        return "Balance & Credit Limit";
      case "118":
        return "Balance & Past Due";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const filteredAndSortedDisputes = disputes
    .filter((dispute) => {
      if (filter !== "all" && dispute.status !== filter) return false;
      if (searchTerm && !dispute.merchant.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !dispute.memberEmail.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !dispute.reason.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.amount - a.amount;
        case "status":
          return a.status.localeCompare(b.status);
        case "date":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-brand-border p-8">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/6"></div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-brand-border p-8">
        <div className="text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-brand-heading mb-2">
            Error Loading Disputes
          </h3>
          <p className="text-brand-muted mb-4">{error}</p>
          <button
            onClick={fetchDisputes}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primaryDark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-brand-border">
      {/* Header */}
      <div className="p-6 border-b border-brand-borderLight">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-heading mb-1">
              Dispute History
            </h2>
            <p className="text-brand-muted">
              Track the status of your submitted disputes
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={fetchDisputes}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primaryDark transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by merchant, email, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "amount" | "status")}
              className="px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Disputes List */}
      <div className="divide-y divide-brand-borderLight">
        {filteredAndSortedDisputes.length === 0 ? (
          <div className="p-8 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-brand-heading mb-2">
              No Disputes Found
            </h3>
            <p className="text-brand-muted">
              {searchTerm || filter !== "all"
                ? "No disputes match your current filters."
                : "You haven't submitted any disputes yet."}
            </p>
          </div>
        ) : (
          filteredAndSortedDisputes.map((dispute) => (
            <div
              key={dispute.id}
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onViewDetails?.(dispute)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2">
                    {getStatusIcon(dispute.status)}
                    <h3 className="ml-2 text-lg font-semibold text-brand-heading truncate">
                      {dispute.merchant}
                    </h3>
                    <span className={`ml-3 ${getStatusBadge(dispute.status)}`}>
                      {dispute.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-brand-muted">Amount:</span>
                      <span className="ml-1 font-medium text-brand-heading">
                        {formatAmount(dispute.amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-brand-muted">Type:</span>
                      <span className="ml-1 font-medium text-brand-heading">
                        {getDisputeTypeLabel(dispute.disputeCode)}
                      </span>
                    </div>
                    <div>
                      <span className="text-brand-muted">Member:</span>
                      <span className="ml-1 font-medium text-brand-heading truncate">
                        {dispute.memberEmail}
                      </span>
                    </div>
                    <div>
                      <span className="text-brand-muted">Created:</span>
                      <span className="ml-1 font-medium text-brand-heading">
                        {formatDate(dispute.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="mt-2 text-sm text-brand-muted line-clamp-2">
                    <span className="font-medium">Reason:</span> {dispute.reason}
                  </p>
                </div>

                <div className="ml-4 flex flex-col items-end">
                  <div className="text-sm text-brand-muted mb-2">
                    ID: {dispute.workflowRunId}
                  </div>
                  {dispute.status === "failed" && onRetry && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetry(dispute.id);
                      }}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {filteredAndSortedDisputes.length > 0 && (
        <div className="p-4 border-t border-brand-borderLight bg-gray-50 text-center">
          <p className="text-sm text-brand-muted">
            Showing {filteredAndSortedDisputes.length} of {disputes.length} disputes
          </p>
        </div>
      )}
    </div>
  );
};