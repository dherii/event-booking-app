// src/features/admin/eventos/components/WizardStepper.tsx
'use client';

import { Check } from 'lucide-react';

interface Step {
  label: string;
  description: string;
}

interface WizardStepperProps {
  steps: Step[];
  current: number; // 0-indexed
}

export function WizardStepper({ steps, current }: WizardStepperProps) {
  return (
    <div className="relative flex items-start justify-between">
      {/* Linha de fundo (trilha) */}
      <div
        className="absolute top-4 left-0 right-0 h-px bg-border"
        aria-hidden
        style={{ marginLeft: '1rem', marginRight: '1rem' }}
      />

      {/* Linha de progresso animada */}
      <div
        className="absolute top-4 left-0 h-px bg-primary transition-all duration-500 ease-in-out"
        aria-hidden
        style={{
          marginLeft: '1rem',
          width: `calc(${(current / (steps.length - 1)) * 100}% - 2rem)`,
        }}
      />

      {steps.map((step, index) => {
        const isDone    = index < current;
        const isActive  = index === current;
        const isPending = index > current;

        return (
          <div
            key={step.label}
            className="relative z-10 flex flex-col items-center gap-2 flex-1"
          >
            {/* Nó do step */}
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center
                text-xs font-bold border-2 transition-all duration-300
                ${isDone
                  ? 'bg-primary border-primary text-white'
                  : isActive
                    ? 'bg-card border-primary text-primary shadow-[0_0_0_3px_var(--input-ring)]'
                    : 'bg-card border-border text-muted'
                }
              `}
            >
              {isDone ? <Check size={14} strokeWidth={3} /> : index + 1}
            </div>

            {/* Label e descrição */}
            <div className="text-center hidden sm:block">
              <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-foreground' : isPending ? 'text-muted' : 'text-foreground'}`}>
                {step.label}
              </p>
              <p className="text-[11px] text-muted mt-0.5 leading-tight">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}