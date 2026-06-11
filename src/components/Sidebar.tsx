import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Globe,
  Contact2,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRightLeft,
  Briefcase,
  Layers,
  ShoppingBag,
  FileSpreadsheet
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, category: "Main" },
    { id: "customers", label: "CRM Customers", icon: Users, category: "Customer Relations" },
    { id: "timeline", label: "Activity Logs", icon: Clock, category: "Customer Relations" },
    { id: "products", label: "Products Catalog", icon: Package, category: "Warehouse (WMS)" },
    { id: "categories", label: "Taxonomy & Categories", icon: Layers, category: "Warehouse (WMS)" },
    { id: "supplier", label: "Vendor Registry", icon: Contact2, category: "Warehouse (WMS)" },
    { id: "orders", label: "Sales Orders", icon: ShoppingBag, category: "ERP Operations" },
    { id: "employees", label: "Staff Directory", icon: Briefcase, category: "ERP Operations" },
    { id: "finance", label: "Financial Ledger", icon: TrendingUp, category: "ERP Operations" },
    { id: "analytics", label: "Business Analytics", icon: FolderTree, category: "Reports" },
    { id: "reports", label: "Cloud Exports", icon: FileSpreadsheet, category: "Reports" },
    { id: "settings", label: "Deploy & Settings", icon: Settings, category: "Preferences" },
  ];

  // Group items by category
  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  return (
    <div
      className={`h-screen sticky top-0 bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-all duration-300 z-10 ${
        isCollapsed ? "w-20" : "w-68"
      }`}
    >
      {/* BRAND HEADER */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E2E8F0] gap-2">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center font-bold text-white text-base">
                FH
              </div>
              <div>
                <h1 className="font-sans font-bold text-sm tracking-tight text-[#0F172A]">FashionHub</h1>
                <p className="font-mono text-[9px] text-[#2563EB] font-semibold tracking-widest uppercase">ERP &bull; CRM &bull; WMS</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 rounded-lg bg-[#2563EB] flex items-center justify-center font-bold text-white mx-auto text-sm">
              FH
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B]"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* LOGGED USER CARD */}
        <div className="p-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#E2E8F0] flex items-center justify-center font-bold text-[#2563EB] text-xs uppercase cursor-pointer">
              {user?.full_name[0] || "U"}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="font-medium text-xs text-[#0F172A] truncate">{user?.full_name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                  <span className="font-mono text-[10px] text-[#64748B] font-semibold tracking-wider uppercase">
                    {user?.role}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="py-4 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto px-2">
          {categories.map(categoryName => {
            const categoryItems = menuItems.filter(item => item.category === categoryName);
            return (
              <div key={categoryName} className="space-y-1">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold font-mono">
                    {categoryName}
                  </p>
                )}
                <div className="space-y-0.5">
                  {categoryItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left group ${
                          isActive
                            ? "bg-[#2563EB] text-white shadow-sm shadow-[#2563EB]/15 font-medium"
                            : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <Icon size={16} className={isActive ? "text-white" : "text-[#64748B] group-hover:text-[#0F172A]"} />
                        {!isCollapsed && <span className="text-xs tracking-tight">{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER & LOGOUT */}
      <div className="p-2 border-t border-[#E2E8F0]">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
            isCollapsed ? "justify-center" : ""
          } text-[#EF4444] hover:bg-[#EF4444]/5`}
        >
          <LogOut size={16} />
          {!isCollapsed && <span className="text-xs font-medium">Authentication Sign-Out</span>}
        </button>
      </div>
    </div>
  );
}
