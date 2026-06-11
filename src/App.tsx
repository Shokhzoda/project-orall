import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import AuthPages from "./components/AuthPages";
import DashboardView from "./components/DashboardView";
import CrmView from "./components/CrmView";
import WmsView from "./components/WmsView";
import SuppliersView from "./components/SuppliersView";
import OrdersView from "./components/OrdersView";
import EmployeesView from "./components/EmployeesView";
import FinanceView from "./components/FinanceView";
import AnalyticsView from "./components/AnalyticsView";
import ReportsView from "./components/ReportsView";
import SettingsView from "./components/SettingsView";
import {
  LayoutDashboard,
  Users,
  Box,
  Truck,
  ShoppingCart,
  Contact,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Coins,
  RefreshCw
} from "lucide-react";
import { Product, Customer, Supplier, Order, Employee, Transaction } from "./types";

export default function App() {
  const { user, isAuthenticated, logout, apiFetch } = useAuth();

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "crm" | "wms" | "suppliers" | "orders" | "employees" | "finance" | "analytics" | "reports" | "settings"
  >("dashboard");

  // Global ERP Shared State
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; description: string }[]>([]);

  // Page Indicators
  const [loadingState, setLoadingState] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Sync Loader function
  const fetchAllStates = async () => {
    if (!isAuthenticated) return;
    setLoadingState(true);
    try {
      const [p, c, s, o, e, t, cat] = await Promise.all([
        apiFetch("/api/wms/products"),
        apiFetch("/api/crm/customers"),
        apiFetch("/api/wms/suppliers"),
        apiFetch("/api/orders"),
        apiFetch("/api/erp/employees"),
        apiFetch("/api/erp/transactions"),
        apiFetch("/api/wms/categories")
      ]);

      setProducts(p || []);
      setCustomers(c || []);
      setSuppliers(s || []);
      setOrders(o || []);
      setEmployees(e || []);
      setTransactions(t || []);
      setCategories(cat || []);
    } catch (err) {
      console.error("Critical State Load Intercept:", err);
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllStates();
    }
  }, [isAuthenticated]);

  // If not authenticated, render login panel
  if (!isAuthenticated) {
    return <AuthPages />;
  }

  // Dashboard Aggregates Helper Computations
  const totalWmsValuation = products.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);
  const totalClientsCount = customers.length;
  const processedOrdersCount = orders.filter(o => o.status === "Completed").length;
  const lowStockApparelAlerts = products.filter(p => p.quantity <= 15);

  const outstandingRevenues = orders
    .filter(o => o.payment_status === "Unpaid")
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-[#0F172A] selection:bg-[#2563EB]/10">
      {/* SIDEBAR NAVIGATION COLUMN */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-[#0B0F19] text-slate-350 border-r border-[#151D30] w-64 p-5 flex flex-col justify-between transition-transform duration-300 xl:translate-x-0 xl:static xl:flex shrink-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 border-b border-[#151D30] pb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] flex items-center justify-center font-bold text-white text-sm shadow-md shadow-[#2563EB]/25">
              FH
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white block">FashionHub</h1>
              <span className="text-[10px] text-slate-400 block font-semibold">Tizim boshqaruvi (ERP)</span>
            </div>
          </div>

          {/* Sourcing Menu list */}
          <nav className="space-y-1 text-slate-400">
            <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-slate-500 block px-3.5 mb-2">
              Tijorat operatsiyalari
            </span>
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all select-none cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-[#2563EB] text-white shadow-sm font-bold"
                  : "hover:bg-[#151D30] hover:text-white"
              }`}
            >
              <LayoutDashboard size={14} /> Tizim sharhi (Daxshbord)
            </button>
            <button
              onClick={() => {
                setActiveTab("crm");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all select-none cursor-pointer ${
                activeTab === "crm"
                  ? "bg-[#2563EB] text-white shadow-sm font-bold"
                  : "hover:bg-[#151D30] hover:text-white"
              }`}
            >
              <Users size={14} /> Ulgurji mijozlar (CRM)
            </button>
            <button
              onClick={() => {
                setActiveTab("wms");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all select-none cursor-pointer ${
                activeTab === "wms"
                  ? "bg-[#2563EB] text-white shadow-sm font-bold"
                  : "hover:bg-[#151D30] hover:text-white"
              }`}
            >
              <Box size={14} /> Ombor va qoldiqlar (WMS)
            </button>
            <button
              onClick={() => {
                setActiveTab("suppliers");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all select-none cursor-pointer ${
                activeTab === "suppliers"
                  ? "bg-[#2563EB] text-white shadow-sm font-bold"
                  : "hover:bg-[#151D30] hover:text-white"
              }`}
            >
              <Truck size={14} /> Ta'minotchilar va xaridlar
            </button>
            <button
              onClick={() => {
                setActiveTab("orders");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all select-none cursor-pointer ${
                activeTab === "orders"
                  ? "bg-[#2563EB] text-white shadow-sm font-bold"
                  : "hover:bg-[#151D30] hover:text-white"
              }`}
            >
              <ShoppingCart size={14} /> Sotuv va ulgurji buyurtmalar
            </button>

            <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-slate-500 block px-3.5 pt-4 mb-2">
              Korxona tahlili &amp; Moliyalar
            </span>
            <button
              onClick={() => {
                setActiveTab("employees");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all select-none cursor-pointer ${
                activeTab === "employees"
                  ? "bg-[#2563EB] text-white shadow-sm font-bold"
                  : "hover:bg-[#151D30] hover:text-white"
              }`}
            >
              <Contact size={14} /> Xodimlar va HR bo'limi
            </button>
            <button
              onClick={() => {
                setActiveTab("finance");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all select-none cursor-pointer ${
                activeTab === "finance"
                  ? "bg-[#2563EB] text-white shadow-sm font-bold"
                  : "hover:bg-[#151D30] hover:text-white"
              }`}
            >
              <Coins size={14} /> Moliyaviy balans (Ledger)
            </button>
            <button
              onClick={() => {
                setActiveTab("analytics");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all select-none cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-[#2563EB] text-white shadow-sm font-bold"
                  : "hover:bg-[#151D30] hover:text-white"
              }`}
            >
              <TrendingUp size={14} /> Biznes tahlili (Analitika)
            </button>
            <button
              onClick={() => {
                setActiveTab("reports");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all select-none cursor-pointer ${
                activeTab === "reports"
                  ? "bg-[#2563EB] text-white shadow-sm font-bold"
                  : "hover:bg-[#151D30] hover:text-white"
              }`}
            >
              <FileSpreadsheet size={14} /> Hisobotlar va auditlar
            </button>
            <button
              onClick={() => {
                setActiveTab("settings");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all select-none cursor-pointer ${
                activeTab === "settings"
                  ? "bg-[#2563EB] text-white shadow-sm font-bold"
                  : "hover:bg-[#151D30] hover:text-white"
              }`}
            >
              <Settings size={14} /> Tizim sozlamalari
            </button>
          </nav>
        </div>

        {/* User context cards column bottom */}
        <div className="border-t border-[#151D30] pt-4 mt-6 text-xs text-slate-350 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white uppercase text-[10px] border border-slate-700">
              {user?.username?.slice(0, 2) || "U"}
            </div>
            <div className="truncate">
              <p className="font-bold text-[#f8fafc] text-[11px] leading-tight truncate">{user?.username}</p>
              <span className="text-[9px] uppercase font-bold text-[#60A5FA] mt-0.5 block">
                {user?.role === "Admin" ? "Administrator" : user?.role === "Manager" ? "Menejer" : "Xodim"} huquqi
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-red-400 font-bold hover:bg-red-500/10 cursor-pointer select-none transition-all"
          >
            <LogOut size={13} /> Tizimdan chiqish
          </button>
        </div>
      </aside>

      {/* MOBILE NAV OVERLAYS */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs z-30 xl:hidden"
        />
      )}

      {/* DASHBOARD CONTENT BODY ROUTE WRAPPER */}
      <main className="flex-1 overflow-y-auto min-h-screen px-4 py-6 md:px-8 space-y-6">
        {/* NAV HEADER BAR */}
        <header className="flex justify-between items-center bg-white border border-[#E2E8F0] px-5 py-4 rounded-2xl shadow-xs print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="xl:hidden p-1.5 hover:bg-[#F1F5F9] rounded text-slate-600"
            >
              <Menu size={18} />
            </button>
            <div className="space-y-0.5">
              <h2 className="font-sans font-bold text-sm tracking-tight text-slate-800">
                {activeTab === 'dashboard' ? 'Tizim sharhi' : activeTab === 'crm' ? 'Ulgurji mijozlar (CRM)' : activeTab === 'wms' ? 'Ombor va qoldiqlar (WMS)' : activeTab === 'suppliers' ? 'Ta\'minotchilar reyestri' : activeTab === 'orders' ? 'Sotuv va ulgurji buyurtmalar' : activeTab === 'employees' ? 'Xodimlar va HR bo\'limi' : activeTab === 'finance' ? 'Moliyaviy balans (Ledger)' : activeTab === 'analytics' ? 'Biznes tahlili (Analitika)' : activeTab === 'reports' ? 'Hisobotlar va auditlar' : 'Tizim sozlamalari'}
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] font-medium">
                <span className="text-slate-400">Ma'lumotlar holati:</span>
                <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Sinxronlandi
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 select-none">
            {loadingState && (
              <span className="text-[10px] uppercase font-mono text-[#2563EB] font-bold animate-pulse mr-2">
                Ma'lumotlar yangilanmoqda...
              </span>
            )}
            <button
              onClick={fetchAllStates}
              className="bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-600 text-xs px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-[#E2E8F0]"
            >
              <RefreshCw size={12} className={loadingState ? "animate-spin" : ""} />
              Yangilash
            </button>
          </div>
        </header>

        {/* PRIMARY ACTIVE VIEW PANEL RENDERER */}
        <div className="transition-all duration-350 min-h-[75vh]">
          {/* TAB 1: EXECUTIVE LIVE OVERVIEW STATS */}
          {activeTab === "dashboard" && (
            <DashboardView
              customers={customers}
              products={products}
              orders={orders}
              employees={employees}
              finances={transactions as any}
              onNavigate={(tab) => {
                if (tab === "products") {
                  setActiveTab("wms");
                } else {
                  setActiveTab(tab as any);
                }
              }}
            />
          )}

          {/* TAB 2: CRM SYSTEM */}
          {activeTab === "crm" && <CrmView customers={customers} refreshData={fetchAllStates} />}

          {/* TAB 3: WMS SYSTEM PRODUCT CATALOG */}
          {activeTab === "wms" && (
            <WmsView
              products={products}
              categories={categories}
              suppliers={suppliers}
              refreshAll={fetchAllStates}
            />
          )}

          {/* TAB 4: TEXTILE SUPPLIERS SOURCING */}
          {activeTab === "suppliers" && <SuppliersView suppliers={suppliers} refreshAll={fetchAllStates} />}

          {/* TAB 5: ERP SALES ORDERS MANAGER */}
          {activeTab === "orders" && (
            <OrdersView
              orders={orders}
              customers={customers}
              products={products}
              refreshAll={fetchAllStates}
            />
          )}

          {/* TAB 6: HR STAFF DIRECTORY SYSTEM */}
          {activeTab === "employees" && <EmployeesView employees={employees} refreshAll={fetchAllStates} />}

          {/* TAB 7: FINANCE LEDGER BOOKKEEPING */}
          {activeTab === "finance" && (
            <FinanceView
              transactions={transactions}
              orders={orders}
              employees={employees}
              refreshAll={fetchAllStates}
            />
          )}

          {/* TAB 8: CLOUD PERFORMANCE ANALYTICS */}
          {activeTab === "analytics" && (
            <AnalyticsView
              products={products}
              customers={customers}
              orders={orders}
              categories={categories}
            />
          )}

          {/* TAB 9: audit compilation AND SPREADSHEETS */}
          {activeTab === "reports" && (
            <ReportsView
              products={products}
              customers={customers}
              orders={orders}
              employees={employees}
              transactions={transactions}
            />
          )}

          {/* TAB 10: ACCOUNT SETTINGS & DEPLOYMENT CODES */}
          {activeTab === "settings" && <SettingsView />}
        </div>
      </main>
    </div>
  );
}
