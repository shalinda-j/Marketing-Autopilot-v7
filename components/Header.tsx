
import React from 'react';
import { CubeTransparentIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-brand-secondary to-brand-accent p-2 rounded-lg">
            <CubeTransparentIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Marketing Autopilot</h1>
        </div>
      </div>
    </header>
  );
};
