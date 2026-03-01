import { createContext, useContext, useState } from "react";

const LiveContext = createContext(null);

export function LiveProvider({ children }) {
  const [isLive, setIsLive] = useState(true); // LIVE par défaut

  const toggleLive = () => {
    setIsLive((prev) => !prev);
  };

  return (
    <LiveContext.Provider value={{ isLive, setIsLive, toggleLive }}>
      {children}
    </LiveContext.Provider>
  );
}

export function useLive() {
  const context = useContext(LiveContext);
  if (!context) {
    throw new Error("useLive must be used within LiveProvider");
  }
  return context;
}
