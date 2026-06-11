import { useState } from "react";
import {
  TrendingUp,
  Award,
  Package,
  Layers,
  ShoppingBag,
  Map,
  Compass,
  Zap,
  HelpCircle
} from "lucide-react";
import { Product, Customer, Order, Category } from "../types";

export default function AnalyticsView({
  products,
  customers,
  orders,
  categories
}: {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  categories: Category[];
}) {
  const [selectedSpecCat, setSelectedSpecCat] = useState("ALL");

  // Filtered Products
  const targetProducts = selectedSpecCat === "ALL"
    ? products
    : products.filter(p => p.category === selectedSpecCat);

  // 1. Top Performing Styles (Sorted by stock value or highest volume)
  const topStyles = [...products]
    .sort((a, b) => b.quantity * b.price - a.quantity * a.price)
    .slice(0, 5);

  // 2. Capacity & Stock Allocation by Category
  const categoryAllocation = categories.map(cat => {
    const associated = products.filter(p => p.category === cat.name);
    const totalUnits = associated.reduce((sum, current) => sum + current.quantity, 0);
    const netValue = associated.reduce((sum, current) => sum + current.quantity * current.price, 0);
    return { name: cat.name, units: totalUnits, value: netValue };
  });

  const totalUnitsAll = products.reduce((sum, current) => sum + current.quantity, 0);
  const totalValueAll = products.reduce((sum, current) => sum + current.quantity * current.price, 0);

  // 3. Client Distribution Concentration map
  const countryConcentration = customers.reduce((acc: { [key: string]: number }, curr) => {
    acc[curr.country] = (acc[curr.country] || 0) + 1;
    return acc;
  }, {});

  const totalClients = customers.length;
  const countryPercentages = Object.entries(countryConcentration).map(([country, count]) => ({
    country,
    count,
    percent: totalClients > 0 ? Math.round((count / totalClients) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  // 4. Fulfillment KPI ratios
  const completedOrders = orders.filter(o => o.status === "Completed").length;
  const processingOrders = orders.filter(o => o.status === "Processing").length;
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const cancelledOrders = orders.filter(o => o.status === "Cancelled").length;
  const totalOrdersCount = orders.length;

  const fulfillmentRatio = totalOrdersCount > 0
    ? Math.round((completedOrders / totalOrdersCount) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="font-sans font-bold text-lg text-[#0F172A] tracking-tight">Executive Cloud Analytics</h2>
          <p className="text-xs text-[#64748B]">Real-time query summaries of active inventory balances and logistic ratios.</p>
        </div>
        <div className="flex items-center gap-1.5 self-start">
          <span className="text-xs text-[#64748B] font-semibold">Scope Allocation:</span>
          <select
            value={selectedSpecCat}
            onChange={e => setSelectedSpecCat(e.target.value)}
            className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs text-[#475569] font-semibold focus:ring-1 focus:ring-[#2563EB]/40 outline-none"
          >
            <option value="ALL">All Enterprise Apparel</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* THREE BENTO PANELS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COMPONENT: CAPACITY VALUATION & ALLOCATIONS */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
              <Package size={13} />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#0F172A]">Inventory Capital Allocation</h3>
              <p className="text-[10px] text-[#64748B]">Active raw styling value mapped per clothing taxonomy.</p>
            </div>
          </div>

          <div className="space-y-4 pt-3">
            {categoryAllocation.map((cat, idx) => {
              const valPercentage = totalValueAll > 0 ? (cat.value / totalValueAll) * 100 : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-[#475569]">{cat.name}</span>
                    <span className="font-mono text-[#0F172A]">
                      ${cat.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      <span className="text-[10px] text-[#64748B] font-normal ml-1">({cat.units} pcs)</span>
                    </span>
                  </div>
                  {/* Real-time custom vector progress bars */}
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] rounded-full"
                      style={{ width: `${Math.max(4, valPercentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="border-t border-[#E2E8F0] pt-4 flex justify-between items-center text-xs font-bold text-slate-800">
              <span>Grand Asset Valuation:</span>
              <span className="font-mono text-sm text-[#2563EB]">${totalValueAll.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* COMPONENT: HIGHEST VALUED STOCK MODELS */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
              <Award size={13} />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#0F172A]">Top Stock Capital Nodes</h3>
              <p className="text-[10px] text-[#64748B]">Highest asset worth profiles racked inside WMS bins.</p>
            </div>
          </div>

          <div className="space-y-3 pt-3">
            {topStyles.map((p, idx) => {
              const worth = p.quantity * p.price;
              return (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#94A3B8]">0{idx + 1}</span>
                    <div>
                      <h4 className="text-xs font-bold text-[#0F172A] line-clamp-1">{p.name}</h4>
                      <span className="font-mono text-[9px] text-[#64748B] font-semibold">{p.sku} &bull; {p.quantity} units</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#0F172A]">${worth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <span className="text-[9px] block text-[#64748B] font-mono">${p.price}/unit</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COMPONENT: GEOGRAPHICAL CLIENTS CONCENTRATION */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#0EA5E9]/10 flex items-center justify-center text-[#0EA5E9]">
              <Map size={13} />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#0F172A]">Global Sourcing Concentration</h3>
              <p className="text-[10px] text-[#64748B]">Wholesale corporate accounts concentration ratios.</p>
            </div>
          </div>

          <div className="space-y-4 pt-3">
            {countryPercentages.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>{item.country}</span>
                  <span className="font-mono text-[11px] text-[#0F172A]">
                    {item.count} account{item.count > 1 ? "s" : ""} &bull; {item.percent}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0EA5E9] rounded-full"
                    style={{ width: `${Math.max(5, item.percent)}%` }}
                  />
                </div>
              </div>
            ))}

            {countryPercentages.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">No client nodes verified globally yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* METRICS DISPATCH KPI BOARD */}
      <div className="bg-[#0F172A] rounded-2xl border border-[#334155] p-6 text-white grid grid-cols-1 md:grid-cols-4 gap-6 items-center shadow-md relative overflow-hidden">
        {/* Abstract decorative layout items */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-10 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl" />

        <div className="md:col-span-2 space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#2563EB] font-bold block">
            Cloud ERP Supply Scorecard
          </span>
          <h3 className="font-sans font-bold text-lg text-white leading-tight">
            Our Enterprise Fulfillment Score is currently operating at {fulfillmentRatio}% efficiency
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            This indicates the ratio of closed, completed and dispatched bulk customer orders against outstanding logs.
          </p>
        </div>

        {/* Detailed counts */}
        <div className="grid grid-cols-2 gap-4 md:col-span-2">
          <div className="bg-[#1E293B]/70 border border-[#334155] p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[9px] uppercase font-mono text-slate-400 font-bold">Dispatched (Closed)</span>
            <span className="text-2xl font-mono font-bold text-[#10B981] mt-1">{completedOrders}</span>
            <span className="text-[9px] text-slate-500 block">Fulfilled cargo slips</span>
          </div>

          <div className="bg-[#1E293B]/70 border border-[#334155] p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[9px] uppercase font-mono text-slate-400 font-bold">Packing &amp; Picking</span>
            <span className="text-2xl font-mono font-bold text-[#3B82F6] mt-1">{processingOrders}</span>
            <span className="text-[9px] text-slate-500 block">Active warehouse runs</span>
          </div>

          <div className="bg-[#1E293B]/70 border border-[#334155] p-3 rounded-xl flex flex-col justify-between col-span-2">
            <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 font-mono uppercase">
              <span>Outstanding Ratio Indicators</span>
              <span>Pending Order count: <strong className="text-[#F59E0B]">{pendingOrders}</strong></span>
            </div>
            <div className="w-full h-1.5 bg-[#475569] rounded-full overflow-hidden mt-2.5">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-green-400 rounded-full"
                style={{ width: `${fulfillmentRatio}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
