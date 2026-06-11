import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  DollarSign,
  TrendingUp,
  Percent,
  PlusCircle,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  X,
  Plus
} from "lucide-react";
import { Transaction, Order, Employee } from "../types";

export default function FinanceView({
  transactions,
  orders,
  employees,
  refreshAll
}: {
  transactions: Transaction[];
  orders: Order[];
  employees: Employee[];
  refreshAll: () => void;
}) {
  const { apiFetch, user } = useAuth();

  // Search/Filter state parameters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Log Transaction state
  const [showModal, setShowModal] = useState(false);
  const [transAmount, setTransAmount] = useState(1500);
  const [transType, setTransType] = useState<"Income" | "Expense">("Expense");
  const [transDate, setTransDate] = useState("");
  const [transDesc, setTransDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleOpenCreateLog = () => {
    setTransAmount(1200);
    setTransType("Expense");
    setTransDate(new Date().toISOString().split("T")[0]);
    setTransDesc("Logistic ocean-freight forwarding custom clearing tariff.");
    setErrorMsg("");
    setShowModal(true);
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (transAmount <= 0) {
      setErrorMsg("Transaction ledger amounts must be absolute numbers scaling above zero.");
      setLoading(false);
      return;
    }

    try {
      await apiFetch("/api/erp/transactions", {
        method: "POST",
        body: JSON.stringify({
          amount: transAmount,
          type: transType,
          date: transDate,
          description: transDesc
        })
      });
      setShowModal(false);
      refreshAll();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed saving corporate transaction record.");
    } finally {
      setLoading(false);
    }
  };

  // Finance computation engine (calculating actual metrics)
  // Income: Custom-logged incomes + Completed Sales Orders
  const orderIncomeTotal = orders
    .filter(o => o.status !== "Cancelled" && o.payment_status === "Paid")
    .reduce((sum, current) => sum + current.total_amount, 0);

  const rawLoggedIncomes = transactions
    .filter(t => t.type === "Income")
    .reduce((sum, current) => sum + current.amount, 0);

  const totalIncomes = orderIncomeTotal + rawLoggedIncomes;

  // Expenses: Custom-logged expenses + Payroll Burden (Employees salaries / 12 for active monthly context if comparing monthly, but let's compare as cumulative base metrics)
  const payrollBurdenYearly = employees.reduce((sum, current) => sum + current.salary, 0);
  // Let's add logged expenses
  const rawLoggedExpenses = transactions
    .filter(t => t.type === "Expense")
    .reduce((sum, current) => sum + current.amount, 0);

  const totalExpenses = rawLoggedExpenses + (payrollBurdenYearly / 12); // adding standard annualized single monthly context as placeholder or keeping direct logged totals for high reliability! Let's display both cleanly.

  const netSurplus = totalIncomes - totalExpenses;
  const netMargin = totalIncomes > 0 ? Math.round((netSurplus / totalIncomes) * 100) : 0;

  // Filtering transactions array
  const filtered = transactions.filter(t => {
    const term = search.toLowerCase();
    const matchSearch = t.description.toLowerCase().includes(term) || t.id.toString().includes(term);
    const matchType = typeFilter === "ALL" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* LEDGER ANALYTICAL BOARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* TOTAL REVENUES ACUMULATORS */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#94A3B8]">Gross Sourcing Incomes</span>
            <p className="font-sans font-bold text-lg text-[#0F172A]">${totalIncomes.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <span className="text-[10px] text-[#64748B] block mt-1">
              Includes <strong className="text-[#10B981]">${orderIncomeTotal.toLocaleString()}</strong> from PO fulfillments.
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#10B981]/5 flex items-center justify-center text-[#10B981]">
            <TrendingUp size={16} />
          </div>
        </div>

        {/* CUMULATIVE OPERATING EXPENSES */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#94A3B8]">Sourcing Operational Outflow</span>
            <p className="font-sans font-bold text-lg text-[#EF4444]">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <span className="text-[10px] text-[#64748B] block mt-1 font-sans">
              Includes monthly staff payroll burden <strong className="text-slate-800">${Math.round(payrollBurdenYearly / 12).toLocaleString()}</strong>.
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#EF4444]/5 flex items-center justify-center text-[#EF4444]">
            <TrendingDown size={16} />
          </div>
        </div>

        {/* NET OPERATING MARGIN SURPLUS */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center justify-between shadow-xs col-span-1 sm:col-span-2 xl:col-span-1">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#94A3B8]">Net Sourcing Surplus (P&amp;L)</span>
            <p className={`font-sans font-bold text-lg ${netSurplus >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
              ${netSurplus.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] text-[#64748B] block mt-1">
              Realized corporate margin efficiency ratio.
            </span>
          </div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${netSurplus >= 0 ? "bg-[#10B981]/5 text-[#10B981]" : "bg-[#EF4444]/5 text-[#EF4444]"}`}>
            <DollarSign size={16} />
          </div>
        </div>

        {/* SURPLUS MARGIN PERCENTAGE ACCELERATOR */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center justify-between shadow-xs col-span-1 sm:col-span-2 xl:col-span-1">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#94A3B8]">Surplus Operating Ratio</span>
            <p className="font-sans font-bold text-lg text-[#2563EB]">{netMargin}% Net</p>
            <span className="text-[10px] text-[#64748B] block mt-1">
              EBITDA cloud-scaled parameter score.
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#2563EB]/5 flex items-center justify-center text-[#2563EB]">
            <Percent size={16} />
          </div>
        </div>
      </div>

      {/* DETAILED TRANSACTION LOGS GRID & INVENTORY BOOKKEEPING */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-sans font-bold text-base text-[#0F172A] leading-tight">Corporate Cash Ledger Logs</h2>
            <p className="text-xs text-[#64748B]">Real-time audit log of active bank transactions, logistic invoices and physical clearances.</p>
          </div>
          {user?.role !== "Employee" && (
            <button
              onClick={handleOpenCreateLog}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
            >
              <PlusCircle size={14} /> Log Custom Outlay
            </button>
          )}
        </div>

        {/* SEARCH FILTERS CONTROLS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-[#94A3B8]" size={14} />
            <input
              type="text"
              placeholder="Search by log details, transactional tags, clearance labels..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-[#2563EB]/40 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#64748B]" />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#2563EB]/40 outline-none text-[#64748B]"
            >
              <option value="ALL">All Operations</option>
              <option value="Income">Inbound Cash Inflow (Income)</option>
              <option value="Expense">Outbound Clearance Outlay (Expense)</option>
            </select>
          </div>
        </div>

        {/* TABLES RECORDS CONTAINER */}
        <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl font-sans">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold h-10 bg-[#F8FAFC]">
                <th className="px-4">Log SKU Reference</th>
                <th className="px-4">Manifest Description</th>
                <th className="px-4">Fulfillment Date</th>
                <th className="px-4 text-center">Type</th>
                <th className="px-4 text-right">Amount Sum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-slate-700">
              {/* Adding Sales Orders payments dynamically for visual completeness */}
              <tr>
                <td className="px-4 py-2.5 font-mono text-slate-400">LEDGER-BCH-FH</td>
                <td className="px-4 py-2.5">
                  <p className="font-semibold text-slate-800">Dynamic Inbound PO Consolidated Fulfillments</p>
                  <span className="text-[10px] text-slate-400 block line-clamp-1">Aggregate incoming receivables from wholesale clients checkouts.</span>
                </td>
                <td className="px-4 py-2.5 text-slate-500 font-semibold">Real-time</td>
                <td className="px-4 py-2.5 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/15 text-[#10B981]">Income</span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-[#10B981]">
                  +${orderIncomeTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Adding Employee salary load dynamically for visual completeness */}
              {payrollBurdenYearly > 0 && (
                <tr>
                  <td className="px-4 py-2.5 font-mono text-slate-400">LEDGER-PAY-EMP</td>
                  <td className="px-4 py-2.5">
                    <p className="font-semibold text-slate-800">Staff Personnel Consolidated Base Payroll (Monthly)</p>
                    <span className="text-[10px] text-slate-400 block line-clamp-1">Aggregated payroll payout requirements for {employees.length} active registered staff nodes.</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 font-semibold">Monthly Roll</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444]/15 text-[#EF4444]">Expense</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-[#EF4444]">
                    -${Math.round(payrollBurdenYearly / 12).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )}

              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-[#94A3B8]">
                    No custom cash invoices logged under current keyword filters.
                  </td>
                </tr>
              ) : (
                [...filtered].reverse().map(t => (
                  <tr key={t.id} className="h-11 hover:bg-[#F8FAFC]">
                    <td className="px-4 font-mono font-bold text-[#94A3B8]">LEDGER-TX-{t.id}</td>
                    <td className="px-4 text-slate-800 font-medium">{t.description}</td>
                    <td className="px-4 text-[#64748B]">{t.date}</td>
                    <td className="px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          t.type === "Income"
                            ? "bg-[#10B981]/15 text-[#10B981]"
                            : "bg-[#EF4444]/15 text-[#EF4444]"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td
                      className={`px-4 text-right font-mono font-bold ${
                        t.type === "Income" ? "text-[#10B981]" : "text-[#EF4444]"
                      }`}
                    >
                      {t.type === "Income" ? "+" : "-"}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP MODAL: CUSTOM OUTLAYS LOGGING */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl max-w-sm w-full overflow-hidden">
            <div className="bg-[#2563EB] p-4 flex items-center justify-between text-white">
              <h3 className="font-sans font-bold text-sm">Log Custom Enterprise Cashflow</h3>
              <button onClick={() => setShowModal(false)} className="hover:text-red-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-semibold rounded-lg">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Transaction outlay Sum ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={transAmount}
                  onChange={e => setTransAmount(parseFloat(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Cash Flow Direction *</label>
                <select
                  value={transType}
                  onChange={e => setTransType(e.target.value as any)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="Expense">Outbound Expense Payment (Outflow)</option>
                  <option value="Income">Inbound Custom Cash Receipt (Inflow)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Fulfillment Date *</label>
                <input
                  type="date"
                  required
                  value={transDate}
                  onChange={e => setTransDate(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Fulfillment Manifest/Label *</label>
                <textarea
                  required
                  value={transDesc}
                  onChange={e => setTransDesc(e.target.value)}
                  placeholder="Specify payment details (e.g. Los Angeles Warehouse rent, raw denim yarn, thread boxes...)"
                  rows={2}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 hover:bg-[#F8FAFC] border border-[#E2E8F0] text-slate-500 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg shadow-sm disabled:opacity-55"
                >
                  {loading ? "Recording..." : "Log outlay Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
