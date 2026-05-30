import { ReactNode, useState, useEffect } from "react";
import UniaoBagLogo from "./UniaoBagLogo";
import { 
  Building2, 
  LayoutDashboard, 
  PlusCircle, 
  TrendingUp, 
  Calendar, 
  FileBadge2, 
  ArrowLeft,
  ChevronRight,
  LogOut,
  Bell,
  Clock,
  User
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onExitWorkspace: () => void;
  userEmail: string;
  criticalCount: number;
}

export default function DashboardLayout({ 
  children, 
  activeTab, 
  setActiveTab, 
  onExitWorkspace, 
  userEmail,
  criticalCount 
}: DashboardLayoutProps) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: "dashboard", label: "Dashboard Executivo", icon: LayoutDashboard },
    { id: "cadastro", label: "Cadastro de Função Crítica", icon: PlusCircle },
    { id: "ranking", label: "Fichas & Vulnerabilidade", icon: TrendingUp },
    { id: "plano", label: "Planos de Ação (PDCA)", icon: Calendar },
    { id: "iso", label: "Evidências ISO 9001:2015", icon: FileBadge2 }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#04044A] flex flex-col md:flex-row font-sans relative overflow-hidden antialiased">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-white shrink-0 flex flex-col justify-between z-10">
        <div>
          {/* Logo Brand / Client */}
          <div className="p-5 border-b border-slate-100 flex items-center gap-3">
            <UniaoBagLogo className="w-9 h-9 shrink-0 text-[#000675]" onlyIcon={true} />
            <div>
              <h2 className="font-bold text-sm tracking-tight text-[#04044A] leading-tight">RJT NEXUS</h2>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">União Bag S/A</span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-4 space-y-1.5">
            <span className="block text-[9px] font-extrabold tracking-wider text-slate-400 uppercase px-3 mb-2">Workforce Governance</span>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-all cursor-pointer border-0 rounded ${
                    isActive 
                      ? "bg-[#000675] text-white shadow-none" 
                      : "text-slate-650 hover:text-[#000675] hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-450"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === "ranking" && criticalCount > 0 && (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white text-[#000675]' : 'bg-rose-50 border border-rose-100 text-rose-600'}`}>
                      {criticalCount}
                    </span>
                  )}
                  {item.id === "iso" && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${isActive ? 'bg-white text-[#000675]' : 'bg-[#00E7F8]/10 border border-[#00E7F8]/30 text-[#000675]'}`}>
                      ISO
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info block */}
        <div className="p-4 border-t border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#04044A] flex items-center justify-center text-xs font-bold text-white uppercase">
              {userEmail ? userEmail.charAt(0) : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate" title={userEmail}>
                {userEmail || "kaikoko9@gmail.com"}
              </p>
              <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">Gestor de Sucessão</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Building2 className="w-4 h-4 text-[#000675]" />
            <span>União Bag S/A</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-350" />
            <span className="text-[#04044A] capitalize font-extrabold">
              {menuItems.find(item => item.id === activeTab)?.label || activeTab}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* System Status badge / Notification */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-[#00E7F8]/10 text-[#04044A] text-[10px] font-bold rounded border border-[#00E7F8]/30 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A4FF] animate-ping"></span>
              <span>Qualidade ISO 9001:2015 Conforme</span>
            </div>

            {/* Time */}
            <div className="text-[10px] font-bold text-slate-600 hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
              <Clock className="w-3.5 h-3.5 text-[#00A4FF]" />
              <span>{currentTime} local</span>
            </div>

            {/* Notification triggers */}
            <div className="relative">
              <button className="text-slate-400 hover:text-[#000675] p-2 hover:bg-slate-50 rounded transition-colors cursor-pointer border-0">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              </button>
            </div>

            {/* System User tag */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden lg:inline">Conectado</span>
              <div className="w-2 h-2 rounded-full bg-[#00E7F8]"></div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE WORKSPACE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
