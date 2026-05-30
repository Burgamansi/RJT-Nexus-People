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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans relative overflow-hidden">
      
      {/* Background Decorative Blurs for Premium HR Workspace */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[140px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[140px] opacity-60"></div>
      </div>
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-white shadow-sm shrink-0 flex flex-col justify-between z-10">
        <div>
          {/* Logo Brand / Client */}
          <div className="p-5 border-b border-slate-100 flex items-center gap-3">
            <UniaoBagLogo className="w-9 h-9 shrink-0 text-indigo-600" onlyIcon={true} />
            <div>
              <h2 className="font-bold text-sm tracking-tight text-slate-900 leading-tight">RJT NEXUS</h2>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">União Bag S/A</span>
            </div>
          </div>

          {/* Quick exit to Landing page */}
          <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
            <button 
              onClick={onExitWorkspace}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-600 hover:text-indigo-600 hover:bg-white rounded-md transition-all font-semibold border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-indigo-500" />
              <span>Voltar para Landing</span>
            </button>
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" 
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-450"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === "ranking" && criticalCount > 0 && (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white text-indigo-600' : 'bg-rose-50 border border-rose-100 text-rose-600'}`}>
                      {criticalCount}
                    </span>
                  )}
                  {item.id === "iso" && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${isActive ? 'bg-white text-indigo-600' : 'bg-teal-50 border border-teal-100 text-teal-600'}`}>
                      ISO
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info block */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
              {userEmail ? userEmail.charAt(0) : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate" title={userEmail}>
                {userEmail || "kaikoko9@gmail.com"}
              </p>
              <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">Gestor de Sucessão</p>
            </div>
            <button 
              onClick={onExitWorkspace}
              title="Sair do Workspace"
              className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-white rounded-md transition-colors cursor-pointer border-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Building2 className="w-4 h-4 text-indigo-500" />
            <span>União Bag S/A</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 capitalize font-extrabold">
              {menuItems.find(item => item.id === activeTab)?.label || activeTab}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* System Status badge / Notification */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-md border border-teal-100 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping"></span>
              <span>Qualidade ISO 9001:2015 Conforme</span>
            </div>

            {/* Time */}
            <div className="text-[10px] font-bold text-slate-600 hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{currentTime} local</span>
            </div>

            {/* Notification triggers */}
            <div className="relative">
              <button className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border-0">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              </button>
            </div>

            {/* System User tag */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden lg:inline">Conectado</span>
              <div className="w-2 h-2 rounded-full bg-teal-500"></div>
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
