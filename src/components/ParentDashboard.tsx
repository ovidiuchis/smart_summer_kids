
import React from 'react';
import { Child, Activity } from '../hooks/useAppState';
import Header from './Header';

interface ParentDashboardProps {
  children: Child[];
  activities: Activity[];
  onBack: () => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ 
  children, 
  activities, 
  onBack 
}) => {
  const totalPointsEarned = children.reduce((sum, child) => sum + child.points, 0);
  const totalActivitiesCompleted = children.reduce((sum, child) => sum + child.completedActivities.length, 0);

  return (
    <div className="animate-fade-in">
      <Header
        title="👨‍👩‍👧‍👦 Parent Dashboard"
        subtitle="Track your children's progress"
        rightElement={
          <button
            onClick={onBack}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl font-medium transition-colors duration-200"
          >
            ← Back
          </button>
        }
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
          <div className="text-2xl font-bold text-gray-800">{children.length}</div>
          <div className="text-gray-600">Active Children</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-bold text-gray-800">{totalPointsEarned}</div>
          <div className="text-gray-600">Total Points Earned</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-gray-800">{totalActivitiesCompleted}</div>
          <div className="text-gray-600">Activities Completed</div>
        </div>
      </div>

      {/* Children Progress */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Children's Progress</h2>
        <div className="space-y-4">
          {children.map((child) => (
            <div key={child.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{child.avatar}</div>
                <div>
                  <h3 className="font-bold text-gray-800">{child.name}</h3>
                  <p className="text-gray-600">
                    {child.completedActivities.length} activities completed today
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">{child.points}</div>
                <div className="text-sm text-gray-600">total points</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Activities */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Activities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity) => (
            <div key={activity.id} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">{activity.emoji}</div>
                <div className="text-sm font-bold text-blue-600">+{activity.points} pts</div>
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{activity.name}</h3>
              <p className="text-sm text-gray-600">{activity.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
