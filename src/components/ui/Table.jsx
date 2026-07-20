import React from 'react';
import classNames from 'classnames';

export const TableContainer = ({ children, className }) => (
  <div className={classNames('w-full overflow-x-auto bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]', className)}>
    <table className="w-full text-left border-collapse">
      {children}
    </table>
  </div>
);

export const TableHead = ({ children, className }) => (
  <thead className={classNames('bg-slate-100 border-b-4 border-black', className)}>
    {children}
  </thead>
);

export const TableBody = ({ children, className }) => (
  <tbody className={classNames('divide-y-2 divide-black', className)}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className, hover = true }) => (
  <tr className={classNames(hover && 'hover:bg-slate-50 transition-colors', className)}>
    {children}
  </tr>
);

export const TableHeader = ({ children, className }) => (
  <th className={classNames('px-4 py-3 font-black uppercase tracking-wider text-black text-sm whitespace-nowrap', className)}>
    {children}
  </th>
);

export const TableCell = ({ children, className }) => (
  <td className={classNames('px-4 py-3 text-sm font-semibold text-slate-800', className)}>
    {children}
  </td>
);
