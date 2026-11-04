import React, { createContext, useContext, useState } from "react";

const PanelOpenContext = createContext(undefined);

export const usePanelOpen = () => {
  const context = useContext(PanelOpenContext);
  if (!context) {
    throw new Error("usePanelOpen must be used within a PanelOpenProvider");
  }
  return context;
};

export const PanelOpenProvider = ({ children }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  return (
    <PanelOpenContext.Provider value={{ isPanelOpen, setIsPanelOpen }}>
      {children}
    </PanelOpenContext.Provider>
  );
};
