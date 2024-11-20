import React from "react";

interface TopbarProps {
  title: string;
  actions?: React.ReactNode
}

const Topbar: React.FC<TopbarProps> = ({ title, actions }) => {
  return (
    <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">{title}</h1>
      <div className="space-x-4">{actions}</div>
    </div>
  );
};

export default Topbar;
