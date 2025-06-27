import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpTrayIcon, DocumentIcon } from "@heroicons/react/24/outline";
import content from "../config/content";

export const SOPToWorkflowPage: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    
    // Create FormData for file upload
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store the agent journey data in sessionStorage for the active runs page
      const steps = [
        {
          "step": 1,
          "action": "type",
          "element_description": "The 'Actual Payment Amount' input field on the ACDV form.",
          "element_type": "textfield",
          "value": "40"
        },
        {
          "step": 2,
          "action": "type",
          "element_description": "The 'Date of Last Payment' input field on the ACDV form.",
          "element_type": "textfield",
          "value": "2025-01-01"
        },
        {
          "step": 3,
          "action": "check",
          "element_description": "Checkbox for 'Name' under the PII Verification Checklist.",
          "element_type": "checkbox"
        },
        {
          "step": 4,
          "action": "check",
          "element_description": "Checkbox for 'SSN' under the PII Verification Checklist.",
          "element_type": "checkbox"
        },
        {
          "step": 5,
          "action": "check",
          "element_description": "Checkbox for 'Address' under the PII Verification Checklist.",
          "element_type": "checkbox"
        },
        {
          "step": 6,
          "action": "check",
          "element_description": "Checkbox for 'Date of Birth' under the PII Verification Checklist.",
          "element_type": "checkbox"
        },
        {
          "step": 7,
          "action": "check",
          "element_description": "Checkbox for 'Account Number' under the PII Verification Checklist.",
          "element_type": "checkbox"
        },
        {
          "step": 8,
          "action": "click",
          "element_description": "The 'Submit eOSCAR update' button.",
          "element_type": "button"
        }
      ];
      
      sessionStorage.setItem("sopToWorkflowData", JSON.stringify(steps));
      
      // Navigate to the active runs page with a parameter
      navigate("/workflow/active-runs?source=sop-to-workflow");
    } catch (error) {
      console.error("Upload failed:", error);
      // Handle error appropriately
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-dark mb-2">
          Upload SOP
        </h1>
        <p className="text-brand-muted">
          Upload your Standard Operating Procedure documents and screenrecordings to automatically convert them into Workflows
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-brand-border p-8">
        <div
          className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging
              ? "border-brand-primary bg-brand-light"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="sr-only"
            multiple
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.mp4,.avi,.mov"
            onChange={handleFileSelect}
          />
          
          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          
          <label
            htmlFor="file-upload"
            className="cursor-pointer text-brand-primary hover:text-brand-primaryHover font-medium"
          >
            Click to upload
          </label>
          <span className="text-brand-muted"> or drag and drop</span>
          
          <p className="text-xs text-gray-500 mt-2">
            Supports PDF, DOC, DOCX, TXT, Images (PNG, JPG), and Videos (MP4, AVI, MOV)
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-brand-dark mb-3">
              Selected Files ({files.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center min-w-0">
                    <DocumentIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-4 text-sm text-red-600 hover:text-red-800 flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={files.length === 0 || isUploading}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              files.length === 0 || isUploading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-brand-primary text-white hover:bg-brand-primaryHover"
            }`}
          >
            {isUploading ? "Uploading..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}; 