import React from 'react';
import classNames from 'classnames';

const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  fullWidth, 
  disabled, 
  startIcon,
  endIcon,
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-bold uppercase tracking-wider border-2 border-black transition-all duration-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0_0_rgba(0,0,0,1)]';
  
  const shadowClasses = 'shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-[1px] hover:-translate-x-[1px]';

  const variants = {
    primary: 'bg-[#ccff00] text-black hover:bg-[#b3e600]', // Neon Green
    secondary: 'bg-white text-black hover:bg-slate-100',
    danger: 'bg-[#ff3366] text-white hover:bg-[#e62e5c]',
    info: 'bg-[#00ffff] text-black hover:bg-[#00e6e6]',
    outline: 'bg-transparent text-black hover:bg-black/5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={classNames(
        baseClasses,
        shadowClasses,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {startIcon && <span className="mr-2 flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2 flex items-center">{endIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
