import React from "react";

interface SidebarProps {
  menuItems: Array<{
    icon: React.ReactNode; // Ícone para o botão
    active: boolean; // Determina se o botão está ativo
    onClick: () => void; // Função ao clicar no botão
  }>;
}

const Sidebar: React.FC<SidebarProps> = ({ menuItems }) => {
  return (
    <div className="bg-gray-700 text-white w-12 p-2 flex flex-col items-center space-y-2">
      {menuItems.map((item, index) => (
        <button
          key={index}
          className={`w-10 h-10 flex items-center justify-center rounded ${
            item.active ? "bg-blue-500 text-white" : "bg-gray-600 text-gray-300"
          } hover:bg-blue-400`}
          onClick={item.onClick}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
