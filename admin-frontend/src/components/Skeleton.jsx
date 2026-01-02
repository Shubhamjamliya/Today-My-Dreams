import React from 'react';

const Skeleton = ({ className = '', variant = 'rect' }) => {
  const baseClasses = 'bg-slate-200 animate-pulse';
  const variantClasses = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4 w-full'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

export const DashboardSkeleton = () => (
  <div className="p-6 space-y-6 bg-gray-100 min-h-screen animate-pulse">
    <Skeleton variant="text" className="w-64 h-10 mb-8" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <Skeleton variant="text" className="w-32 h-6" />
          <Skeleton variant="text" className="w-16 h-10" />
        </div>
      ))}
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
      <Skeleton variant="text" className="w-48 h-8" />
      <Skeleton variant="rect" className="w-32 h-10" />
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50">
            {[...Array(cols)].map((_, i) => (
              <th key={i} className="p-4">
                <Skeleton variant="text" className="w-24 h-4" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <tr key={i} className="border-b border-slate-50">
              {[...Array(cols)].map((_, j) => (
                <td key={j} className="p-4">
                  <Skeleton variant="text" className="w-full h-4" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const CardGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <Skeleton variant="rect" className="w-full aspect-square" />
        <div className="p-4 space-y-3">
          <Skeleton variant="text" className="w-3/4 h-6" />
          <Skeleton variant="text" className="w-1/2 h-4" />
          <div className="flex justify-between pt-2">
            <Skeleton variant="text" className="w-16 h-4" />
            <Skeleton variant="text" className="w-16 h-4" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;