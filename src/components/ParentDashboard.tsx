import React, { useState } from "react";
import { Child, Activity, CompletedActivity } from "@/hooks/useSupabaseData";
import Header from "./Header";
import { Plus, Trash2, Check, DollarSign, Upload, Camera } from "lucide-react";

interface ParentDashboardProps {
  children: Child[];
  activities: Activity[];
  completedActivities: CompletedActivity[];
  onBack: () => void;
  onAddChild: (name: string, avatar: string) => void;
  onRemoveChild: (childId: string) => void;
  onAddActivity: (activity: {
    name: string;
    description: string;
    emoji: string;
    points: number;
    category: string;
  }) => void;
  onRemoveActivity: (activityId: string) => void;
  onApproveActivity: (completedActivityId: string) => void;
  onPayoutPoints: (childId: string) => void;
  onSignOut?: () => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({
  children,
  activities,
  completedActivities,
  onBack,
  onAddChild,
  onRemoveChild,
  onAddActivity,
  onRemoveActivity,
  onApproveActivity,
  onPayoutPoints,
  onSignOut,
}) => {
  const [showAddChild, setShowAddChild] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAvatar, setNewChildAvatar] = useState("👧");
  const [newActivity, setNewActivity] = useState({
    name: "",
    description: "",
    emoji: "⭐",
    points: 10,
    category: "general",
  });

  const totalPointsEarned = children.reduce(
    (sum, child) => sum + child.total_points,
    0
  );
  const totalActivitiesCompleted = completedActivities.length;
  const pendingApprovals = completedActivities.filter(
    (ca) => !ca.approved_by_parent
  );

  const avatarOptions = ["👧", "👦", "🧒", "👶", "🦸", "🦸‍♀️", "🧚", "🧚‍♂️"];
  const emojiOptions = [
    "⭐",
    "📚",
    "🛏️",
    "🍽️",
    "🏃",
    "🔢",
    "👨‍🍳",
    "🧹",
    "🎨",
    "🎵",
    "🌱",
    "🐕",
  ];
  const categoryOptions = [
    { value: "citire", label: "Citire" },
    { value: "curatenie", label: "Curățenie" },
    { value: "ajutor", label: "Ajutor" },
    { value: "exercitii", label: "Exerciții" },
    { value: "invatare", label: "Învățare" },
    { value: "general", label: "General" },
  ];

  const handleAddChild = () => {
    if (newChildName.trim()) {
      onAddChild(newChildName.trim(), newChildAvatar);
      setNewChildName("");
      setNewChildAvatar("👧");
      setShowAddChild(false);
    }
  };

