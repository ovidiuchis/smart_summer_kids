
import { useState } from 'react';

export interface Child {
  id: string;
  name: string;
  avatar: string;
  points: number;
  completedActivities: string[];
}

export interface Activity {
  id: string;
  name: string;
  emoji: string;
  points: number;
  description: string;
  category: 'reading' | 'chores' | 'helping' | 'exercise' | 'learning';
}

export const useAppState = () => {
  const [children] = useState<Child[]>([
    {
      id: '1',
      name: 'Emma',
      avatar: '👧',
      points: 85,
      completedActivities: ['1', '3']
    },
    {
      id: '2',
      name: 'Alex',
      avatar: '👦',
      points: 92,
      completedActivities: ['2', '4']
    },
    {
      id: '3',
      name: 'Sam',
      avatar: '🧒',
      points: 67,
      completedActivities: ['1', '5']
    }
  ]);

  const [activities] = useState<Activity[]>([
    {
      id: '1',
      name: 'Read for 20 minutes',
      emoji: '📚',
      points: 10,
      description: 'Read any book for 20 minutes',
      category: 'reading'
    },
    {
      id: '2',
      name: 'Clean bedroom',
      emoji: '🛏️',
      points: 15,
      description: 'Make bed and tidy up room',
      category: 'chores'
    },
    {
      id: '3',
      name: 'Help with dishes',
      emoji: '🍽️',
      points: 12,
      description: 'Load or unload dishwasher',
      category: 'helping'
    },
    {
      id: '4',
      name: 'Exercise outdoors',
      emoji: '🏃',
      points: 15,
      description: 'Play outside for 30 minutes',
      category: 'exercise'
    },
    {
      id: '5',
      name: 'Practice math',
      emoji: '🔢',
      points: 12,
      description: 'Complete math worksheets',
      category: 'learning'
    },
    {
      id: '6',
      name: 'Help cook dinner',
      emoji: '👨‍🍳',
      points: 18,
      description: 'Assist with meal preparation',
      category: 'helping'
    }
  ]);

  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isParentMode, setIsParentMode] = useState(false);

  return {
    children,
    activities,
    selectedChild,
    setSelectedChild,
    isParentMode,
    setIsParentMode
  };
};
