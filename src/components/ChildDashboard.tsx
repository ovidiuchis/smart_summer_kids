
import React from 'react';
import { Child, Activity } from '../hooks/useAppState';
import Header from './Header';
import ActivityCard from './ActivityCard';

interface ChildDashboardProps {
  child: Child;
  activities: Activity[];
  onBack: () => void;
  onCompleteActivity: (activityId: string) => void;
}

const ChildDashboard: React.FC<ChildDashboardProps> = ({ 
  child, 
  activities, 
  onBack, 
  onCompleteActivity 
}) => {
  const completedToday = child.completedActivities.length;
  const totalAvailable = activities.length;
  const progressPercentage = (completedToday / totalAvailable) * 100;

  return (
    <div className="animate-fade-in">
      <Header
        title={`Hi ${child.name}! ${child.avatar}`}
        subtitle={`You have ${child.points} total points!`}
        rightElement={
          <button
            onClick={onBack}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl font-medium transition-colors duration-200"
          >
            ← Back
          </button>
        }
      />

      {/* Progress Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Today's Progress</h2>
          <div className="text-3xl bounce-gentle">🎯</div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
            <span>Activities completed</span>
            <span>{completedToday}/{totalAvailable}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="kid-gradient-green h-4 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {completedToday === totalAvailable && (
          <div className="text-center p-4 bg-yellow-100 rounded-xl">
            <div className="text-2xl mb-2">🎉 Amazing work!</div>
            <p className="text-gray-700 font-medium">You completed all activities today!</p>
          </div>
        )}
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            isCompleted={child.completedActivities.includes(activity.id)}
            onComplete={onCompleteActivity}
          />
        ))}
      </div>
    </div>
  );
};

export default ChildDashboard;
