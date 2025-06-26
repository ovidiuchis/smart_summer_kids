import React, { useState } from "react";
import { Child, Activity, CompletedActivity } from "@/hooks/useSupabaseData";
import Header from "./Header";
import {
  Plus,
  Trash2,
  Check,
  DollarSign,
  Upload,
  Camera,
  Pencil,
} from "lucide-react";
import exampleActivities from "../../activitati.json";
import { compressImage } from "@/lib/imageCompression";
import { useFeatureHighlight } from "@/hooks/useFeatureHighlight";

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
  onEditActivity?: (activity: {
    id: string;
    name: string;
    description: string;
    emoji: string;
    points: number;
    category: string;
  }) => void;
  onEditChild?: (child: {
    id: string;
    name: string;
    avatar_url: string | null;
  }) => void;
  onNukeAccount?: () => void;
  familyName?: string;
  discardActivity: (completedActivityId: string) => Promise<void>;
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
  onEditActivity,
  onEditChild,
  onNukeAccount,
  familyName,
  discardActivity,
}) => {
  const { hasSeenFeature } = useFeatureHighlight();
  const showAccountFeatureHighlight = !hasSeenFeature("accountSection");

  const [showAddChild, setShowAddChild] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAvatar, setNewChildAvatar] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState({
    name: "",
    description: "",
    emoji: "⭐",
    points: 10,
    category: "general",
  });
  const [editActivity, setEditActivity] = useState<null | {
    id: string;
    name: string;
    description: string;
    emoji: string;
    points: number;
    category: string;
  }>(null);
  const [editChild, setEditChild] = useState<null | {
    id: string;
    name: string;
    avatar_url: string | null;
  }>(null);
  const [showPopulateExamples, setShowPopulateExamples] = useState(false);

  const totalPointsEarned = children.reduce(
    (sum, child) => sum + child.total_points,
    0
  );
  const totalActivitiesCompleted = completedActivities.length;
  const pendingApprovals = completedActivities.filter(
    (ca) => !ca.approved_by_parent
  );

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
      onAddChild(newChildName.trim(), newChildAvatar || "");
      setNewChildName("");
      setNewChildAvatar(null);
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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 1, 512);
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setNewChildAvatar(result);
        };
        reader.readAsDataURL(compressed);
      } catch (err) {
        alert("Imaginea este prea mare sau nu a putut fi procesată.");
      }
    }
  };

  const handlePopulateExamples = async () => {
    setShowPopulateExamples(true);
    for (const act of (exampleActivities as any[]).slice(0, 10)) {
      await onAddActivity({
        name: act.nume,
        description: act.descriere,
        emoji: act.emoji,
        points: act.puncte,
        category: act.categorie?.toLowerCase() || "general",
      });
    }
    setShowPopulateExamples(false);
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="👨‍👩‍👧‍👦 Panou părinte"
        subtitle="Gestionează copiii și activitățile"
        rightElement={
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              ← Înapoi
            </button>
          </div>
        }
        familyName={familyName}
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
          <div
            className={`text-2xl font-bold text-center ${
              totalPointsEarned >= 0 ? "text-gray-800" : "text-red-600"
            }`}
          >
            {totalPointsEarned >= 0 ? "+" : "−"}
            {Math.abs(totalPointsEarned)}
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Activități în așteptarea aprobării
            </h2>
            <button
              onClick={() => {
                pendingApprovals.forEach((ca) => onApproveActivity(ca.id));
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Aprobă toate
            </button>
          </div>
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
                  <div
                    className={`text-sm font-semibold ${
                      ca.points_earned >= 0 ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    {ca.points_earned >= 0 ? "+" : "−"}
                    {Math.abs(ca.points_earned)} puncte
                  </div>
                  <button
                    onClick={() => onApproveActivity(ca.id)}
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors duration-200"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => discardActivity(ca.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors duration-200 ml-2"
                    title="Renunță la activitate"
                  >
                    <Trash2 size={16} />
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
                {newChildAvatar && (
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
                  {child.avatar_url ? (
                    <img
                      src={child.avatar_url}
                      alt={child.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <span className="text-2xl">{child.name[0]}</span>
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
                  <div
                    className={`text-xl font-bold ${
                      child.total_points >= 0 ? "text-gray-800" : "text-red-600"
                    }`}
                  >
                    {child.total_points >= 0 ? "+" : "−"}
                    {Math.abs(child.total_points)}
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
                <button
                  onClick={() =>
                    setEditChild({
                      id: child.id,
                      name: child.name,
                      avatar_url: child.avatar_url,
                    })
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors ml-1"
                >
                  <Pencil size={16} />
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

        {/* Show populate example activities option - vizibil doar dacă nu există activități */}
        {activities.length === 0 && (
          <div className="flex justify-center mt-2 mb-6">
            <button
              onClick={handlePopulateExamples}
              disabled={showPopulateExamples}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow disabled:opacity-60"
            >
              {showPopulateExamples
                ? "Se populează..."
                : "Populează cu 10 activități exemplu"}
            </button>
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
                  <div
                    className={`text-sm font-semibold ${
                      activity.points >= 0 ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    {activity.points >= 0 ? "+" : ""}
                    {activity.points} pts
                  </div>
                  <button
                    onClick={() => onRemoveActivity(activity.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                  <button
                    onClick={() => setEditActivity({ ...activity })}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded transition-colors ml-1"
                  >
                    <Pencil size={12} />
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
      {/* Edit Activity Modal */}
      {editActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editează activitatea</h2>
            <div className="space-y-4">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Nume activitate"
                value={editActivity.name}
                onChange={(e) =>
                  setEditActivity({ ...editActivity, name: e.target.value })
                }
              />
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Descriere (opțional)"
                value={editActivity.description}
                onChange={(e) =>
                  setEditActivity({
                    ...editActivity,
                    description: e.target.value,
                  })
                }
              />
              <div className="flex gap-2 items-center">
                <label className="font-medium">Emoji:</label>
                <select
                  className="border border-gray-300 rounded-lg px-2 py-1"
                  value={editActivity.emoji}
                  onChange={(e) =>
                    setEditActivity({ ...editActivity, emoji: e.target.value })
                  }
                >
                  {emojiOptions.map((emoji) => (
                    <option key={emoji} value={emoji}>
                      {emoji}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <label className="font-medium">Puncte:</label>
                <input
                  type="number"
                  className="border border-gray-300 rounded-lg px-2 py-1 w-24"
                  value={editActivity.points}
                  onChange={(e) =>
                    setEditActivity({
                      ...editActivity,
                      points: Number(e.target.value),
                    })
                  }
                  min={1}
                />
              </div>
              <div className="flex gap-2 items-center">
                <label className="font-medium">Categorie:</label>
                <select
                  className="border border-gray-300 rounded-lg px-2 py-1"
                  value={editActivity.category}
                  onChange={(e) =>
                    setEditActivity({
                      ...editActivity,
                      category: e.target.value,
                    })
                  }
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6 justify-end">
              <button
                onClick={() => setEditActivity(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Anulează
              </button>
              <button
                onClick={() => {
                  if (onEditActivity) onEditActivity(editActivity);
                  setEditActivity(null);
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Child Modal */}
      {editChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editează copilul</h2>
            <div className="space-y-4">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Nume copil"
                value={editChild.name}
                onChange={(e) =>
                  setEditChild({ ...editChild, name: e.target.value })
                }
              />
              <div className="flex gap-2 items-center">
                <label className="font-medium">Avatar:</label>
                <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition-colors">
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const compressed = await compressImage(file, 1, 512);
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const result = ev.target?.result as string;
                            setEditChild((editChild) =>
                              editChild
                                ? { ...editChild, avatar_url: result }
                                : null
                            );
                          };
                          reader.readAsDataURL(compressed);
                        } catch (err) {
                          alert(
                            "Imaginea este prea mare sau nu a putut fi procesată."
                          );
                        }
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              {editChild.avatar_url && (
                <div className="mt-2">
                  <img
                    src={editChild.avatar_url}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6 justify-end">
              <button
                onClick={() => setEditChild(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Anulează
              </button>
              <button
                onClick={() => {
                  if (onEditChild) onEditChild(editChild);
                  setEditChild(null);
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Action buttons at the end of the page, not floating */}
      {(onSignOut || onNukeAccount) && (
        <div className="flex flex-row gap-3 items-center justify-center mt-12 mb-6 w-full">
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-lg font-medium shadow-lg transition-colors duration-200 min-w-[180px] text-center"
            >
              Deconectează-te
            </button>
          )}
          {onNukeAccount && (
            <button
              onClick={onNukeAccount}
              className={`bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-lg font-medium shadow-lg transition-colors duration-200 min-w-[200px] text-center relative
                ${showAccountFeatureHighlight ? "feature-highlight" : ""}`}
            >
              Date cont
              {showAccountFeatureHighlight && (
                <span className="absolute -top-2 -right-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                  Nou
                </span>
              )}
            </button>
          )}
        </div>
      )}{" "}
      <div className="text-center text-xs mt-8">
        <a
          href="https://ovidiuchis.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#eec213] hover:text-amber-500 transition-colors"
        >
          by O
        </a>
      </div>
    </div>
  );
};

export default ParentDashboard;
