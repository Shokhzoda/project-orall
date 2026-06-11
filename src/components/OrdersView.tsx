import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ShoppingBag,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Trash2,
  X,
  FileSpreadsheet,
  Calendar,
  AlertTriangle,
  Plus,
  Minus,
  Briefcase,
  DollarSign,
  Printer,
  Compass
} from "lucide-react";
import { Order, Customer, Product, OrderItem } from "../types";

export default function OrdersView({
  orders,
  customers,
  products,
  refreshAll
}: {
  orders: Order[];
  customers: Customer[];
  products: Product[];
  refreshAll: () => void;
}) {
  const { apiFetch, user } = useAuth();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selected Order for Invoice view
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Order Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orderCustId, setOrderCustId] = useState("");
  const [orderItemsLine, setOrderItemsLine] = useState<{ product_id: string; quantity: number }[]>([]);
  const [orderDate, setOrderDate] = useState("");
  const [orderStatus, setOrderStatus] = useState<"Pending" | "Processing" | "Completed" | "Cancelled">("Pending");
  const [orderPayment, setOrderPayment] = useState<"Paid" | "Unpaid" | "Refunded">("Unpaid");
  const [formError, setFormError] = useState("");

  // Handler: Add Item Line in create wizard
  const handleAddLineItem = () => {
    // default pick first product id that is not already set or first available
    const firstProd = products[0]?.id.toString() || "";
    setOrderItemsLine(prev => [...prev, { product_id: firstProd, quantity: 10 }]);
  };

  const handleRemoveLineItem = (idx: number) => {
    setOrderItemsLine(prev => prev.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx: number, field: string, val: any) => {
    setOrderItemsLine(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleOpenCreate = () => {
    setOrderCustId(customers[0]?.id.toString() || "");
    setOrderItemsLine([{ product_id: products[0]?.id.toString() || "", quantity: 15 }]);
    setOrderDate(new Date().toISOString().split("T")[0]);
    setOrderStatus("Pending");
    setOrderPayment("Unpaid");
    setFormError("");
    setShowCreateModal(true);
  };

  const handleBookOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!orderCustId) {
      setFormError("Selecting an active customer is required.");
      return;
    }

    if (orderItemsLine.length === 0) {
      setFormError("Wholesale orders must comprise at least one item style line.");
      return;
    }

    const payload = {
      customer_id: orderCustId,
      items: orderItemsLine,
      status: orderStatus,
      payment_status: orderPayment,
      order_date: orderDate
    };

    try {
      await apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setShowCreateModal(false);
      refreshAll();
    } catch (err: any) {
      setFormError(err.message || "Failed booking bulk order.");
    }
  };

  const handleStatusUpdate = async (id: number, activeStatus: string) => {
    try {
      await apiFetch(`/api/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: activeStatus })
      });
      refreshAll();
      if (invoiceOrder && invoiceOrder.id === id) {
        setInvoiceOrder(prev => prev ? { ...prev, status: activeStatus as any } : null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePaymentUpdate = async (id: number, paymentS: string) => {
    try {
      await apiFetch(`/api/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify({ payment_status: paymentS })
      });
      refreshAll();
      if (invoiceOrder && invoiceOrder.id === id) {
        setInvoiceOrder(prev => prev ? { ...prev, payment_status: paymentS as any } : null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (!window.confirm("Purge / cancel this wholesale PO? Booked quantities will automatically credit back to WMS racks.")) return;
    try {
      await apiFetch(`/api/orders/${id}`, { method: "DELETE" });
      setInvoiceOrder(null);
      refreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Printable representation
  const handlePrintTrigger = () => {
    window.print();
  };

  // Filter computation
  const filtered = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      o.customer_name.toLowerCase().includes(term) ||
      o.id.toString().includes(term) ||
      o.items.some(item => item.name.toLowerCase().includes(term) || item.sku.toLowerCase().includes(term));

    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
      {/* ORDERS INDEX LEDGER */}
      <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-sans font-bold text-lg text-[#0F172A] leading-tight">ERP Sales Orders Manager</h2>
            <p className="text-xs text-[#64748B]">Create bulk purchase orders, inspect packing slips, and monitor unpaid invoice ratios.</p>
          </div>
          {user?.role !== "Employee" && (
            <button
              onClick={handleOpenCreate}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
            >
              <PlusCircle size={15} /> Book wholesale PO
            </button>
          )}
        </div>

        {/* SEARCH & FILTER CONTROLLER BAR */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-[#94A3B8]" size={14} />
            <input
              type="text"
              placeholder="Search by order ID, style model, customer shop name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-[#2563EB]/40 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#64748B]" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#2563EB]/40 outline-none text-[#64748B]"
            >
              <option value="ALL">All Order Lifecycles</option>
              <option value="Pending">Pending (Awaiting fulfillment)</option>
              <option value="Processing">Processing (Picking / Packing)</option>
              <option value="Completed">Completed (Dispatched and closed)</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* LIST TABLE CONTAINER */}
        <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold h-10 bg-[#F8FAFC]">
                <th className="px-4">PO # Code</th>
                <th className="px-4">Wholesale Client</th>
                <th className="px-4">Order Date</th>
                <th className="px-4 text-right">Invoice Sum</th>
                <th className="px-4 text-center">Lifecycle Status</th>
                <th className="px-4 text-center">Receipt Cleared</th>
                <th className="px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[#94A3B8]">
                    No wholesale orders registered under current filters.
                  </td>
                </tr>
              ) : (
                [...filtered].reverse().map(o => (
                  <tr
                    key={o.id}
                    className={`h-12 hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                      invoiceOrder?.id === o.id ? "bg-[#2563EB]/5" : ""
                    }`}
                    onClick={() => setInvoiceOrder(o)}
                  >
                    <td className="px-4 font-mono font-bold text-[#2563EB]">#{o.id}</td>
                    <td className="px-4 font-semibold text-[#0F172A]">{o.customer_name}</td>
                    <td className="px-4 text-[#64748B]">{o.order_date}</td>
                    <td className="px-4 text-right font-mono font-bold text-[#0F172A]">
                      ${o.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === "Completed"
                            ? "bg-[#10B981]/10 text-[#10B981]"
                            : o.status === "Processing"
                            ? "bg-[#0EA5E9]/10 text-[#0EA5E9]"
                            : o.status === "Cancelled"
                            ? "bg-[#EF4444]/10 text-[#EF4444]"
                            : "bg-[#F59E0B]/10 text-[#F59E0B]"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.payment_status === "Paid"
                            ? "bg-[#10B981]/10 text-[#10B981]"
                            : o.payment_status === "Refunded"
                            ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                            : "bg-[#EF4444]/10 text-[#EF4444]"
                        }`}
                      >
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="px-4 text-right space-x-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setInvoiceOrder(o)}
                        className="text-[#3b82f6] hover:text-[#2563eb] font-semibold"
                        title="Query Slip"
                      >
                        <Eye size={14} className="inline" />
                      </button>
                      {user?.role === "Admin" && (
                        <button
                          onClick={() => handleDeleteOrder(o.id)}
                          className="text-[#EF4444] hover:text-[#DC2626]"
                          title="Purge / Cancel Order"
                        >
                          <Trash2 size={14} className="inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED ACTIVE INVOICE VISUALIZER */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4 print:fixed print:inset-0 print:z-50 print:bg-white print:p-8">
        {!invoiceOrder ? (
          <div className="h-96 flex flex-col items-center justify-center text-center text-[#94A3B8]">
            <ShoppingBag size={32} className="mb-2 stroke-1 text-slate-300" />
            <p className="text-xs font-semibold">Select wholesale invoice</p>
            <p className="text-[10px] text-[#64748B] max-w-48 mt-0.5">Click any row in the ERP ledger to view formal corporate invoices and trigger fulfillment stages.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* CONTROL PANEL */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3 print:hidden">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-wider font-bold text-[#94A3B8] uppercase">Full Invoice Slip</span>
                <h3 className="font-sans font-bold text-sm text-[#0F172A]">PO #{invoiceOrder.id}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrintTrigger}
                  className="bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                  title="PDF / Print"
                >
                  <Printer size={14} /> Print
                </button>
                {user?.role !== "Employee" && (
                  <button
                    onClick={() => handleDeleteOrder(invoiceOrder.id)}
                    className="bg-red-50 hover:bg-red-100 text-[#EF4444] p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                    title="Cancel Booking"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* DYNAMIC OPERATION MANAGERS */}
            {user?.role !== "Employee" && (
              <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] text-xs print:hidden">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono text-[#64748B] font-bold">Progress Ratios</span>
                  <select
                    value={invoiceOrder.status}
                    onChange={e => handleStatusUpdate(invoiceOrder.id, e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded p-1.5 outline-none font-sans"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono text-[#64748B] font-bold">Ledger Payment</span>
                  <select
                    value={invoiceOrder.payment_status}
                    onChange={e => handlePaymentUpdate(invoiceOrder.id, e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded p-1.5 outline-none font-sans"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>
            )}

            {/* FORMAL CORPORATE INVOICE SLIP */}
            <div id="printBox" className="space-y-6 pt-2 select-text font-sans">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded bg-[#2563EB] flex items-center justify-center font-bold text-white text-[10px]">
                      FH
                    </div>
                    <h2 className="font-sans font-bold text-xs tracking-tight text-[#0F172A]">FashionHub Corp.</h2>
                  </div>
                  <p className="text-[10px] text-[#64748B] leading-tight">
                    FashionHub Sector 4 Wholesale Hub<br />
                    Los Angeles, CA, 90015<br />
                    billing@fashionhub.com
                  </p>
                </div>
                <div className="text-right">
                  <h1 className="font-sans font-bold text-sm uppercase tracking-wide text-[#0F172A]">INVOICE</h1>
                  <span className="font-mono text-xs text-[#2563EB] font-bold">PO #{invoiceOrder.id}</span>
                  <p className="text-[9px] text-[#64748B] mt-0.5">Date: {invoiceOrder.order_date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-b border-[#E2E8F0] py-3 text-[10px]">
                <div>
                  <span className="text-[9px] font-mono tracking-wider font-bold text-[#94A3B8] uppercase block">BILLED & SHIPPED TO</span>
                  <p className="font-bold text-[#0F172A] mt-0.5">{invoiceOrder.customer_name}</p>
                  <p className="text-[#64748B] leading-relaxed mt-0.5">
                    Customer ID reference: {invoiceOrder.customer_id}<br />
                    Enterprise Account Roster Verified
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[9px] font-mono tracking-wider font-bold text-[#94A3B8] uppercase block">TRANSACTION CONTEXT</span>
                  <div className="text-[#64748B]">
                    Payment Status: <strong className={invoiceOrder.payment_status === "Paid" ? "text-[#10B981]" : "text-[#EF4444]"}>{invoiceOrder.payment_status}</strong><br />
                    Delivery Status: <strong>{invoiceOrder.status}</strong><br />
                    Standard terms: Net 15 days
                  </div>
                </div>
              </div>

              {/* LIST ITEMS STYLED */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold tracking-wider text-[#94A3B8] block">LINE STYLE DISPATCHES</span>
                <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] h-7 text-[#64748B] font-semibold">
                        <th className="px-3">Style/SKU Details</th>
                        <th className="px-3 text-center">Qty</th>
                        <th className="px-3 text-right">Wholesale Price</th>
                        <th className="px-3 text-right">Accumulated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-slate-700">
                      {invoiceOrder.items.map((item, idx) => (
                        <tr key={idx} className="h-8">
                          <td className="px-3">
                            <span className="font-bold text-[#0F172A]">{item.name}</span>
                            <span className="font-mono text-[9px] text-[#64748B] block">SKU: {item.sku}</span>
                          </td>
                          <td className="px-3 text-center font-mono">{item.quantity} pcs</td>
                          <td className="px-3 text-right font-mono">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="px-3 text-right font-mono font-semibold text-[#0F172A]">${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FINAL CALCULATION RATIOS */}
              <div className="flex justify-end pt-3">
                <div className="w-48 text-right text-xs space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-[#64748B] font-semibold">Subtotal sum:</span>
                    <span className="font-mono">${invoiceOrder.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B] font-semibold">Tax rate (0.0%):</span>
                    <span className="font-mono">$0.00</span>
                  </div>
                  <div className="flex justify-between border-t border-[#E2E8F0] pt-1.5 text-sm font-bold text-[#0F172A]">
                    <span>Grand Aggregate:</span>
                    <span className="font-mono text-[#2563EB]">${invoiceOrder.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* CORPORATE LEGAL DISCLAIMER TERMS */}
              <div className="border-t border-dashed border-[#E2E8F0] pt-4 text-[9px] text-[#94A3B8] leading-tight text-center">
                This corporate invoice is produced on behalf of FashionHub Cloud network ERP repositories.<br />
                Cargo dispatches coordinate according to Incoterms EXW Sector 4 Depot guidelines.<br />
                Thank you for your valued enterprise partnership.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* POPUP MODAL: CREATE ORDER WIZARD */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-[#2563EB] p-4 flex items-center justify-between text-white">
              <h3 className="font-sans font-bold text-sm">Book wholesale Purchase Order</h3>
              <button onClick={() => setShowCreateModal(false)} className="hover:text-red-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBookOrderSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-semibold rounded-lg">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#E2E8F0]">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Target Wholesale Client *</label>
                  <select
                    value={orderCustId}
                    onChange={e => setOrderCustId(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.full_name} ({c.company_name || "Personal"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Fulfillment Date</label>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={e => setOrderDate(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Initial Ledger Receipt</label>
                  <select
                    value={orderPayment}
                    onChange={e => setOrderPayment(e.target.value as any)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* LINE DETAILS ITEMS */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Order Line Styles Configuration</span>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-[#2563EB] hover:underline font-bold flex items-center gap-0.5"
                  >
                    <Plus size={12} /> Add line style
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {orderItemsLine.map((line, idx) => {
                    const selProd = products.find(p => p.id.toString() === line.product_id);
                    return (
                      <div key={idx} className="flex gap-2 items-center bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0]">
                        <select
                          value={line.product_id}
                          onChange={e => handleLineChange(idx, "product_id", e.target.value)}
                          className="flex-1 bg-white border border-[#E2E8F0] rounded text-xs p-1 outline-none font-sans"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} (${p.price} - Stock: {p.quantity})
                            </option>
                          ))}
                        </select>
                        <div className="w-20">
                          <input
                            type="number"
                            min={1}
                            placeholder="Units"
                            value={line.quantity}
                            onChange={e => handleLineChange(idx, "quantity", parseInt(e.target.value))}
                            className="w-full bg-white border border-[#E2E8F0] rounded text-xs p-1 outline-none text-center font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="text-red-500 hover:text-red-700 font-semibold p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 hover:bg-[#F8FAFC] border border-[#E2E8F0] text-slate-500 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg shadow-sm"
                >
                  Book Bulk Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
