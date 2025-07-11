import React, { useState } from "react";
import { Activity } from "@/hooks/useSupabaseData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ActivityCardProps {
  activity: Activity;
  isCompleted: boolean;
  onComplete: (activityId: string, selectedDate?: string) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  isCompleted,
  onComplete,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>("today");

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

  const getDateValue = () => {
    if (selectedDate === "today") {
      return new Date().toISOString().split("T")[0];
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split("T")[0];
    }
  };

  const handleComplete = () => {
    const dateValue = selectedDate === "today" ? undefined : getDateValue();
    onComplete(activity.id, dateValue);
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
            activity.points >= 0
              ? getCategoryColor(activity.category)
              : "bg-red-500"
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

      {!isCompleted && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pentru care zi?
          </label>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Alege ziua" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Astăzi</SelectItem>
              <SelectItem value="yesterday">Ieri</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <button
        onClick={handleComplete}
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
