export function Card({ className = "", ...props }) {
  const merged = `rounded-xl border bg-white/80 shadow-sm ${className}`.trim();
  return <div className={merged} {...props} />;
}

