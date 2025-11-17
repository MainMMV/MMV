import React from 'react';

/**
 * Props for the PieChart component.
 */
interface PieChartProps {
  percentage: number; // The progress percentage (0-100).
  size?: number; // The width and height of the chart in pixels.
  strokeWidth?: number; // The thickness of the chart's stroke.
}

/**
 * A circular progress chart component, rendered using SVG.
 */
const PieChart: React.FC<PieChartProps> = ({
  percentage,
  size = 40,
  strokeWidth = 4,
}) => {
  // Clamp the percentage value between 0 and 100 for safety.
  const safePercentage = Math.max(0, Math.min(100, percentage));
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size} aria-label={`Progress: ${safePercentage.toFixed(0)}%`}>
        {/* Background circle */}
        <circle
          className="text-zinc-200 dark:text-zinc-700"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Foreground progress arc */}
        <circle
          className="text-emerald-500 transition-all duration-300 ease-in-out"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Percentage text in the center */}
      <span className="absolute text-xs font-medium text-zinc-600 dark:text-zinc-300">
        {`${Math.round(safePercentage)}%`}
      </span>
    </div>
  );
};

export default PieChart;