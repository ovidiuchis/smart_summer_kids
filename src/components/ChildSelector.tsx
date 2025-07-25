import React from "react";
import { Child, CompletedActivity } from "@/hooks/useSupabaseData";
import { useFeatureHighlight } from "@/hooks/useFeatureHighlight";
import Header from "./Header";
import { LogOut } from "lucide-react";

interface ChildSelectorProps {
  children: Child[];
  completedActivities: CompletedActivity[];
  onChildSelect: (child: Child) => void;
  onParentMode: () => void;
  familyName?: string;
  isDemo?: boolean;
  onSignOut?: () => void;
}

const ChildSelector: React.FC<ChildSelectorProps> = ({
  children,
  completedActivities,
  onChildSelect,
  onParentMode,
  familyName,
  isDemo = false,
  onSignOut,
}) => {
  const { hasSeenFeature } = useFeatureHighlight();
  const showAccountFeatureHighlight = !hasSeenFeature("accountSection");

  const getTotalPointsEarned = (childId: string) => {
    return completedActivities
      .filter((ca) => ca.child_id === childId)
      .reduce((total, ca) => total + ca.points_earned, 0);
  };

  return (
    <div className="text-center animate-fade-in">
      <div className="flex justify-end mb-4">
        {isDemo && onSignOut && (
          <button
            onClick={onSignOut}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            title="Deconectează-te"
          >
            <LogOut size={16} />
            Deconectează-te
          </button>
        )}
      </div>

      <div className="mb-8 relative">
        {isDemo && (
          <div className="absolute top-0 right-2 bg-yellow-400 text-black px-4 py-1 rounded-full font-bold text-md transform rotate-12 shadow-md inline-block">
            DEMO
          </div>
        )}
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          🌟 Tracker Activități de Vară 🌟
        </h1>
        {familyName && (
          <div className="text-2xl font-semibold text-blue-700 mb-2">
            👨‍👩‍👧‍👦 Familia {familyName}
          </div>
        )}
        <p className="text-xl text-gray-600">
          Alege numele tău pentru a colecta puncte în această Super Vară!
        </p>
      </div>

      {children.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
          {children.map((child) => {
            const totalEarned = getTotalPointsEarned(child.id);
            return (
              <div
                key={child.id}
                onClick={() => onChildSelect(child)}
                className="bg-white rounded-2xl p-8 shadow-lg hover-lift cursor-pointer border-4 border-transparent hover:border-blue-300 transition-all duration-300"
              >
                <div className="mb-4">
                  {child.avatar_url ? (
                    <img
                      src={child.avatar_url}
                      alt={child.name}
                      className="w-36 h-36 rounded-full object-cover border-4 border-blue-300 mx-auto shadow-lg"
                    />
                  ) : (
                    <span className="text-9xl block leading-none drop-shadow-md">
                      {child.name[0]}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {child.name}
                </h3>
                <div className="space-y-2">
                  <div className="mature-gradient-blue text-white px-4 py-2 rounded-full text-lg font-bold">
                    ⭐ {child.total_points} puncte
                  </div>
                  <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                    📈 Total câștigat: {totalEarned} puncte
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto mb-8">
          <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
          <p className="text-gray-600">
            Nu există copii înregistrați încă. Accesează panoul de părinte
            pentru a adăuga copii.
          </p>
        </div>
      )}

      <button
        onClick={onParentMode}
        className={`text-gray-500 hover:text-gray-700 underline transition-colors duration-200 relative px-4 py-2 rounded-lg
          ${
            showAccountFeatureHighlight
              ? "feature-highlight font-medium text-blue-600 hover:text-blue-800"
              : ""
          }`}
      >
        Acces părinte
        {showAccountFeatureHighlight && (
          <span className="absolute -top-2 -right-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
            Nou
          </span>
        )}
      </button>
    </div>
  );
};

export default ChildSelector;
