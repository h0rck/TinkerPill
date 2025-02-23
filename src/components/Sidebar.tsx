import React from "react";
import { SidebarProps } from '../types/interfaces';

const Sidebar: React.FC<SidebarProps> = ({ menuItems }) => {
  return (
    <div className="bg-[#1e1e1e] border-r border-[#2a2a2a] w-[48px] flex flex-col items-center py-2">
      {menuItems.map((item, index) => (
        <button
          key={index}
          className={`
            w-[40px] h-[40px] mb-1
            flex items-center justify-center
            transition-colors duration-150
            rounded-sm
            ${item.active
              ? "bg-[#2a2a2a] text-[#89b995]"
              : "text-gray-500 hover:text-gray-300 hover:bg-[#252525]"
            }
          `}
          onClick={item.onClick}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
