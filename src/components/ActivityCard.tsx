import React from "react";
import { Activity } from "@/hooks/useSupabaseData";

interface ActivityCardProps {
  activity: Activity;
  isCompleted: boolean;
  onComplete: (activityId: string) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  isCompleted,
  onComplete,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "citire":
        return "mature-gradient-blue";
      case "curatenie":
        return "mature-gradient-green";
      case "ajutor":
        return "mature-gradient-orange";
      case "exercitii":
        return "mature-gradient-purple";
      case "invatare":
        return "mature-gradient-pink";
      default:
        return "mature-gradient-blue";
    }
  };

  return (
    <div
      className={`bg-white rounded-lg p-6 shadow-md border border-gray-200 hover-lift transition-all duration-300 ${
        isCompleted
          ? "opacity-75 border-green-400 bg-green-50"
          : "hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl">{activity.emoji}</div>
        <div
          className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
            activity.points >= 0 ? getCategoryColor(activity.category) : "bg-red-500"
          }`}
        >
          {activity.points >= 0 ? "+" : "−"}
          {Math.abs(activity.points)} puncte
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {activity.name}
      </h3>

      {activity.description && (
        <p className="text-gray-600 mb-4 text-sm">{activity.description}</p>
      )}

      <button
        onClick={() => onComplete(activity.id)}
        disabled={isCompleted}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
          isCompleted
            ? "bg-green-500 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 hover:scale-105"
        }`}
      >
        {isCompleted ? "✅ Completat!" : "🎯 Marchează ca Completat"}
      </button>
    </div>
  );
};

export default ActivityCard;