  const handleAddActivity = () => {
    if (newActivity.name.trim()) {
      onAddActivity({
        name: newActivity.name.trim(),
        description: newActivity.description.trim() || "",
        emoji: newActivity.emoji,
        points: newActivity.points,
        category: newActivity.category,
      });
      setNewActivity({
        name: "",
        description: "",
        emoji: "⭐",
        points: 10,
        category: "general",
      });
      setShowAddActivity(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setNewChildAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="👨‍👩‍👧‍👦 Panou Administrator"
        subtitle="Gestionează copiii și activitățile"
        rightElement={
          <div className="flex items-center gap-2">
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Deconectează-te
              </button>
            )}
            <button
              onClick={onBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              ← Înapoi
            </button>
          </div>
        }
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="text-2xl mb-2 text-center">👨‍👩‍👧‍👦</div>
          <div className="text-2xl font-bold text-gray-800 text-center">
            {children.length}
          </div>
          <div className="text-gray-600 text-center text-sm">Copii activi</div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="text-2xl mb-2 text-center">⭐</div>
          <div className="text-2xl font-bold text-gray-800 text-center">
            {totalPointsEarned}
          </div>
          <div className="text-gray-600 text-center text-sm">
            Puncte câștigate
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="text-2xl mb-2 text-center">✅</div>
          <div className="text-2xl font-bold text-gray-800 text-center">
            {totalActivitiesCompleted}
          </div>
          <div className="text-gray-600 text-center text-sm">
            Activități completate
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="text-2xl mb-2 text-center">⏳</div>
          <div className="text-2xl font-bold text-gray-800 text-center">
            {pendingApprovals.length}
          </div>
          <div className="text-gray-600 text-center text-sm">În așteptare</div>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Activități în așteptarea aprobării
          </h2>
          <div className="space-y-4">
            {pendingApprovals.map((ca) => (
              <div
                key={ca.id}
                className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-xl">{ca.activity?.emoji}</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {ca.child?.name}
                    </h4>
                    <p className="text-gray-600 text-sm">{ca.activity?.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(ca.completed_date).toLocaleDateString("ro-RO")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-semibold text-blue-600">
                    +{ca.points_earned} puncte
                  </div>
                  <button
                    onClick={() => onApproveActivity(ca.id)}
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors duration-200"
                  >
                    <Check size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Children Management */}
      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Gestionare Copii</h2>
          <button
            onClick={() => setShowAddChild(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={16} />
            Adaugă Copil
          </button>
        </div>

        {showAddChild && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nume
                </label>
                <input
                  type="text"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Numele copilului"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    value={
                      avatarOptions.includes(newChildAvatar)
                        ? newChildAvatar
                        : ""
                    }
                    onChange={(e) => setNewChildAvatar(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {avatarOptions.map((avatar) => (
                      <option key={avatar} value={avatar}>
                        {avatar}
                      </option>
                    ))}
                  </select>
                  <div className="text-sm text-gray-500">sau</div>
                  <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition-colors">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {newChildAvatar && !avatarOptions.includes(newChildAvatar) && (
                  <div className="mt-2">
                    <img
                      src={newChildAvatar}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddChild}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Adaugă
                </button>
                <button
                  onClick={() => setShowAddChild(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Anulează
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {children.map((child) => (
            <div
              key={child.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">
                  {avatarOptions.includes(child.avatar) ? (
                    child.avatar
                  ) : child.avatar && child.avatar.startsWith("data:image") ? (
                    <img
                      src={child.avatar}
                      alt={child.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No avatar</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{child.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {
                      completedActivities.filter(
                        (ca) => ca.child_id === child.id
                      ).length
                    }{" "}
                    activități completate
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-800">
                    {child.total_points}
                  </div>
                  <div className="text-xs text-gray-600">puncte totale</div>
                </div>
                <button
                  onClick={() => onPayoutPoints(child.id)}
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors duration-200"
                  title="Plătește punctele (resetează la 0)"
                >
                  <DollarSign size={16} />
                </button>
                <button
                  onClick={() => onRemoveChild(child.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors duration-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activities Management */}
      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Gestionare Activități
          </h2>
          <button
            onClick={() => setShowAddActivity(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={16} />
            Adaugă Activitate
          </button>
        </div>

        {showAddActivity && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nume
                </label>
                <input
                  type="text"
                  value={newActivity.name}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Numele activității"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puncte
                </label>
                <input
                  type="number"
                  value={newActivity.points}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      points: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emoji
                </label>
                <select
                  value={newActivity.emoji}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, emoji: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {emojiOptions.map((emoji) => (
                    <option key={emoji} value={emoji}>
                      {emoji}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categorie
                </label>
                <select
                  value={newActivity.category}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descriere
              </label>
              <textarea
                value={newActivity.description}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descrierea activității (opțional)"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddActivity}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Adaugă Activitate
              </button>
              <button
                onClick={() => setShowAddActivity(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Anulează
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xl">{activity.emoji}</div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-blue-600">
                    +{activity.points} pts
                  </div>
                  <button
                    onClick={() => onRemoveActivity(activity.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">
                {activity.name}
              </h3>
              {activity.description && (
                <p className="text-sm text-gray-600 mb-2">
                  {activity.description}
                </p>
              )}
              <div className="text-xs text-gray-500 capitalize">
                {activity.category}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
