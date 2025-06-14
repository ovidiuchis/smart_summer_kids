import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import ChildSelector from "../components/ChildSelector";
import ChildDashboard from "../components/ChildDashboard";
import ParentDashboard from "../components/ParentDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData, Child } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";

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
    editActivity,
    editChild,
  } = useSupabaseData();

  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isParentMode, setIsParentMode] = useState(false);
  const [parentSecretPrompt, setParentSecretPrompt] = useState(false);
  const [parentSecretInput, setParentSecretInput] = useState("");
  const [parentSecretError, setParentSecretError] = useState("");
  const [nukeSecretPrompt, setNukeSecretPrompt] = useState(false);
  const [nukeSecretInput, setNukeSecretInput] = useState("");
  const [nukeSecretError, setNukeSecretError] = useState("");

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
    setParentSecretPrompt(true);
    setSelectedChild(null);
  };

  const handleParentSecretSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setParentSecretError("");
    // Fetch secret from user profile
    const { data, error } = await supabase
      .from("profiles")
      .select("secret")
      .eq("id", user.id)
      .single();
    if (error || !data) {
      setParentSecretError("Eroare la verificarea codului secret.");
      return;
    }
    if (data.secret === parentSecretInput) {
      setIsParentMode(true);
      setParentSecretPrompt(false);
      setParentSecretInput("");
    } else {
      setParentSecretError("Codul secret este incorect.");
    }
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

  // NUKE account handler
  const handleNukeAccount = async () => {
    setNukeSecretPrompt(true);
  };

  const handleNukeSecretSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNukeSecretError("");
    if (!user) return;
    // Fetch secret from user profile
    const { data, error } = await supabase
      .from("profiles")
      .select("secret")
      .eq("id", user.id)
      .single();
    if (error || !data) {
      setNukeSecretError("Eroare la verificarea codului secret.");
      return;
    }
    if (data.secret === nukeSecretInput) {
      // NUKE account logic
      // Delete all completed activities for user's children
      const { data: childrenData } = await supabase
        .from("children")
        .select("id")
        .eq("parent_id", user.id);
      const childIds = (childrenData || []).map((c: any) => c.id);
      if (childIds.length > 0) {
        await supabase
          .from("completed_activities")
          .delete()
          .in("child_id", childIds);
      }
      // Delete all children
      await supabase
        .from("children")
        .delete()
        .eq("parent_id", user.id);
      // Delete all activities
      await supabase
        .from("activities")
        .delete()
        .eq("parent_id", user.id);
      // Delete profile
      await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);
      await signOut();
      window.location.reload();
    } else {
      setNukeSecretError("Codul secret este incorect.");
    }
  };

  // Timeout fallback: if loading takes too long, force logout and redirect
  useEffect(() => {
    if (!loading && !authLoading && !user) return; // already handled
    const timeout = setTimeout(() => {
      if (loading || authLoading) {
        if (typeof window !== "undefined") {
          localStorage.clear();
          sessionStorage.clear();
        }
        if (signOut) signOut();
        window.location.href = "/auth";
      }
    }, 12000); // 12 seconds
    return () => clearTimeout(timeout);
  }, [loading, authLoading, user, signOut]);

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
          onEditActivity={editActivity}
          onEditChild={editChild}
          onNukeAccount={handleNukeAccount}
        />
      )}

      {parentSecretPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xs">
            <h2 className="text-xl font-bold mb-4">Acces părinte</h2>
            <form onSubmit={handleParentSecretSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="Cod părinte"
                value={parentSecretInput}
                onChange={(e) => setParentSecretInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              {parentSecretError && (
                <div className="text-red-600 text-sm">{parentSecretError}</div>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setParentSecretPrompt(false);
                    setParentSecretInput("");
                    setParentSecretError("");
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Continuă
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {nukeSecretPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xs">
            <h2 className="text-xl font-bold mb-4">Confirmare ștergere cont</h2>
            <p className="text-sm text-gray-600 mb-4">
              Introdu codul secret pentru a confirma ștergerea contului tău și a
              datelor asociate. Această acțiune este ireversibilă!
            </p>
            <form onSubmit={handleNukeSecretSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="Cod secret"
                value={nukeSecretInput}
                onChange={(e) => setNukeSecretInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              {nukeSecretError && (
                <div className="text-red-600 text-sm">{nukeSecretError}</div>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setNukeSecretPrompt(false);
                    setNukeSecretInput("");
                    setNukeSecretError("");
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Șterge contul
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Index;
