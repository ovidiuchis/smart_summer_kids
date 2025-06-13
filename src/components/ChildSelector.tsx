
import React from 'react';
import { Child } from '../hooks/useAppState';

interface ChildSelectorProps {
  children: Child[];
  onChildSelect: (child: Child) => void;
  onParentMode: () => void;
}

const ChildSelector: React.FC<ChildSelectorProps> = ({ 
  children, 
  onChildSelect, 
  onParentMode 
}) => {
  return (
    <div className="text-center animate-fade-in">
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          🌟 Summer Activity Tracker 🌟
        </h1>
        <p className="text-xl text-gray-600">
          Choose your name to start earning points!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
        {children.map((child) => (
          <div
            key={child.id}
            onClick={() => onChildSelect(child)}
            className="bg-white rounded-2xl p-8 shadow-lg hover-lift cursor-pointer border-4 border-transparent hover:border-blue-300 transition-all duration-300"
          >
            <div className="text-6xl mb-4">{child.avatar}</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {child.name}
            </h3>
            <div className="kid-gradient-blue text-white px-4 py-2 rounded-full text-lg font-bold">
              ⭐ {child.points} points
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onParentMode}
        className="text-gray-500 hover:text-gray-700 underline transition-colors duration-200"
      >
        Parent/Admin Access
      </button>
    </div>
  );
};

export default ChildSelector;
