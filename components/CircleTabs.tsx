import React from "react";

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CircleTabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
      <div className="flex justify-around mt-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`w-24 h-24 flex items-center justify-center rounded-full border-2 ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600 font-semibold"
                : "border-gray-300 text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    );
  };
  
  export default CircleTabs;
  