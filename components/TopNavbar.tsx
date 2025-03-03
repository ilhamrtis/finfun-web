import React from "react";

interface TopNavBarProps {
  points: number;
  onCreateClick: () => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ points, onCreateClick }) => {
  return (
    <div className="flex items-center justify-between p-4">
      {/* Left: Mini Logo */}
      <div className="flex items-center">
        <img src="/images/mini-finfun.svg" alt="Finfun Logo" className="h-14 w-auto" />
      </div>

      {/* Right: Create Button and Points */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onCreateClick}
          className="flex items-center px-8 py-1 bg-indigo-600 text-white text-sm shadow hover:bg-indigo-800 rounded-full"
        >
            <span className="text-lg font-bold">+</span>
            <span className="ml-2">Create</span>
        </button>
        <div className="text-sm font-medium bg-indigo-100 px-6 py-2 text-indigo-600 border-2 border-indigo-600 rounded-full">
            <span className="font-bold">{points}</span> Points
        </div>
      </div>
    </div>
  );
};

export default TopNavBar;
