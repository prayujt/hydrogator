import React, { createContext, useContext, useState, useCallback } from "react";

const ReviewContext = createContext({
  shouldRefreshReview: false,
  triggerReviewRefresh: () => {},
  resetReviewRefresh: () => {},
});

export const ReviewProvider = ({ children }: { children: React.ReactNode }) => {
  const [shouldRefreshReview, setShouldRefreshReview] = useState(false);

  const triggerReviewRefresh = useCallback(() => {
    setShouldRefreshReview(true);
  }, []);

  const resetReviewRefresh = useCallback(() => {
    setShouldRefreshReview(false);
  }, []);

  return (
    <ReviewContext.Provider
      value={{
        shouldRefreshReview,
        triggerReviewRefresh,
        resetReviewRefresh,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviewRefresh = () => useContext(ReviewContext);
