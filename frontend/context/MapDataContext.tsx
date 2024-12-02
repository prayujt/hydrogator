import React, { createContext, useContext, useState, useCallback } from "react";

const MapDataContext = createContext({
  shouldRefreshMap: false,
  triggerMapRefresh: () => {},
  resetMapRefresh: () => {},
});

export const MapDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [shouldRefreshMap, setShouldRefreshMap] = useState(false);

  const triggerMapRefresh = useCallback(() => {
    setShouldRefreshMap(true);
  }, []);

  const resetMapRefresh = useCallback(() => {
    setShouldRefreshMap(false);
  }, []);

  return (
    <MapDataContext.Provider
      value={{
        shouldRefreshMap,
        triggerMapRefresh,
        resetMapRefresh,
      }}
    >
      {children}
    </MapDataContext.Provider>
  );
};

export const useMapDataRefresh = () => useContext(MapDataContext);
