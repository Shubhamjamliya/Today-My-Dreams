import React from 'react';

const Loader = ({ size = 'medium', text = 'Loading...', fullScreen = false, inline = false }) => {
  const sizeClasses = {
    tiny: 'w-4 h-4',
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  const borderClasses = {
    tiny: 'border-2',
    small: 'border-2',
    medium: 'border-4',
    large: 'border-4'
  };

  const loaderContent = (
    <div className={`flex ${inline ? 'flex-row' : 'flex-col'} items-center justify-center ${inline ? 'space-x-2' : 'space-y-4'}`}>
      <div className={`${sizeClasses[size]} ${borderClasses[size]} border-amber-400 border-t-transparent rounded-full animate-spin`}></div>
      {text && <p className={`${inline ? 'text-sm' : 'text-base'} text-slate-600 font-medium`}>{text}</p>}
    </div>
  );

  if (inline) {
    return loaderContent;
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      {loaderContent}
    </div>
  );
};

export default Loader; 