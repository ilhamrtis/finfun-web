import React from "react";

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabStyle?: string; // Allows customization for tabs
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, tabStyle }) => {
const handleTabClick = (tab: string) => {
    if (tab === activeTab) {
        onTabChange("Live Now");
    } else {
        onTabChange(tab);
    }
    };
  return (
    <div className={`flex justify-around mt-4 ${tabStyle}`}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={`px-8 py-2 rounded-full ${
            activeTab === tab
              ? "text-indigo-600 border-2 border-indigo-600 font-semibold bg-indigo-100"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300 border-2 border-transparent"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
