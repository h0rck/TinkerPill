import React from "react";

interface SidebarProps {
  menuItems: Array<{
    label: string;
    active: boolean;
    onClick: () => void;
  }>;
}

const Sidebar: React.FC<SidebarProps> = ({ menuItems }) => {
  return (
    <div className="bg-gray-700 text-white w-64 p-4">
      <h2 className="text-lg font-bold mb-4">Menu</h2>
      {menuItems.map((item, index) => (
        <button
          key={index}
          className={`w-full text-left px-4 py-2 mb-2 rounded ${
            item.active ? "bg-blue-500" : "bg-gray-600"
          }`}
          onClick={item.onClick}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
