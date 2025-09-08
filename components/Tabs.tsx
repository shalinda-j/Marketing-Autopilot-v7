
import React from 'react';

interface TabsProps {
  tabs: { label: string; content: React.ReactNode; icon?: React.ReactNode; }[];
  activeTab: number;
  setActiveTab: (index: number) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div>
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(index)}
              className={`${
                activeTab === index
                  ? 'border-brand-secondary text-brand-secondary'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
              aria-current={activeTab === index ? 'page' : undefined}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="pt-6">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};
