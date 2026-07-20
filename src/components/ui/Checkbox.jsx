import React from 'react';
import classNames from 'classnames';

const Checkbox = React.forwardRef(({ 
  className, 
  checked, 
  onChange, 
  label, 
  id,
  disabled,
  ...props 
}, ref) => {
  const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label 
      htmlFor={checkboxId}
      className={classNames(
        'flex items-center gap-3 p-2 bg-white border-2 border-black transition-colors',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100',
        className
      )}
    >
      <input 
        id={checkboxId}
        type="checkbox" 
        ref={ref}
        checked={checked} 
        onChange={onChange} 
        disabled={disabled}
        className="w-5 h-5 accent-black border-2 border-black cursor-pointer" 
        {...props}
      />
      {label && (
        <span className="font-bold text-sm text-black select-none uppercase tracking-wide">
          {label}
        </span>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
