import React from "react";

interface HeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, rightElement }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{title}</h1>
        {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
      </div>
      {rightElement}
    </div>
  );
};

export default Header;
