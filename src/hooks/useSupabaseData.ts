
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Child {
  id: string;
  name: string;
  avatar: string;
  total_points: number;
  parent_id: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  points: number;
  category: string;
  is_active: boolean;
  parent_id: string;
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
  activity?: Activity;
  child?: Child;
}

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [completedActivities, setCompletedActivities] = useState<CompletedActivity[]>([]);

  // Fetch all data
  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch children
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user.id)
        .order('name');

      if (childrenError) throw childrenError;
      setChildren(childrenData || []);

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('parent_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

      // Fetch completed activities
      const { data: completedData, error: completedError } = await supabase
        .from('completed_activities')
        .select(`
          *,
          activity:activities(*),
          child:children(*)
        `)
        .in('child_id', (childrenData || []).map(c => c.id))
        .order('completed_date', { ascending: false });

      if (completedError) throw completedError;
      setCompletedActivities(completedData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Eroare la încărcarea datelor",
        description: "Te rugăm să reîncerci.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add child
  const addChild = async (name: string, avatar: string = '👧') => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('children')
        .insert([{ 
          parent_id: user.id, 
          name, 
          avatar 
        }])
        .select()
        .single();

      if (error) throw error;
      
      setChildren(prev => [...prev, data]);
      toast({
        title: "Copil adăugat cu succes!",
        description: `${name} a fost adăugat în listă.`,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error adding child:', error);
      toast({
        title: "Eroare la adăugarea copilului",
        description: "Te rugăm să încerci din nou.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  // Remove child
  const removeChild = async (childId: string) => {
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId);

      if (error) throw error;
      
      setChildren(prev => prev.filter(c => c.id !== childId));
      toast({
        title: "Copil eliminat",
        description: "Copilul a fost eliminat din listă.",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error removing child:', error);
      toast({
        title: "Eroare la eliminarea copilului",
        description: "Te rugăm să încerci din nou.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  // Add activity
  const addActivity = async (activity: Omit<Activity, 'id' | 'parent_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([{ 
          ...activity,
          parent_id: user.id 
        }])
        .select()
        .single();

      if (error) throw error;
      
      setActivities(prev => [...prev, data]);
      toast({
        title: "Activitate adăugată cu succes!",
        description: `${activity.name} a fost adăugată în listă.`,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: "Eroare la adăugarea activității",
        description: "Te rugăm să încerci din nou.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  // Remove activity
  const removeActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({ is_active: false })
        .eq('id', activityId);

      if (error) throw error;
      
      setActivities(prev => prev.filter(a => a.id !== activityId));
      toast({
        title: "Activitate eliminată",
        description: "Activitatea a fost eliminată din listă.",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error removing activity:', error);
      toast({
        title: "Eroare la eliminarea activității",
        description: "Te rugăm să încerci din nou.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  // Complete activity
  const completeActivity = async (childId: string, activityId: string, date: string = new Date().toISOString().split('T')[0]) => {
    try {
      const activity = activities.find(a => a.id === activityId);
      if (!activity) throw new Error('Activity not found');

      const { data, error } = await supabase
        .from('completed_activities')
        .insert([{
          child_id: childId,
          activity_id: activityId,
          completed_date: date,
          points_earned: activity.points,
          approved_by_parent: false
        }])
        .select(`
          *,
          activity:activities(*),
          child:children(*)
        `)
        .single();

      if (error) throw error;
      
      setCompletedActivities(prev => [data, ...prev]);
      
      // Update child's total points in local state
      setChildren(prev => prev.map(child => 
        child.id === childId 
          ? { ...child, total_points: child.total_points + activity.points }
          : child
      ));

      toast({
        title: "Activitate completată! 🎉",
        description: `Ai câștigat ${activity.points} puncte pentru "${activity.name}"!`,
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error completing activity:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Activitate deja completată",
          description: "Această activitate a fost deja completată astăzi.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Eroare la completarea activității",
          description: "Te rugăm să încerci din nou.",
          variant: "destructive",
        });
      }
      return { success: false };
    }
  };

  // Approve completed activity
  const approveActivity = async (completedActivityId: string) => {
    try {
      const { error } = await supabase
        .from('completed_activities')
        .update({ approved_by_parent: true })
        .eq('id', completedActivityId);

      if (error) throw error;
      
      setCompletedActivities(prev => prev.map(ca => 
        ca.id === completedActivityId 
          ? { ...ca, approved_by_parent: true }
          : ca
      ));

      toast({
        title: "Activitate aprobată!",
        description: "Activitatea a fost aprobată cu succes.",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error approving activity:', error);
      toast({
        title: "Eroare la aprobarea activității",
        description: "Te rugăm să încerci din nou.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

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
    refreshData: fetchData
  };
};
