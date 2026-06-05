import React from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Breadcrumbs } from "./Breadcrumbs";
import { RJT_COLORS } from "../../styles/rjtColors";

interface AppShellProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ currentTab, onNavigate, children }) => {
  return (
    <div className="rjt-executive-theme flex min-h-screen overflow-hidden" style={{ backgroundColor: RJT_COLORS.neutral.lightGray, color: RJT_COLORS.neutral.darkGray }}>
      <Sidebar currentTab={currentTab} onNavigate={onNavigate} />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Topbar currentTab={currentTab} />
        <main
          className="flex-1 overflow-y-auto p-5 md:p-8"
          style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #F4F7FB 42%, #EEF3F8 100%)" }}
        >
          <div className="max-w-[1480px] mx-auto animate-fade-in">
            <Breadcrumbs currentTab={currentTab} onNavigate={onNavigate} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
