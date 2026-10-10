import clsx from 'clsx';
import type { ComponentProps } from 'react';

type StepperProps = ComponentProps<'div'> & {
  /** Short names of the steps. */
  steps: string[];
  /** Number of the current step, starting at 1. */
  current: number;
  /** The progress in words, in the application's language: "Step 2 of 3". */
  progressLabel: string;
};

export function Stepper({ steps, current: currentProp, progressLabel, className, ...props }: StepperProps) {
  const current = Math.min(Math.max(currentProp, 1), steps.length);

  return (
    <div {...props} className={clsx('stack gap-2', className)}>
      <p className="row items-baseline justify-between gap-4 text-caption">
        <span aria-hidden className="text-default">
          {steps[current - 1]}
        </span>
        <span className="text-muted">{progressLabel}</span>
      </p>

      {/* Only the current step's name is shown (above); the list keeps every name for screen readers. */}
      <ol className="row gap-1">
        {steps.map((step, index) => (
          <li
            key={index}
            aria-current={index + 1 === current ? 'step' : undefined}
            className={clsx('h-1 flex-1 rounded-full', index < current ? 'bg-primary' : 'bg-track')}
          >
            <span className="sr-only">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
