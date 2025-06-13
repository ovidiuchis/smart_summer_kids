
import React from 'react';
import { Activity } from '@/hooks/useSupabaseData';

interface ActivityCardProps {
  activity: Activity;
  isCompleted: boolean;
  onComplete: (activityId: string) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  isCompleted, 
  onComplete 
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'citire': return 'kid-gradient-blue';
      case 'curatenie': return 'kid-gradient-green';
      case 'ajutor': return 'kid-gradient-orange';
      case 'exercitii': return 'kid-gradient-purple';
      case 'invatare': return 'kid-gradient-pink';
      default: return 'kid-gradient-blue';
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg hover-lift transition-all duration-300 ${
      isCompleted ? 'opacity-75 border-4 border-green-300' : 'border-4 border-transparent hover:border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-4xl">{activity.emoji}</div>
        <div className={`px-3 py-1 rounded-full text-white text-sm font-bold ${getCategoryColor(activity.category)}`}>
          +{activity.points} puncte
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {activity.name}
      </h3>
      
      {activity.description && (
        <p className="text-gray-600 mb-4">
          {activity.description}
        </p>
      )}
      
      <button
        onClick={() => onComplete(activity.id)}
        disabled={isCompleted}
        className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-200 ${
          isCompleted 
            ? 'bg-green-500 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
        }`}
      >
        {isCompleted ? '✅ Completat!' : '🎯 Marchează ca Completat'}
      </button>
    </div>
  );
};

export default ActivityCard;
