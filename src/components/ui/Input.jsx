import React from 'react';
import classNames from 'classnames';

const Input = React.forwardRef(({ 
  className, 
  label, 
  error, 
  helperText, 
  fullWidth, 
  startAdornment, 
  endAdornment, 
  id,
  ...props 
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  
  return (
    <div className={classNames('flex flex-col', fullWidth && 'w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 font-bold text-black uppercase tracking-wide text-xs">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {startAdornment && (
          <div className="absolute left-3 text-black">
            {startAdornment}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={classNames(
            'px-4 py-2.5 bg-white border-2 border-black font-semibold text-black focus:outline-none transition-shadow',
            'focus:shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:-translate-y-[1px] focus:-translate-x-[1px]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[#ff3366] focus:shadow-[4px_4px_0_0_#ff3366]',
            'w-full flex-1',
            startAdornment && 'pl-10',
            endAdornment && 'pr-10'
          )}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-3 text-black">
            {endAdornment}
          </div>
        )}
      </div>
      {(error || helperText) && (
        <p className={classNames('mt-1.5 text-xs font-bold', error ? 'text-[#ff3366]' : 'text-slate-600')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
