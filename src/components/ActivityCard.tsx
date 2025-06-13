
import React from 'react';
import { Activity } from '../hooks/useAppState';

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
      case 'reading': return 'kid-gradient-blue';
      case 'chores': return 'kid-gradient-green';
      case 'helping': return 'kid-gradient-orange';
      case 'exercise': return 'kid-gradient-purple';
      case 'learning': return 'kid-gradient-pink';
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
          +{activity.points} pts
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {activity.name}
      </h3>
      
      <p className="text-gray-600 mb-4">
        {activity.description}
      </p>
      
      <button
        onClick={() => onComplete(activity.id)}
        disabled={isCompleted}
        className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-200 ${
          isCompleted 
            ? 'bg-green-500 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
        }`}
      >
        {isCompleted ? '✅ Completed!' : '🎯 Mark Complete'}
      </button>
    </div>
  );
};

export default ActivityCard;
