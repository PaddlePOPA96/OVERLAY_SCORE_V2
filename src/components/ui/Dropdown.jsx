import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';

export const Dropdown = ({ trigger, children, align = 'right', className }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={classNames(
              'absolute z-50 mt-2 bg-white border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]',
              align === 'right' ? 'right-0' : 'left-0',
              className
            )}
          >
            {/* Pass setOpen to children so they can close the dropdown when clicked */}
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { closeDropdown: () => setOpen(false) });
              }
              return child;
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DropdownItem = ({ children, onClick, className, closeDropdown, ...props }) => (
  <button
    onClick={(e) => {
      if (onClick) onClick(e);
      if (closeDropdown) closeDropdown();
    }}
    className={classNames(
      'w-full text-left px-4 py-3 font-bold hover:bg-[#ccff00] transition-colors border-b-2 border-black last:border-b-0',
      'flex items-center gap-3',
      className
    )}
    {...props}
  >
    {children}
  </button>
);

export const DropdownDivider = () => (
  <div className="border-b-4 border-black w-full" />
);
