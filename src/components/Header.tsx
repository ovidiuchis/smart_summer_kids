import React from "react";

interface HeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  rightElement?: React.ReactNode;
  familyName?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  rightElement,
  familyName,
}) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{title}</h1>
        {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
        {familyName && (
          <div className="text-xl font-semibold text-blue-700 mt-1">
            👨‍👩‍👧‍👦 Familia {familyName}
          </div>
        )}
      </div>
      {rightElement}
    </div>
  );
};

export default Header;
