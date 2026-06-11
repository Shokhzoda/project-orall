import { useState } from "react";
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Layers,
  ShoppingBag,
  Inbox,
  TrendingDown,
  ArrowDownToLine,
  Truck
} from "lucide-react";
import { Product, Customer, Order, Employee, Transaction } from "../types";

export default function ReportsView({
  products,
  customers,
  orders,
  employees,
  transactions
}: {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  employees: Employee[];
  transactions: Transaction[];
}) {
  const [reportType, setReportType] = useState<"inventory" | "sales" | "payroll" | "financial">("inventory");

  // Custom trigger raw download simulation
  const downloadCSVSimulation = (type: string) => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (type === "inventory") {
      headers = ["Product ID", "Name", "SKU", "Barcode", "Category", "Quantity", "Price", "Supplier"];
      rows = products.map(p => [
        p.id.toString(),
        p.name,
        p.sku,
        p.barcode,
        p.category,
        p.quantity.toString(),
        p.price.toString(),
        p.supplier
      ]);
    } else if (type === "sales") {
      headers = ["Order PO #", "Customer Name", "Order Date", "Status", "Payment", "Total Sum"];
      rows = orders.map(o => [
        o.id.toString(),
        o.customer_name,
        o.order_date,
        o.status,
        o.payment_status,
        o.total_amount.toString()
      ]);
    } else if (type === "payroll") {
      headers = ["Employee ID", "Full Name", "Position", "Department", "Salary", "Phone", "Email", "Joining Date"];
      rows = employees.map(e => [
        e.id.toString(),
        e.full_name,
        e.position,
        e.department,
        e.salary.toString(),
        e.phone,
        e.email,
        e.joining_date
      ]);
    } else {
      headers = ["Transaction ID", "Description", "Type", "Amount", "Date"];
      rows = transactions.map(t => [
        t.id.toString(),
        t.description,
        t.type,
        t.amount.toString(),
        t.date
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fashionhub_report_${type}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
      {/* LEFT REPORT CONTROL TABS Panel */}
      <div className="xl:col-span-1 bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
        <h3 className="font-sans font-bold text-sm text-[#0F172A] pb-2 border-b border-[#E2E8F0]">Select Report Layout</h3>
        <button
          onClick={() => setReportType("inventory")}
          className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
            reportType === "inventory"
              ? "bg-[#2563EB]/5 border-[#2563EB] text-[#2563EB]"
              : "bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
          }`}
        >
          <Inbox size={15} /> Physical WMS Inventories Ratios
        </button>
        <button
          onClick={() => setReportType("sales")}
          className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
            reportType === "sales"
              ? "bg-[#2563EB]/5 border-[#2563EB] text-[#2563EB]"
              : "bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
          }`}
        >
          <ShoppingBag size={15} /> Sales PO &amp; Client Ledger
        </button>
        <button
          onClick={() => setReportType("payroll")}
          className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
            reportType === "payroll"
              ? "bg-[#2563EB]/5 border-[#2563EB] text-[#2563EB]"
              : "bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
          }`}
        >
          <Layers size={15} /> HR Personnel &amp; Salary Ledger
        </button>
        <button
          onClick={() => setReportType("financial")}
          className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
            reportType === "financial"
              ? "bg-[#2563EB]/5 border-[#2563EB] text-[#2563EB]"
              : "bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
          }`}
        >
          <TrendingDown size={15} /> Double-entry Cashflow Ledger
        </button>
      </div>

      {/* RIGHT PREVIEW & ACCREDITED ACTION Panel */}
      <div className="xl:col-span-3 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6 print:absolute print:inset-0 print:border-none print:shadow-none print:bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4 print:hidden">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#94A3B8] font-bold">Standard ERP Spreadsheet Report</span>
            <h2 className="font-sans font-bold text-base text-[#0F172A] leading-tight">
              {reportType === "inventory" && "Warehouse Product Stock Roster Report"}
              {reportType === "sales" && "Wholesale client PO invoice Report"}
              {reportType === "payroll" && "HR Employee Salaries Payroll Report"}
              {reportType === "financial" && "Double-entry operational Transactions Report"}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">Preview compliance audit log metrics or trigger physical export parameters.</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <button
              onClick={() => downloadCSVSimulation(reportType)}
              className="bg-[#10B981] hover:bg-[#059669] text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <ArrowDownToLine size={13} /> Export CSV Spreadsheet
            </button>
            <button
              onClick={() => window.print()}
              className="bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer size={13} /> Physical Print Layout
            </button>
          </div>
        </div>

        {/* PRINT SPREADSHEEET SKELETON */}
        <div className="space-y-4">
          <div className="hidden print:flex items-center justify-between border-b pb-3 mb-4">
            <div>
              <h1 className="font-sans font-bold text-sm text-[#0F172A]">FashionHub Cloud ERP</h1>
              <span className="text-[10px] text-slate-500 block">Formal compliance compilation audit report ledger</span>
            </div>
            <span className="font-mono text-xs font-bold text-slate-700">Compiled: {new Date().toLocaleDateString()}</span>
          </div>

          <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl font-sans">
            {/* INVENTORY SHEET */}
            {reportType === "inventory" && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold h-10 bg-[#F8FAFC]">
                    <th className="px-4">ID</th>
                    <th className="px-4">Style Model name</th>
                    <th className="px-4">SKU / Barcode</th>
                    <th className="px-4">Clothing Category</th>
                    <th className="px-4 text-center">In-Stock units</th>
                    <th className="px-4 text-right">Wholesale Price</th>
                    <th className="px-4 text-right">Asset Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-slate-700">
                  {products.map(p => (
                    <tr key={p.id} className="h-11 hover:bg-[#F1F5F9]/30">
                      <td className="px-4 font-mono">0{p.id}</td>
                      <td className="px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="px-4 font-mono">{p.sku}<br />{p.barcode}</td>
                      <td className="px-4">{p.category}</td>
                      <td className="px-4 text-center font-bold text-slate-800">{p.quantity} pcs</td>
                      <td className="px-4 text-right font-mono">${p.price}</td>
                      <td className="px-4 text-right font-mono font-bold text-slate-905">
                        ${(p.quantity * p.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* SALES SHEET */}
            {reportType === "sales" && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold h-10 bg-[#F8FAFC]">
                    <th className="px-4">PO # Code</th>
                    <th className="px-4">Wholesale Client</th>
                    <th className="px-4">Fulfillment Date</th>
                    <th className="px-4 text-center">Status</th>
                    <th className="px-4 text-center">Receipt Status</th>
                    <th className="px-4 text-right">Invoice Sum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-slate-700">
                  {orders.map(o => (
                    <tr key={o.id} className="h-11 hover:bg-[#F1F5F9]/30">
                      <td className="px-4 font-mono font-bold text-[#2563EB]">#{o.id}</td>
                      <td className="px-4 font-bold text-slate-900">{o.customer_name}</td>
                      <td className="px-4 font-mono">{o.order_date}</td>
                      <td className="px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="px-4 text-right font-mono font-bold text-slate-900">
                        ${o.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* PAYROLL SHEET */}
            {reportType === "payroll" && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold h-10 bg-[#F8FAFC]">
                    <th className="px-4">ID</th>
                    <th className="px-4">Profile legal Name</th>
                    <th className="px-4">Enterprise Role Designation</th>
                    <th className="px-4">Department Division</th>
                    <th className="px-4">Joining milestone</th>
                    <th className="px-4 text-right">Annual Salary grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-slate-700">
                  {employees.map(e => (
                    <tr key={e.id} className="h-11 hover:bg-[#F1F5F9]/30">
                      <td className="px-4 font-mono">X{e.id}</td>
                      <td className="px-4 font-bold text-slate-900">{e.full_name}</td>
                      <td className="px-4 font-medium text-slate-600">{e.position}</td>
                      <td className="px-4">{e.department}</td>
                      <td className="px-4 text-slate-500 font-semibold">{e.joining_date}</td>
                      <td className="px-4 text-right font-mono font-bold text-slate-900">
                        ${e.salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* FINANCIAL SHEET */}
            {reportType === "financial" && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold h-10 bg-[#F8FAFC]">
                    <th className="px-4">TX Code Reference</th>
                    <th className="px-4">Manifest Description Label</th>
                    <th className="px-4">Clearing Date</th>
                    <th className="px-4 text-center">Inflow/Outflow</th>
                    <th className="px-4 text-right">Cleared sum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-slate-700">
                  {transactions.map(t => (
                    <tr key={t.id} className="h-11 hover:bg-[#F1F5F9]/30">
                      <td className="px-4 font-mono">TX-{t.id}</td>
                      <td className="px-4 font-medium text-slate-900">{t.description}</td>
                      <td className="px-4 font-mono">{t.date}</td>
                      <td className="px-4 text-center">
                        <span className={t.type === "Income" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                          {t.type}
                        </span>
                      </td>
                      <td className={`px-4 text-right font-mono font-bold ${t.type === "Income" ? "text-green-600" : "text-red-600"}`}>
                        {t.type === "Income" ? "+" : "-"}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
