import React from "react";

interface TopbarProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'transparent';
  size?: 'sm' | 'md' | 'lg';
}

const Topbar: React.FC<TopbarProps> = ({
  title,
  subtitle,
  icon,
  actions,
  variant = 'default',
  size = 'md'
}) => {
  const sizes = {
    sm: 'py-2 px-4',
    md: 'py-3 px-6',
    lg: 'py-4 px-8'
  };

  const variants = {
    default: 'bg-gray-800 shadow-md border-b border-gray-700',
    transparent: 'bg-transparent'
  };

  return (
    <div className={`
      ${variants[variant]}
      ${sizes[size]}
      transition-all duration-200
      flex justify-between items-center
      text-white
    `}>
      <div className="flex items-center space-x-3">
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-lg font-semibold leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default Topbar;