import React from "react";

interface TopbarProps {
  title: string;
  actions?: React.ReactNode
}

const Topbar: React.FC<TopbarProps> = ({ title, actions }) => {
  return (
    <div className="bg-[#1e1e1e] text-white h-[28px] px-2 flex justify-between items-center border-b border-[#2a2a2a]">
      <h1 className="text-xs font-normal text-gray-400">{title}</h1>
      <div className="flex items-center gap-1">{actions}</div>
    </div>
  );
};

export default Topbar;
