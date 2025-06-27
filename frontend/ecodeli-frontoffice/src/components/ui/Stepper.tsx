import React from 'react';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  completedSteps?: number[];
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  completedSteps = []
}) => {
  return (
    <div className="stepper mb-4">
      <div className="d-flex justify-content-between position-relative">
        {/* Ligne de connexion */}
        <div 
          className="position-absolute start-0 bg-secondary"
          style={{
            height: '2px',
            width: '100%',
            top: '20px', // Position au centre du cercle (40px de hauteur / 2 = 20px)
            zIndex: 1
          }}
        />
        
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = completedSteps.includes(index);
          const isClickable = onStepClick && (isCompleted || index <= currentStep);
          
          return (
            <div 
              key={step.id}
              className="d-flex flex-column align-items-center position-relative"
              style={{ zIndex: 2 }}
            >
              {/* Cercle de l'étape */}
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center border ${
                  isActive 
                    ? 'bg-primary text-white border-primary' 
                    : isCompleted 
                      ? 'bg-success text-white border-success'
                      : 'bg-white text-muted border-secondary'
                } ${isClickable ? 'cursor-pointer' : ''}`}
                style={{
                  width: '40px',
                  height: '40px',
                  cursor: isClickable ? 'pointer' : 'default'
                }}
                onClick={() => isClickable && onStepClick?.(index)}
              >
                {isCompleted ? (
                  <i className="bi bi-check"></i>
                ) : (
                  <span className="fw-bold">{index + 1}</span>
                )}
              </div>
              
              {/* Titre de l'étape */}
              <div className="mt-2 text-center" style={{ maxWidth: '120px' }}>
                <div 
                  className={`small fw-bold ${
                    isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted'
                  }`}
                >
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
