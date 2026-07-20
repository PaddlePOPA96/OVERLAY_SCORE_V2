import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';

export const Dialog = ({ open, onClose, children, className }) => {
  // Prevent scrolling when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.4 }}
            className={classNames(
              'relative w-full max-w-lg bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] z-50',
              className
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const DialogHeader = ({ children, className }) => (
  <div className={classNames('p-6 border-b-4 border-black flex items-center justify-between', className)}>
    {children}
  </div>
);

export const DialogTitle = ({ children, className }) => (
  <h2 className={classNames('text-2xl font-black uppercase tracking-wider', className)}>
    {children}
  </h2>
);

export const DialogContent = ({ children, className }) => (
  <div className={classNames('p-6', className)}>
    {children}
  </div>
);

export const DialogFooter = ({ children, className }) => (
  <div className={classNames('p-6 border-t-4 border-black flex justify-end gap-4 bg-slate-50', className)}>
    {children}
  </div>
);
