import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { compressImage } from "@/lib/imageCompression";

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  avatar_url: string | null;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  parent_id: string;
  name: string;
  description: string | null;
  emoji: string;
  points: number;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompletedActivity {
  id: string;
  child_id: string;
  activity_id: string;
  completed_date: string;
  points_earned: number;
  approved_by_parent: boolean;
  created_at: string;
  child?: Child;
  activity?: Activity;
}

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [completedActivities, setCompletedActivities] = useState<
    CompletedActivity[]
  >([]);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch children
      const { data: childrenData, error: childrenError } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: true });

      if (childrenError) throw childrenError;
      setChildren(childrenData || []);

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("activities")
        .select("*")
        .eq("parent_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

      // Fetch completed activities with joined data
      const { data: completedData, error: completedError } = await supabase
        .from("completed_activities")
        .select(
          `
          *,
          child:children(*),
          activity:activities(*)
        `
        )
        .in(
          "child_id",
          (childrenData || []).map((child) => child.id)
        )
        .order("completed_date", { ascending: false });

      if (completedError) throw completedError;
      setCompletedActivities(completedData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Helper to upload avatar image to Supabase Storage
  const uploadAvatarImage = async (file: File, fileName: string) => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${fileName}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);
    return { publicUrl: publicUrlData.publicUrl, filePath };
  };

  const addChild = async (name: string, avatar: string | File) => {
    if (!user) return;
    let avatar_url: string | null = null;
    let tempFilePath: string | null = null;
    if (typeof avatar === "string" && avatar.startsWith("data:image")) {
      const res = await fetch(avatar);
      const blob = await res.blob();
      const file = new File([blob], `${name}_avatar.png`, { type: blob.type });
      const tempId = crypto.randomUUID();
      const uploadRes = await uploadAvatarImage(file, tempId);
      avatar_url = uploadRes.publicUrl;
      tempFilePath = uploadRes.filePath;
    } else if (avatar instanceof File) {
      const tempId = crypto.randomUUID();
      const uploadRes = await uploadAvatarImage(avatar, tempId);
      avatar_url = uploadRes.publicUrl;
      tempFilePath = uploadRes.filePath;
    }
    try {
      const { data, error } = await supabase
        .from("children")
        .insert([
          {
            parent_id: user.id,
            name,
            avatar_url,
            total_points: 0,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      // If we uploaded with a tempId, update to use the real id
      if (avatar_url && data && data.id && tempFilePath) {
        const ext = tempFilePath.split(".").pop();
        const oldPath = tempFilePath;
        const newPath = `${data.id}.${ext}`;
        await supabase.storage.from("avatars").move(oldPath, newPath);
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(newPath);
        await supabase
          .from("children")
          .update({ avatar_url: publicUrlData.publicUrl })
          .eq("id", data.id);
        data.avatar_url = publicUrlData.publicUrl;
      }
      setChildren((prev) => [...prev, data]);
      return data;
    } catch (error) {
      console.error("Error adding child:", error);
      throw error;
    }
  };

  const removeChild = async (childId: string) => {
    try {
      const { error } = await supabase
        .from("children")
        .delete()
        .eq("id", childId);

      if (error) throw error;
      setChildren((prev) => prev.filter((child) => child.id !== childId));
    } catch (error) {
      console.error("Error removing child:", error);
      throw error;
    }
  };

  const addActivity = async (activityData: {
    name: string;
    description: string;
    emoji: string;
    points: number;
    category: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("activities")
        .insert([
          {
            parent_id: user.id,
            ...activityData,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setActivities((prev) => [...prev, data]);
      return data;
    } catch (error) {
      console.error("Error adding activity:", error);
      throw error;
    }
  };

  const removeActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from("activities")
        .update({ is_active: false })
        .eq("id", activityId);

      if (error) throw error;
      setActivities((prev) =>
        prev.filter((activity) => activity.id !== activityId)
      );
    } catch (error) {
      console.error("Error removing activity:", error);
      throw error;
    }
  };

  const completeActivity = async (childId: string, activityId: string) => {
    try {
      const activity = activities.find((a) => a.id === activityId);
      if (!activity) return;

      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("completed_activities")
        .insert([
          {
            child_id: childId,
            activity_id: activityId,
            completed_date: today,
            points_earned: activity.points,
            approved_by_parent: false,
          },
        ])
        .select(
          `
          *,
          child:children(*),
          activity:activities(*)
        `
        )
        .single();

      if (error) throw error;
      setCompletedActivities((prev) => [...prev, data]);

      // Update child's total points locally
      setChildren((prev) =>
        prev.map((child) =>
          child.id === childId
            ? { ...child, total_points: child.total_points + activity.points }
            : child
        )
      );

      return data;
    } catch (error) {
      console.error("Error completing activity:", error);
      throw error;
    }
  };

  const approveActivity = async (completedActivityId: string) => {
    try {
      const { error } = await supabase
        .from("completed_activities")
        .update({ approved_by_parent: true })
        .eq("id", completedActivityId);

      if (error) throw error;

      setCompletedActivities((prev) =>
        prev.map((ca) =>
          ca.id === completedActivityId
            ? { ...ca, approved_by_parent: true }
            : ca
        )
      );
    } catch (error) {
      console.error("Error approving activity:", error);
      throw error;
    }
  };

  const payoutPoints = async (childId: string) => {
    try {
      const { error } = await supabase
        .from("children")
        .update({ total_points: 0, updated_at: new Date().toISOString() })
        .eq("id", childId);

      if (error) throw error;

      setChildren((prev) =>
        prev.map((child) =>
          child.id === childId ? { ...child, total_points: 0 } : child
        )
      );
    } catch (error) {
      console.error("Error paying out points:", error);
      throw error;
    }
  };

  const editActivity = async (activityData: {
    id: string;
    name: string;
    description: string;
    emoji: string;
    points: number;
    category: string;
  }) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("activities")
        .update({
          name: activityData.name,
          description: activityData.description,
          emoji: activityData.emoji,
          points: activityData.points,
          category: activityData.category,
        })
        .eq("id", activityData.id)
        .eq("parent_id", user.id)
        .select()
        .single();
      if (error) throw error;
      setActivities((prev) => prev.map((a) => (a.id === data.id ? data : a)));
      return data;
    } catch (error) {
      console.error("Error editing activity:", error);
      throw error;
    }
  };

  const editChild = async (childData: {
    id: string;
    name: string;
    avatar: string | File;
    currentAvatarUrl?: string | null;
  }) => {
    let avatar_url: string | undefined = undefined;
    let isAvatarChanged = false;
    let tempFilePath: string | null = null;
    if (typeof childData.avatar === "string") {
      if (childData.avatar.startsWith("data:image")) {
        // New image selected (base64)
        const res = await fetch(childData.avatar);
        const blob = await res.blob();
        let file = new File([blob], `${childData.name}_avatar.png`, {
          type: blob.type,
        });
        file = await compressImage(file, 1, 512);
        const uploadRes = await uploadAvatarImage(file, childData.id);
        avatar_url = uploadRes.publicUrl;
        tempFilePath = uploadRes.filePath;
        isAvatarChanged = true;
      }
    } else if (childData.avatar instanceof File) {
      // New image selected (File)
      const compressed = await compressImage(childData.avatar, 1, 512);
      const uploadRes = await uploadAvatarImage(compressed, childData.id);
      avatar_url = uploadRes.publicUrl;
      tempFilePath = uploadRes.filePath;
      isAvatarChanged = true;
    }
    // If not changed, do not include avatar_url in update
    const updateObj: any = {
      name: childData.name,
      updated_at: new Date().toISOString(),
    };
    if (isAvatarChanged) {
      updateObj.avatar_url = avatar_url;
    }
    try {
      const { data, error } = await supabase
        .from("children")
        .update(updateObj)
        .eq("id", childData.id)
        .select()
        .single();
      if (error) throw error;
      // If we uploaded with a temp path, move to correct id-based filename
      if (isAvatarChanged && avatar_url && tempFilePath) {
        const ext = tempFilePath.split(".").pop();
        const oldPath = tempFilePath;
        const newPath = `${childData.id}.${ext}`;
        await supabase.storage.from("avatars").move(oldPath, newPath);
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(newPath);
        await supabase
          .from("children")
          .update({ avatar_url: publicUrlData.publicUrl })
          .eq("id", childData.id);
        data.avatar_url = publicUrlData.publicUrl;
      }
      setChildren((prev) => prev.map((c) => (c.id === data.id ? data : c)));
      return data;
    } catch (error) {
      console.error("Error editing child:", error);
      throw error;
    }
  };

  const discardActivity = async (completedActivityId: string) => {
    try {
      const { error } = await supabase
        .from("completed_activities")
        .delete()
        .eq("id", completedActivityId);
      if (error) throw error;
      setCompletedActivities((prev) =>
        prev.filter((ca) => ca.id !== completedActivityId)
      );
    } catch (error) {
      console.error("Error discarding activity:", error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user) return;

    try {
      // Get all children for the user
      const { data: childrenData } = await supabase
        .from("children")
        .select("id")
        .eq("parent_id", user.id);

      const childIds = (childrenData || []).map((c: any) => c.id);

      // Delete all completed activities for user's children
      if (childIds.length > 0) {
        await supabase
          .from("completed_activities")
          .delete()
          .in("child_id", childIds);
      }

      // Delete all children
      await supabase.from("children").delete().eq("parent_id", user.id);

      // Delete all activities
      await supabase.from("activities").delete().eq("parent_id", user.id);

      // Delete profile
      await supabase.from("profiles").delete().eq("id", user.id);

      // Sign out user (auth cleanup will be handled by the Auth hook)
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };

  const updateAccountName = async (newName: string) => {
    if (!user || !newName.trim()) return;

    try {
      // Update profile in the profiles table
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: newName.trim() })
        .eq("id", user.id);

      if (error) throw error;

      // Also update the user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: newName.trim() },
      });

      if (authError) throw authError;
    } catch (error) {
      console.error("Error updating account name:", error);
      throw error;
    }
  };

  const updateParentSecret = async (newSecret: string) => {
    if (!user || !newSecret.trim()) return;

    try {
      // Update secret in the profiles table
      const { error } = await supabase
        .from("profiles")
        .update({ secret: newSecret.trim() })
        .eq("id", user.id);

      if (error) throw error;

      // Also update the user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { secret: newSecret.trim() },
      });

      if (authError) throw authError;
    } catch (error) {
      console.error("Error updating parent secret:", error);
      throw error;
    }
  };

  const getParentSecret = async (): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("secret")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data?.secret || null;
    } catch (error) {
      console.error("Error fetching parent secret:", error);
      throw error;
    }
  };

  return {
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
    discardActivity,
    refetch: fetchData,
    deleteAccount,
    updateAccountName,
    updateParentSecret,
    getParentSecret,
  };
};
