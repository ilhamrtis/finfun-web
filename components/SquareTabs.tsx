import React from "react";

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SquareTabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex justify-around">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-8 py-2 pb-4 text-sm  ${
            activeTab === tab
              ? "font-semibold text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-600 hover:text-indigo-600 border-b-2 border-gray-200"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default SquareTabs;