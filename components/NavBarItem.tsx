import React from "react";

interface NavBarItemProps {
  label: string;
  iconUrl: string;
  isActive: boolean;
  onClick: () => void;
}

const NavBarItem: React.FC<NavBarItemProps> = ({ label, iconUrl, isActive, onClick }) => {
  return (
    <button
      className={`flex flex-col items-center py-2 flex-1 ${
        isActive
          ? "text-indigo-600"
          : "text-gray-700 hover:bg-gray-100 transition"
      }`}
      onClick={onClick}
    >
      <span
        className={`w-6 h-6 mb-1`}
        style={{
          mask: `url(${iconUrl}) no-repeat center`,
          WebkitMask: `url(${iconUrl}) no-repeat center`,
          backgroundColor: isActive ? "#4f46e5" : "#6b7280",
        }}
      ></span>
    <span className={`text-xs font-medium ${
          isActive ? "fill-indigo-600" : "fill-gray-400"
        }`}>{label}</span>
    </button>
  );
};

export default NavBarItem;
