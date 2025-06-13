
import React from 'react';
import Layout from '../components/Layout';
import ChildSelector from '../components/ChildSelector';
import ChildDashboard from '../components/ChildDashboard';
import ParentDashboard from '../components/ParentDashboard';
import { useAppState } from '../hooks/useAppState';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const {
    children,
    activities,
    selectedChild,
    setSelectedChild,
    isParentMode,
    setIsParentMode
  } = useAppState();

  const handleChildSelect = (child: any) => {
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

  const handleCompleteActivity = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity && selectedChild) {
      // In a real app, this would update the database
      console.log(`${selectedChild.name} completed: ${activity.name} (+${activity.points} points)`);
      
      toast({
        title: "Great job! 🎉",
        description: `You earned ${activity.points} points for "${activity.name}"!`,
      });
    }
  };

  return (
    <Layout>
      {!selectedChild && !isParentMode && (
        <ChildSelector
          children={children}
          onChildSelect={handleChildSelect}
          onParentMode={handleParentMode}
        />
      )}

      {selectedChild && !isParentMode && (
        <ChildDashboard
          child={selectedChild}
          activities={activities}
          onBack={handleBack}
          onCompleteActivity={handleCompleteActivity}
        />
      )}

      {isParentMode && (
        <ParentDashboard
          children={children}
          activities={activities}
          onBack={handleBack}
        />
      )}
    </Layout>
  );
};

export default Index;
