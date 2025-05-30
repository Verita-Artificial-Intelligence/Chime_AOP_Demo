import React, { useRef, useEffect, useState } from "react";

interface ProgressTrackerProps {
  steps: { title: string }[];
  currentStep: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  steps,
  currentStep,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);

  // Check scroll position to show/hide gradients
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftGradient(scrollLeft > 0);
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  // Auto-scroll to show current step
  useEffect(() => {
    if (scrollContainerRef.current && currentStep > 2) {
      const stepWidth = 120; // Approximate width of each step
      const scrollPosition = (currentStep - 2) * stepWidth;
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [currentStep]);

  // Check scroll on mount and when steps change
  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [steps]);

  // Scroll to the corresponding step card in the simulation timeline
  const handleStepClick = (idx: number) => {
    const el = document.getElementById(`agent-step-card-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm px-4 pb-4 pt-4 mb-6">
      {/* Step count indicator */}
      <div className="text-center mb-4">
        <span className="text-sm font-medium text-gray-600">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>
      
      <div className="relative">
        {/* Left gradient fade */}
        {showLeftGradient && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        )}
        
        {/* Right gradient fade */}
        {showRightGradient && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        )}
        
        <div 
          ref={scrollContainerRef}
          className="flex items-center overflow-x-auto progress-tracker-scroll"
          style={{ 
            minHeight: '60px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#d1d5db #f3f4f6'
          }}
          onScroll={checkScroll}
        >
          <style>{`
            .progress-tracker-scroll::-webkit-scrollbar {
              height: 6px;
            }
            .progress-tracker-scroll::-webkit-scrollbar-track {
              background: #f3f4f6;
              border-radius: 3px;
            }
            .progress-tracker-scroll::-webkit-scrollbar-thumb {
              background: #d1d5db;
              border-radius: 3px;
            }
            .progress-tracker-scroll::-webkit-scrollbar-thumb:hover {
              background: #9ca3af;
            }
          `}</style>
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center flex-shrink-0 py-2">
              <button
                type="button"
                aria-label={`Go to ${step.title}`}
                onClick={() => handleStepClick(idx)}
                disabled={idx > currentStep}
                className={`flex flex-col items-center focus:outline-none group ${
                  idx <= currentStep ? "cursor-pointer" : "cursor-not-allowed"
                }`}
                tabIndex={0}
              >
                <div
                  className={`flex items-center justify-center rounded-full font-bold border-2 transition-all duration-300
                    ${
                      idx < currentStep
                        ? "w-10 h-10 bg-blue-500 border-blue-500 text-white"
                        : idx === currentStep
                        ? "w-12 h-12 bg-brand-primary border-brand-primary text-white shadow-lg animate-pulse"
                        : "w-10 h-10 bg-gray-100 border-gray-300 text-gray-400"
                    }
                    group-focus:ring-2 group-focus:ring-brand-primary group-hover:border-brand-primary`}
                >
                  {idx < currentStep ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={`mt-2 text-xs text-center w-20 transition-colors ${
                  idx <= currentStep ? 'text-gray-700 font-medium' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <div className="flex items-center mx-2">
                  <div
                    className={`h-1 transition-all duration-300 ${
                      idx < currentStep 
                        ? 'bg-blue-500 w-16' 
                        : 'bg-gray-300 w-16'
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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

export default ProgressTracker;
