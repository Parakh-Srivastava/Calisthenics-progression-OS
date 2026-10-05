import { motion } from 'framer-motion';

/** Card wrapper with glass morphism */
export default function Card({ children, className = '', glow, onClick, animate = true }) {
  const glowClass = glow ? `glow-${glow}` : '';
  
  const Component = animate ? motion.div : 'div';
  const animateProps = animate ? {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  } : {};

  return (
    <Component
      className={`bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-4 ${glowClass} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
      onClick={onClick}
      {...animateProps}
    >
      {children}
    </Component>
  );
}

/** Stat card */
export function StatCard({ label, value, sublabel, icon, color = '#7c3aed' }) {
  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold tabular-nums" style={{ color }}>
        {value}
      </div>
      {sublabel && (
        <span className="text-xs text-zinc-500">{sublabel}</span>
      )}
    </Card>
  );
}

/** Empty state card */
export function EmptyState({ icon, title, subtitle, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {icon && <div className="text-4xl mb-4 opacity-50">{icon}</div>}
      <h3 className="text-lg font-semibold text-zinc-300 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-xs">{subtitle}</p>
      {action && (
        <button
          onClick={action}
          className="px-6 py-3 rounded-xl bg-violet-600 text-white font-medium touch-target"
        >
          {actionLabel || 'Get Started'}
        </button>
      )}
    </div>
  );
}
