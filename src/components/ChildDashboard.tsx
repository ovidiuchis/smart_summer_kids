import React, { useState } from "react";
import { Child, Activity, CompletedActivity } from "@/hooks/useSupabaseData";
import Header from "./Header";
import ActivityCard from "./ActivityCard";

interface ChildDashboardProps {
  child: Child;
  activities: Activity[];
  completedActivities: CompletedActivity[];
  onBack: () => void;
  onCompleteActivity: (activityId: string) => void;
  isDemo?: boolean;
}

const ChildDashboard: React.FC<ChildDashboardProps> = ({
  child,
  activities,
  completedActivities,
  onBack,
  onCompleteActivity,
  isDemo = false,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const completedToday = completedActivities.filter(
    (ca) => ca.child_id === child.id && ca.completed_date === selectedDate
  );

  const completedActivityIds = completedToday.map((ca) => ca.activity_id);
  const totalAvailable = activities.length;
  const progressPercentage =
    totalAvailable > 0 ? (completedToday.length / totalAvailable) * 100 : 0;

  // Get last 7 days for date selection
  const getLastWeekDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (dateStr === today) return "Astăzi";
    if (dateStr === yesterdayStr) return "Ieri";

    return date.toLocaleDateString("ro-RO", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="animate-fade-in">
      <Header
        title={
          <span className="flex items-center gap-2">
            {child.avatar_url ? (
              <img
                src={child.avatar_url}
                alt={child.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-300"
              />
            ) : (
              <span className="text-2xl">{child.name[0]}</span>
            )}
            <span>Salut {child.name}!</span>
          </span>
        }
        subtitle={`Ai ${
          child.total_points !== null && child.total_points >= 0 ? "+" : "−"
        }${Math.abs(child.total_points)} puncte în total!`}
        subtitleIsNegative={child.total_points < 0}
        rightElement={
          <button
            onClick={onBack}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl font-medium transition-colors duration-200"
          >
            ← Înapoi
          </button>
        }
        isDemo={isDemo}
      />

      {/* Date selector */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Alege ziua:</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {getLastWeekDates().map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium transition-colors duration-200 ${
                selectedDate === date
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {formatDate(date)}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Progresul pentru {formatDate(selectedDate)}
          </h2>
          <div className="text-3xl bounce-gentle">🎯</div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
            <span>Activități completate</span>
            <span>
              {completedToday.length}/{totalAvailable}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="mature-gradient-green h-4 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {completedToday.length === totalAvailable && totalAvailable > 0 && (
          <div className="text-center p-4 bg-yellow-100 rounded-xl">
            <div className="text-2xl mb-2">🎉 Excelent!</div>
            <p className="text-gray-700 font-medium">
              Ai completat toate activitățile pentru {formatDate(selectedDate)}!
            </p>
          </div>
        )}

        {/* Show completed activities for selected date */}
        {completedToday.length > 0 && (
          <div className="mt-4">
            <h4 className="font-bold text-gray-700 mb-2">
              Activități completate:
            </h4>
            <div className="space-y-2">
              {completedToday.map((ca) => (
                <div
                  key={ca.id}
                  className="flex items-center justify-between bg-green-50 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{ca.activity?.emoji}</span>
                    <span className="text-gray-700">{ca.activity?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold ${
                        ca.points_earned >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {ca.points_earned >= 0 ? "+" : "−"}
                      {Math.abs(ca.points_earned)} puncte
                    </span>
                    {ca.approved_by_parent ? (
                      <span className="text-green-600">✅</span>
                    ) : (
                      <span className="text-yellow-600">⏳</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Activities Grid - only show for today */}
      {selectedDate === new Date().toISOString().split("T")[0] && (
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Activități disponibile astăzi:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isCompleted={completedActivityIds.includes(activity.id)}
                onComplete={onCompleteActivity}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildDashboard;
