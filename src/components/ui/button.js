export function Button({
  variant = "default",
  size = "md",
  className = "",
  disabled,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-500",
    outline:
      "border border-slate-300 bg-transparent text-slate-900 hover:bg-slate-50",
    subtle:
      "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-transparent",
    ghost:
      "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4",
    lg: "h-10 px-5 text-base",
  };

  const variantClass = variants[variant] || variants.default;
  const sizeClass = sizes[size] || sizes.md;

  const merged = `${base} ${variantClass} ${sizeClass} ${className}`.trim();

  return (
    <button className={merged} disabled={disabled} {...props}>
      {props.children}
    </button>
  );
}

