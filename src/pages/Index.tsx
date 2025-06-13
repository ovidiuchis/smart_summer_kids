import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import ChildSelector from "../components/ChildSelector";
import ChildDashboard from "../components/ChildDashboard";
import ParentDashboard from "../components/ParentDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData, Child } from "@/hooks/useSupabaseData";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    loading,
    children,
    activities,
    completedActivities,
    addChild,
    removeChild,
    addActivity,
    removeActivity,
    completeActivity,
    approveActivity,
    payoutPoints,
  } = useSupabaseData();

  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isParentMode, setIsParentMode] = useState(false);

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Se încarcă...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-600">Se încarcă datele...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleChildSelect = (child: Child) => {
    setSelectedChild(child);
    setIsParentMode(false);
  };

  const handleParentMode = () => {
    setIsParentMode(true);
    setSelectedChild(null);
  };

  const handleBack = () => {
    setSelectedChild(null);
    setIsParentMode(false);
  };

  const handleCompleteActivity = async (activityId: string) => {
    if (selectedChild) {
      await completeActivity(selectedChild.id, activityId);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Layout>
      {/* Sign out button */}
      {/* <div className="flex justify-end mb-4">
        <button
          onClick={handleSignOut}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          Deconectează-te
        </button>
      </div> */}

      {!selectedChild && !isParentMode && (
        <ChildSelector
          children={children}
          completedActivities={completedActivities}
          onChildSelect={handleChildSelect}
          onParentMode={handleParentMode}
        />
      )}

      {selectedChild && !isParentMode && (
        <ChildDashboard
          child={selectedChild}
          activities={activities}
          completedActivities={completedActivities}
          onBack={handleBack}
          onCompleteActivity={handleCompleteActivity}
        />
      )}

      {isParentMode && (
        <ParentDashboard
          children={children}
          activities={activities}
          completedActivities={completedActivities}
          onBack={handleBack}
          onAddChild={addChild}
          onRemoveChild={removeChild}
          onAddActivity={addActivity}
          onRemoveActivity={removeActivity}
          onApproveActivity={approveActivity}
          onPayoutPoints={payoutPoints}
          onSignOut={handleSignOut}
        />
      )}
    </Layout>
  );
};

export default Index;
