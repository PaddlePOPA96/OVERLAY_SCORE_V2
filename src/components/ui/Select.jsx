import React from 'react';
import classNames from 'classnames';

const Select = React.forwardRef(({ 
  className, 
  label, 
  error, 
  helperText, 
  fullWidth,
  options = [],
  id,
  ...props 
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  
  return (
    <div className={classNames('flex flex-col', fullWidth && 'w-full', className)}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 font-bold text-black uppercase tracking-wide text-xs">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        <select
          id={selectId}
          ref={ref}
          className={classNames(
            'appearance-none px-4 py-2.5 bg-white border-2 border-black font-semibold text-black focus:outline-none transition-shadow cursor-pointer',
            'focus:shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:-translate-y-[1px] focus:-translate-x-[1px]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[#ff3366] focus:shadow-[4px_4px_0_0_#ff3366]',
            'w-full flex-1 pr-10'
          )}
          {...props}
        >
          {options.map((opt, i) => (
            <option key={i} value={opt.value}>
              {opt.label || opt.value}
            </option>
          ))}
          {props.children}
        </select>
        {/* Custom Chevron Icon for Neobrutalism */}
        <div className="pointer-events-none absolute right-4 flex items-center justify-center text-black">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {(error || helperText) && (
        <p className={classNames('mt-1.5 text-xs font-bold', error ? 'text-[#ff3366]' : 'text-slate-600')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
