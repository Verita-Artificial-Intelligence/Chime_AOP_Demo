import React, { useState } from "react";
import {
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface DisputeFormData {
  merchant: string;
  amount: string;
  reason: string;
  description: string;
  memberEmail: string;
  disputeType: string;
  attachedFile?: File;
}

interface DisputeFormProps {
  onSubmit?: (data: DisputeFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const DisputeForm: React.FC<DisputeFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form, setForm] = useState<DisputeFormData>({
    merchant: "",
    amount: "",
    reason: "",
    description: "",
    memberEmail: "",
    disputeType: "106", // Default to current balance dispute
  });

  const [errors, setErrors] = useState<Partial<DisputeFormData>>({});
  const [dragActive, setDragActive] = useState(false);
  const [success, setSuccess] = useState(false);

  const disputeTypes = [
    { value: "106", label: "Current Balance Dispute (Code 106)" },
    { value: "015106", label: "Current Balance & Credit Limit Dispute (Code 015106)" },
    { value: "118", label: "Current Balance & Past Due Dispute (Code 118)" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name as keyof DisputeFormData]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, attachedFile: file });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setForm({ ...form, attachedFile: e.dataTransfer.files[0] });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DisputeFormData> = {};

    if (!form.merchant.trim()) {
      newErrors.merchant = "Merchant name is required";
    }

    if (!form.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!form.reason.trim()) {
      newErrors.reason = "Reason is required";
    }

    if (!form.memberEmail.trim()) {
      newErrors.memberEmail = "Member email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.memberEmail)) {
      newErrors.memberEmail = "Please enter a valid email address";
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit?.(form);
      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setForm({
          merchant: "",
          amount: "",
          reason: "",
          description: "",
          memberEmail: "",
          disputeType: "106",
        });
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting dispute:", error);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-brand-border p-8">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-brand-heading mb-2">
            Dispute Submitted Successfully!
          </h3>
          <p className="text-brand-muted">
            Your dispute has been submitted and is being processed. You'll receive an email confirmation shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-brand-border p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-brand-heading mb-2">
          Submit New Dispute
        </h2>
        <p className="text-brand-muted">
          Fill out the form below to submit a new credit dispute. All fields marked with * are required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dispute Type */}
        <div>
          <label className="block text-sm font-medium text-brand-heading mb-2">
            Dispute Type *
          </label>
          <select
            name="disputeType"
            value={form.disputeType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
          >
            {disputeTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Member Email */}
        <div>
          <label className="block text-sm font-medium text-brand-heading mb-2">
            Member Email *
          </label>
          <input
            type="email"
            name="memberEmail"
            value={form.memberEmail}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary ${
              errors.memberEmail ? "border-red-500" : "border-brand-border"
            }`}
            placeholder="member@example.com"
          />
          {errors.memberEmail && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {errors.memberEmail}
            </p>
          )}
        </div>

        {/* Merchant Name */}
        <div>
          <label className="block text-sm font-medium text-brand-heading mb-2">
            Merchant/Company Name *
          </label>
          <input
            type="text"
            name="merchant"
            value={form.merchant}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary ${
              errors.merchant ? "border-red-500" : "border-brand-border"
            }`}
            placeholder="e.g., Amazon, Walmart, etc."
          />
          {errors.merchant && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {errors.merchant}
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-brand-heading mb-2">
            Disputed Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-brand-muted">$</span>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              step="0.01"
              className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary ${
                errors.amount ? "border-red-500" : "border-brand-border"
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {errors.amount}
            </p>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-brand-heading mb-2">
            Reason for Dispute *
          </label>
          <input
            type="text"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary ${
              errors.reason ? "border-red-500" : "border-brand-border"
            }`}
            placeholder="e.g., Incorrect balance, unauthorized charge, etc."
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {errors.reason}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-brand-heading mb-2">
            Detailed Description *
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary resize-none ${
              errors.description ? "border-red-500" : "border-brand-border"
            }`}
            placeholder="Provide detailed information about the dispute, including any relevant dates, transaction details, or supporting evidence..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {errors.description}
            </p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-brand-heading mb-2">
            Supporting Documents
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? "border-brand-primary bg-brand-primaryLight"
                : "border-gray-300 hover:border-brand-primary"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="sr-only"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileChange}
            />
            <DocumentArrowUpIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-brand-primary hover:text-brand-primaryDark font-medium"
            >
              Click to upload
            </label>
            <span className="text-brand-muted"> or drag and drop</span>
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOC, DOCX, JPG, PNG up to 10MB
            </p>
            {form.attachedFile && (
              <p className="mt-2 text-sm text-brand-heading">
                Selected: {form.attachedFile.name}
              </p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-brand-borderLight">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-brand-border text-brand-heading rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-brand-primary text-white hover:bg-brand-primaryDark"
            }`}
          >
            {isLoading ? "Submitting..." : "Submit Dispute"}
          </button>
        </div>
      </form>
    </div>
  );
};