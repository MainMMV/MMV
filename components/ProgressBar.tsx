import React from 'react';

/**
 * Props for the ProgressBar component.
 */
interface ProgressBarProps {
  percentage: number; // The progress percentage, expected to be between 0 and 100.
}

/**
 * A visual component that displays a progress bar and a percentage value.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  // Ensure the percentage is clamped between 0 and 100 to prevent visual glitches.
  const safePercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className="flex items-center gap-2">
      {/* The background of the progress bar */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
        {/* The filled portion of the progress bar, with its width set by the percentage */}
        <div
          className="bg-emerald-500 h-2 rounded-full"
          style={{ width: `${safePercentage}%` }}
        ></div>
      </div>
      {/* The text label showing the exact percentage */}
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 w-14 text-right">{safePercentage.toFixed(2)}%</span>
    </div>
  );
};

export default ProgressBar;