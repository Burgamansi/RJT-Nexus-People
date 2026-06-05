import React, { useState } from "react";
import { AppShell } from "./layout/AppShell";
import { RouteRenderer } from "./routes";

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");

  return (
    <AppShell currentTab={currentTab} onNavigate={(tab) => setCurrentTab(tab)}>
      <RouteRenderer currentTab={currentTab} onNavigate={(tab) => setCurrentTab(tab)} />
    </AppShell>
  );
};

export default App;
