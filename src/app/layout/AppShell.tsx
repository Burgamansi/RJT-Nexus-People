import React from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ currentTab, onNavigate, children }) => {
  return (
    <div className="flex min-h-screen overflow-hidden" style={{ background: "#060609", color: "#f1f5f9" }}>
      <Sidebar currentTab={currentTab} onNavigate={onNavigate} />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Topbar currentTab={currentTab} />
        <main
          className="flex-1 overflow-y-auto p-8"
          style={{ background: "linear-gradient(160deg, #08080F 0%, #060609 60%, #08060E 100%)" }}
        >
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
