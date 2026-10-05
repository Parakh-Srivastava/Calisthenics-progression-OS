import { motion } from 'framer-motion';

/** Progress Ring SVG component */
export default function ProgressRing({ 
  value = 0, 
  max = 100, 
  size = 80, 
  strokeWidth = 6, 
  color = '#7c3aed',
  bgColor = '#27272a',
  children,
  className = '',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = Math.min(value / max, 1);
  const strokeDashoffset = circumference - percent * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

/** Linear progress bar */
export function ProgressBar({ 
  value = 0, 
  max = 100, 
  color = '#7c3aed', 
  height = 6,
  className = '',
  showLabel = false,
}) {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div className={className}>
      <div 
        className="w-full rounded-full overflow-hidden" 
        style={{ height, backgroundColor: '#27272a' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-zinc-500">{value}</span>
          <span className="text-xs text-zinc-500">{max}</span>
        </div>
      )}
    </div>
  );
}
