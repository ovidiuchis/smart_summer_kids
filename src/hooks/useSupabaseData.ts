
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  avatar: string;
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
  const [completedActivities, setCompletedActivities] = useState<CompletedActivity[]>([]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Fetch children
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true });

      if (childrenError) throw childrenError;
      setChildren(childrenData || []);

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('parent_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

      // Fetch completed activities with joined data
      const { data: completedData, error: completedError } = await supabase
        .from('completed_activities')
        .select(`
          *,
          child:children(*),
          activity:activities(*)
        `)
        .in('child_id', (childrenData || []).map(child => child.id))
        .order('completed_date', { ascending: false });

      if (completedError) throw completedError;
      setCompletedActivities(completedData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const addChild = async (name: string, avatar: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('children')
        .insert([{
          parent_id: user.id,
          name,
          avatar,
          total_points: 0
        }])
        .select()
        .single();

      if (error) throw error;
      setChildren(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding child:', error);
      throw error;
    }
  };

  const removeChild = async (childId: string) => {
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId);

      if (error) throw error;
      setChildren(prev => prev.filter(child => child.id !== childId));
    } catch (error) {
      console.error('Error removing child:', error);
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
        .from('activities')
        .insert([{
          parent_id: user.id,
          ...activityData,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      setActivities(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
  };

  const removeActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({ is_active: false })
        .eq('id', activityId);

      if (error) throw error;
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
    } catch (error) {
      console.error('Error removing activity:', error);
      throw error;
    }
  };

  const completeActivity = async (childId: string, activityId: string) => {
    try {
      const activity = activities.find(a => a.id === activityId);
      if (!activity) return;

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('completed_activities')
        .insert([{
          child_id: childId,
          activity_id: activityId,
          completed_date: today,
          points_earned: activity.points,
          approved_by_parent: false
        }])
        .select(`
          *,
          child:children(*),
          activity:activities(*)
        `)
        .single();

      if (error) throw error;
      setCompletedActivities(prev => [...prev, data]);
      
      // Update child's total points locally
      setChildren(prev => prev.map(child => 
        child.id === childId 
          ? { ...child, total_points: child.total_points + activity.points }
          : child
      ));

      return data;
    } catch (error) {
      console.error('Error completing activity:', error);
      throw error;
    }
  };

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
    } catch (error) {
      console.error('Error approving activity:', error);
      throw error;
    }
  };

  const payoutPoints = async (childId: string) => {
    try {
      const { error } = await supabase
        .from('children')
        .update({ total_points: 0, updated_at: new Date().toISOString() })
        .eq('id', childId);

      if (error) throw error;
      
      setChildren(prev => prev.map(child => 
        child.id === childId 
          ? { ...child, total_points: 0 }
          : child
      ));
    } catch (error) {
      console.error('Error paying out points:', error);
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
    refetch: fetchData
  };
};
