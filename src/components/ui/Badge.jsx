import React from 'react';
import classNames from 'classnames';

const Badge = ({ 
  children, 
  variant = 'primary', 
  className,
  ...props 
}) => {
  const variants = {
    primary: 'bg-[#ccff00] text-black border-black',
    secondary: 'bg-white text-black border-black',
    danger: 'bg-[#ff3366] text-white border-black',
    info: 'bg-[#00ffff] text-black border-black',
    warning: 'bg-[#ffcc00] text-black border-black',
    dark: 'bg-black text-white border-black',
  };

  return (
    <span
      className={classNames(
        'inline-flex items-center justify-center px-2 py-1 text-xs font-black uppercase tracking-wider border-2',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
