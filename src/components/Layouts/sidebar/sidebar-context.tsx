"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { createContext, useContext, useEffect, useState } from "react";

type SidebarState = "expanded" | "collapsed";

type SidebarContextType = {
  state: SidebarState;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  // Set initial state based on screen size
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
      setIsCollapsed(false);
    } else {
      setIsOpen(true);
      setIsCollapsed(false); // Start expanded on desktop
    }
  }, [isMobile]);

  function toggleSidebar() {
    setIsOpen((prev) => !prev);
  }

  function toggleCollapsed() {
    setIsCollapsed((prev) => !prev);
  }

  return (
    <SidebarContext.Provider
      value={{
        state: isOpen ? "expanded" : "collapsed",
        isOpen,
        setIsOpen,
        isMobile,
        toggleSidebar,
        isCollapsed,
        setIsCollapsed,
        toggleCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
