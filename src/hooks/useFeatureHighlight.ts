import { useState, useEffect } from "react";

// Features that can be highlighted
export type FeatureKey = "accountSection" | "partialPayout";

// Hook to track which features have been seen by the user
export const useFeatureHighlight = () => {
  const [seenFeatures, setSeenFeatures] = useState<Record<FeatureKey, boolean>>(
    {} as Record<FeatureKey, boolean>
  );

  // Load seen features from localStorage on mount
  useEffect(() => {
    try {
      const storedFeatures = localStorage.getItem("seenFeatures");
      if (storedFeatures) {
        setSeenFeatures(JSON.parse(storedFeatures));
      }
    } catch (error) {
      console.error("Failed to load seen features from localStorage", error);
    }
  }, []);

  // Check if a specific feature has been seen
  const hasSeenFeature = (feature: FeatureKey) => {
    return seenFeatures[feature] === true;
  };

  // Mark a feature as seen
  const markFeatureSeen = (feature: FeatureKey) => {
    const updatedFeatures = {
      ...seenFeatures,
      [feature]: true,
    };
    setSeenFeatures(updatedFeatures);
    try {
      localStorage.setItem("seenFeatures", JSON.stringify(updatedFeatures));
    } catch (error) {
      console.error("Failed to save seen features to localStorage", error);
    }
  };

  return { hasSeenFeature, markFeatureSeen };
};
