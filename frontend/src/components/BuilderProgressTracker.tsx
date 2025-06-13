import React, { useRef, useEffect, useState } from "react";

interface BuilderProgressTrackerProps {
  steps: { title: string }[];
  currentStep: number;
  onStepClick: (idx: number) => void;
}

export const BuilderProgressTracker: React.FC<BuilderProgressTrackerProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-start mb-6 sticky bottom-0 bg-brand-background z-20 py-2 shadow-card">
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <div className="flex items-center mb-2">
            <button
              type="button"
              aria-label={`Go to ${step.title}`}
              onClick={() => idx <= currentStep && onStepClick(idx)}
              disabled={idx > currentStep}
              className={`flex flex-col items-center focus:outline-none group ${
                idx <= currentStep ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              tabIndex={0}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full font-bold border-2 transition-colors
                  ${
                    idx === currentStep
                      ? "bg-brand-primary border-brand-primary text-brand-dark"
                      : idx < currentStep
                      ? "bg-brand-card border-brand-primary text-brand-primary"
                      : "bg-brand-card border-brand-border text-brand-muted"
                  }
                  group-focus:ring-2 group-focus:ring-brand-primary group-hover:border-brand-primary`}
              >
                {idx + 1}
              </div>
              <span className="mt-2 text-xs text-center w-20 text-brand-muted group-hover:text-brand-primary">
                {step.title}
              </span>
            </button>
            {idx < steps.length - 1 && (
              <div
                className={`h-1 mx-2 rounded transition-colors bg-brand-border w-8`}
              ></div>
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
