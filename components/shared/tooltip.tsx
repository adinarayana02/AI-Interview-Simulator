'use client';

import React from 'react';

interface TooltipProps {
  text: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  return (
    <div className="relative inline-block">
      <span className="cursor-help text-gray-400 border border-gray-400 rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">
        ⓘ
      </span>
      <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute z-10 w-48 p-2 mt-2 text-sm text-white bg-gray-700 rounded-lg shadow-lg transition-opacity duration-300 -left-20 top-full">
        {text}
      </div>
    </div>
  );
};