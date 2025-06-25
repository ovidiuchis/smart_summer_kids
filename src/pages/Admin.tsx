import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useFeatureHighlight } from "@/hooks/useFeatureHighlight";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const {
    deleteAccount,
    updateAccountName,
    updateParentSecret,
    getParentSecret,
  } = useSupabaseData();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

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

  const [familyName, setFamilyName] = useState(
    user?.user_metadata?.full_name || ""
  );
  const [parentSecret, setParentSecret] = useState("");
  const [newParentSecret, setNewParentSecret] = useState("");
  const [confirmParentSecret, setConfirmParentSecret] = useState("");
  const [secretError, setSecretError] = useState("");
  const [showCurrentSecret, setShowCurrentSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingSecret, setIsUpdatingSecret] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { markFeatureSeen } = useFeatureHighlight();

  useEffect(() => {
    // Set page title
    document.title = "Date Cont - Super Vara";

    // Mark the account section feature as seen when the user visits this page
    markFeatureSeen("accountSection");

    // Load initial profile data
    const fetchProfileData = async () => {
      if (user) {
        try {
          // Fetch name
          const { data, error } = await supabase
            .from("profiles")
            .select("full_name, secret")
            .eq("id", user.id)
            .single();

          if (!error && data) {
            if (data.full_name) {
              setFamilyName(data.full_name);
            }
            if (data.secret) {
              setParentSecret(data.secret);
            }
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      }
    };

    fetchProfileData();

    // Cleanup when leaving the page
    return () => {
      document.title = "Super Vara - activități pentru copii";
    };
  }, [user]);

  const handleUpdateName = async () => {
    setIsLoading(true);
    try {
      await updateAccountName(familyName);
      toast({
        title: "Nume actualizat",
        description: "Numele familiei a fost actualizat cu succes.",
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu am putut actualiza numele. Încercați din nou.",
        variant: "destructive",
      });
      console.error("Error updating name:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSecret = async () => {
    setSecretError("");

    if (newParentSecret !== confirmParentSecret) {
      setSecretError("Codurile secrete nu se potrivesc.");
      return;
    }

    if (newParentSecret.length < 4) {
      setSecretError("Codul secret trebuie să aibă cel puțin 4 caractere.");
      return;
    }

    setIsUpdatingSecret(true);
    try {
      await updateParentSecret(newParentSecret);
      toast({
        title: "Cod secret actualizat",
        description: "Codul secret de părinte a fost actualizat cu succes.",
      });
      setParentSecret(newParentSecret);
      setNewParentSecret("");
      setConfirmParentSecret("");
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu am putut actualiza codul secret. Încercați din nou.",
        variant: "destructive",
      });
      console.error("Error updating parent secret:", error);
    } finally {
      setIsUpdatingSecret(false);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteDialog(false); // Hide the dialog
    setIsDeletingAccount(true);
    try {
      await deleteAccount();
      toast({
        title: "Cont șters",
        description: "Contul și toate datele asociate au fost șterse.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu am putut șterge contul. Încercați din nou.",
        variant: "destructive",
      });
      console.error("Error deleting account:", error);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <Layout>
      {" "}
      <div className="max-w-3xl mx-auto py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
            🧑‍💼 Administrare Cont
          </h1>
          <p className="text-xl text-gray-600 mb-4 text-center">
            Actualizează informațiile contului tău
          </p>
          <div className="flex justify-center mb-6">
            <button
              onClick={() => navigate("/")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              ← Înapoi la tabloul de bord
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Informații Cont
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="text"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  readOnly
                />
                <p className="text-sm text-gray-500 mt-1">
                  Adresa de email nu poate fi modificată.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numele Familiei
                </label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Introduceți numele familiei"
                />
              </div>

              <button
                onClick={handleUpdateName}
                disabled={isLoading || !familyName.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                {isLoading ? "Se actualizează..." : "Actualizează numele"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Cod Secret Părinte
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cod Secret Actual
                </label>
                <div className="relative">
                  <input
                    type={showCurrentSecret ? "text" : "password"}
                    value={parentSecret}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    readOnly
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-500 hover:text-blue-700"
                    onClick={() => setShowCurrentSecret(!showCurrentSecret)}
                  >
                    {showCurrentSecret ? "Ascunde" : "Arată"}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Acesta este codul secret folosit pentru accesul la panoul de
                  părinte.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cod Secret Nou
                </label>
                <input
                  type="password"
                  value={newParentSecret}
                  onChange={(e) => setNewParentSecret(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Introduceți noul cod secret"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmă Codul Secret Nou
                </label>
                <input
                  type="password"
                  value={confirmParentSecret}
                  onChange={(e) => setConfirmParentSecret(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirmați noul cod secret"
                />
                {secretError && (
                  <p className="text-sm text-red-500 mt-1">{secretError}</p>
                )}
              </div>

              <button
                onClick={handleUpdateSecret}
                disabled={
                  isUpdatingSecret ||
                  !newParentSecret.trim() ||
                  !confirmParentSecret.trim()
                }
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                {isUpdatingSecret
                  ? "Se actualizează..."
                  : "Actualizează codul secret"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-red-600">
                Zona Periculoasă
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-gray-700">
                  Ștergerea contului va elimina definitiv toate datele asociate,
                  inclusiv copiii, activitățile și punctele acumulate. Această
                  acțiune nu poate fi anulată.
                </p>
              </div>

              <button
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeletingAccount}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                {isDeletingAccount ? "Se șterge..." : "Șterge tot contul"}
              </button>
            </div>
          </div>
        </div>

        {showDeleteDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                Confirmare ștergere cont
              </h2>
              <div className="space-y-4">
                <p className="text-red-600 font-semibold">
                  ATENȚIE! Această acțiune va șterge definitiv contul și toate
                  datele asociate!
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Toți copiii vor fi șterși definitiv</li>
                  <li>Toate activitățile vor fi șterse definitiv</li>
                  <li>Toate punctele acumulate vor fi pierdute</li>
                  <li>Profilul contului va fi șters complet</li>
                </ul>
                <p className="font-medium">
                  Această acțiune nu poate fi anulată și nu există posibilitatea
                  de recuperare ulterioară!
                </p>
              </div>
              <div className="flex gap-2 mt-6 justify-end">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Nu, păstrează contul
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Da, șterge definitiv contul
                </button>
              </div>
            </div>
          </div>
        )}

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
    </Layout>
  );
}
