
import React from 'react';

/**
 * Props for the GaugeChart component.
 */
interface GaugeChartProps {
  percentage: number;
  size?: number; // Width of the chart in pixels
  strokeWidth?: number; // Thickness of the bar in pixels
  color?: string; // Tailwind text color class for the progress bar
}

/**
 * A semi-circle gauge chart component.
 */
const GaugeChart: React.FC<GaugeChartProps> = ({
  percentage,
  size = 40,
  strokeWidth = 4,
  color = 'text-emerald-500'
}) => {
  const safePercentage = Math.max(0, Math.min(100, percentage));
  
  // We use a fixed viewBox of 100x50 for easy calculation.
  // The path moves from 10,50 to 90,50 describing an arc.
  // The stroke width needs to be scaled relative to the viewbox.
  const relativeStrokeWidth = (strokeWidth / size) * 100;
  
  // Radius calculation based on the path "M 10 50 A 40 40..."
  // The arc radius is 40 units in a 100 unit wide box.
  const radius = 40;
  const arcLength = Math.PI * radius; // Half circumference
  const fillLength = (safePercentage / 100) * arcLength;

  // Determine color based on completion
  const finalColor = safePercentage >= 100 ? 'text-emerald-500' : color;

  return (
    <div 
      className="relative flex flex-col items-center justify-end" 
      style={{ width: size, height: size / 2 }}
    >
      <svg
        viewBox="0 0 100 50"
        className="w-full h-full overflow-visible"
      >
        {/* Background Track */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="currentColor"
          strokeWidth={relativeStrokeWidth}
          strokeLinecap="round"
          className="text-zinc-200 dark:text-zinc-700"
        />
        {/* Progress Arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="currentColor"
          strokeWidth={relativeStrokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${fillLength}, ${arcLength}`}
          className={`${finalColor} transition-all duration-700 ease-out`}
        />
      </svg>
      {/* Percentage Text positioned at the bottom center */}
      <span className="absolute bottom-0 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 leading-none transform translate-y-1">
         {Math.round(safePercentage)}%
      </span>
    </div>
  );
};

export default GaugeChart;
