import React, { useRef } from 'react';

interface ProgressTrackerProps {
  steps: { title: string }[];
  currentStep: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ steps, currentStep }) => {
  // Scroll to the corresponding step card in the simulation timeline
  const handleStepClick = (idx: number) => {
    const el = document.getElementById(`agent-step-card-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-start mb-6 sticky bottom-0 bg-brand-background z-20 py-2 shadow-card">
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <div className="flex items-center mb-2">
            <button
              type="button"
              aria-label={`Go to ${step.title}`}
              onClick={() => handleStepClick(idx)}
              disabled={idx > currentStep}
              className={`flex flex-col items-center focus:outline-none group ${idx <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              tabIndex={0}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full font-bold border-2 transition-colors
                  ${idx < currentStep ? 'bg-brand-success border-brand-success text-white' :
                    idx === currentStep ? 'bg-brand-primary border-brand-primary text-white' :
                    'bg-brand-card border-brand-border text-brand-muted'}
                  group-focus:ring-2 group-focus:ring-brand-primary group-hover:border-brand-primary`}
              >
                {idx < currentStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2.5 2.5L16 9"/></svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span className="mt-2 text-xs text-center w-20 text-brand-muted group-hover:text-brand-primary">{step.title}</span>
            </button>
            {idx < steps.length - 1 && (
              <div className={`h-1 mx-2 rounded transition-colors bg-brand-border w-8`}></div>
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

interface BuilderProgressTrackerProps {
  steps: { title: string }[];
  currentStep: number;
  onStepClick: (idx: number) => void;
}

export const BuilderProgressTracker: React.FC<BuilderProgressTrackerProps> = ({ steps, currentStep, onStepClick }) => {
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
              className={`flex flex-col items-center focus:outline-none group ${idx <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              tabIndex={0}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full font-bold border-2 transition-colors
                  ${idx === currentStep ? 'bg-brand-primary border-brand-primary text-white' :
                    idx < currentStep ? 'bg-brand-card border-brand-primary text-brand-primary' :
                    'bg-brand-card border-brand-border text-brand-muted'}
                  group-focus:ring-2 group-focus:ring-brand-primary group-hover:border-brand-primary`}
              >
                {idx + 1}
              </div>
              <span className="mt-2 text-xs text-center w-20 text-brand-muted group-hover:text-brand-primary">{step.title}</span>
            </button>
            {idx < steps.length - 1 && (
              <div className={`h-1 mx-2 rounded transition-colors bg-brand-border w-8`}></div>
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressTracker; 