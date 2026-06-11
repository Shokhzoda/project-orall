import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  Search,
  PlusCircle,
  Filter,
  CheckCircle,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building,
  MapPin,
  Clock,
  BookOpen,
  ArrowRight,
  Eye,
  X,
  CreditCard,
  Plus
} from "lucide-react";
import { Customer, CustomerNote, CustomerTimeline, Order } from "../types";

export default function CrmView({
  customers,
  refreshData
}: {
  customers: Customer[];
  refreshData: () => void;
}) {
  const { apiFetch, user } = useAuth();

  // Search, Pagination & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<{
    notes: CustomerNote[];
    timeline: CustomerTimeline[];
    orders: Order[];
  } | null>(null);

  // New Cust note state
  const [newNoteText, setNewNoteText] = useState("");

  // Customer Edit/Create Modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [formIsEdit, setFormIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Form Field States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [status, setStatus] = useState<"Active" | "Lead" | "Inactive">("Active");

  // Fetch full details of individual accounts
  const loadCustomerDetails = async (cust: Customer) => {
    try {
      const data = await apiFetch(`/api/crm/customers/${cust.id}`);
      setSelectedCustomer(cust);
      setSelectedDetails({
        notes: data.notes || [],
        timeline: data.timeline || [],
        orders: data.orders || []
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNoteText.trim()) return;

    try {
      await apiFetch(`/api/crm/customers/${selectedCustomer.id}/notes`, {
        method: "POST",
        body: JSON.stringify({ note: newNoteText })
      });
      setNewNoteText("");
      // Reload details to sync immediately
      loadCustomerDetails(selectedCustomer);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenCreateModal = () => {
    setFormIsEdit(false);
    setEditId(null);
    setFullName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setCity("");
    setCountry("");
    setCompanyName("");
    setStatus("Active");
    setErrorMsg("");
    setShowFormModal(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setFormIsEdit(true);
    setEditId(cust.id);
    setFullName(cust.full_name);
    setPhone(cust.phone);
    setEmail(cust.email);
    setAddress(cust.address);
    setCity(cust.city);
    setCountry(cust.country);
    setCompanyName(cust.company_name || "");
    setStatus(cust.status);
    setErrorMsg("");
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const payload = {
      full_name: fullName,
      phone,
      email,
      address,
      city,
      country,
      company_name: companyName || null,
      status
    };

    try {
      if (formIsEdit && editId) {
        await apiFetch(`/api/crm/customers/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch("/api/crm/customers", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      setShowFormModal(false);
      refreshData();
      if (selectedCustomer && selectedCustomer.id === editId) {
        // Refresh detail state
        const updated = { ...selectedCustomer, ...payload };
        loadCustomerDetails(updated);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred compiling changes.");
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!window.confirm("Are you positive you wish to remove this customer roster profile? This cascading event cannot be reverted.")) return;
    try {
      await apiFetch(`/api/crm/customers/${id}`, {
        method: "DELETE"
      });
      setSelectedCustomer(null);
      setSelectedDetails(null);
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter List calculations
  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.full_name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.company_name && c.company_name.toLowerCase().includes(term));

    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination indexing
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentList = filteredCustomers.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
      {/* LEFT COLUMN: CLIENT DIRECTORY & GRID */}
      <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-sans font-bold text-lg text-[#0F172A] tracking-tight">CRM Customer Directory</h2>
            <p className="text-xs text-[#64748B]">Manage accounts, sales pipelines and follow-up activities.</p>
          </div>
          {user?.role !== "Employee" && (
            <button
              onClick={handleOpenCreateModal}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle size={15} /> Add Customer
            </button>
          )}
        </div>

        {/* SEARCH & FILTER COMPONENT BAR */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-[#94A3B8]" size={14} />
            <input
              type="text"
              placeholder="Search by name, wholesale company, account email..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-[#2563EB]/40 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#64748B]" />
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#2563EB]/40 outline-none text-[#64748B]"
            >
              <option value="ALL">Show All Lifecycles</option>
              <option value="Active">Active Partnerships</option>
              <option value="Lead">Wholesale Leads</option>
              <option value="Inactive">Cold Accounts</option>
            </select>
          </div>
        </div>

        {/* CUST TABLE */}
        <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold h-10 bg-[#F8FAFC]">
                <th className="px-4">Profile Name</th>
                <th className="px-4">Corporate Entity</th>
                <th className="px-4">Contact</th>
                <th className="px-4 text-center">Partnership Status</th>
                <th className="px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {currentList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-[#94A3B8] font-medium">
                    No customers met search parameters in memory.
                  </td>
                </tr>
              ) : (
                currentList.map(c => (
                  <tr
                    key={c.id}
                    className={`h-12 hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                      selectedCustomer?.id === c.id ? "bg-[#2563EB]/5" : ""
                    }`}
                    onClick={() => loadCustomerDetails(c)}
                  >
                    <td className="px-4">
                      <p className="font-semibold text-[#0F172A]">{c.full_name}</p>
                      <span className="text-[10px] text-[#64748B] font-mono">ID: {c.id}</span>
                    </td>
                    <td className="px-4">
                      <div className="flex items-center gap-1.5">
                        <Building size={12} className="text-[#94A3B8]" />
                        <span className="font-medium text-[#64748B]">{c.company_name || "Personal Portfolio"}</span>
                      </div>
                    </td>
                    <td className="px-4 space-y-0.5 text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1 leading-none text-[#475569]">
                        <Mail size={10} /> {c.email}
                      </div>
                      <div className="flex items-center gap-1 leading-none text-[#64748B]">
                        <Phone size={10} /> {c.phone}
                      </div>
                    </td>
                    <td className="px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === "Active"
                            ? "bg-[#10B981]/15 text-[#10B981]"
                            : c.status === "Lead"
                            ? "bg-[#0EA5E9]/15 text-[#0EA5E9]"
                            : "bg-[#94A3B8]/15 text-[#64748B]"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 text-right space-x-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => loadCustomerDetails(c)}
                        className="text-[#3b82f6] hover:text-[#2563eb] font-semibold"
                        title="Inspect Dashboard"
                      >
                        <Eye size={14} className="inline" />
                      </button>
                      {user?.role !== "Employee" && (
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="text-[#64748B] hover:text-[#0F172A]"
                          title="Edit Registry"
                        >
                          <Edit size={14} className="inline" />
                        </button>
                      )}
                      {user?.role === "Admin" && (
                        <button
                          onClick={() => handleDeleteCustomer(c.id)}
                          className="text-[#EF4444] hover:text-[#DC2626]"
                          title="Unsafe Purge"
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

        {/* PAGINATION LAYOUT WRAPPER */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs pt-3">
            <span className="text-[#64748B]">
              Showing page {currentPage} of {totalPages} ({filteredCustomers.length} total rosters)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-2.5 py-1 bg-white border border-[#E2E8F0] rounded hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-600"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-2.5 py-1 bg-white border border-[#E2E8F0] rounded hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: ACTIVE ACCOUNT DETAILS, NOTES & HISTORICAL POs */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-6">
        {!selectedCustomer ? (
          <div className="h-96 flex flex-col items-center justify-center text-center text-[#94A3B8]">
            <Users size={32} className="mb-2 stroke-1 text-slate-300" />
            <p className="text-xs font-semibold">Select a customer profile</p>
            <p className="text-[10px] text-[#64748B] max-w-56 mt-0.5">Click any client row in the ledger to query full notes history, purchase timelines, and dynamic financials.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* COMPACT CARD HEADER */}
            <div className="border-b border-[#E2E8F0] pb-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-sans font-bold text-base text-[#0F172A] leading-tight">{selectedCustomer.full_name}</h3>
                  <span className="font-mono text-[9px] text-[#94A3B8]">CRM ACCOUNT ID: {selectedCustomer.id}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedCustomer.status === "Active"
                      ? "bg-[#10B981]/10 text-[#10B981]"
                      : selectedCustomer.status === "Lead"
                      ? "bg-[#0EA5E9]/10 text-[#0EA5E9]"
                      : "bg-[#94A3B8]/10 text-[#64748B]"
                  }`}
                >
                  {selectedCustomer.status}
                </span>
              </div>

              <div className="text-[11px] text-[#64748B] space-y-1 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <Building size={11} className="text-[#94A3B8]" />
                  <span>Company: <strong className="text-[#475569]">{selectedCustomer.company_name || "N/A"}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={11} className="text-[#94A3B8]" />
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={11} className="text-[#94A3B8]" />
                  <span>{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={11} className="text-[#94A3B8]" />
                  <span className="truncate">{selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.country}</span>
                </div>
              </div>
            </div>

            {/* ORDER HISTORY LOGS SUMMARY */}
            <div className="space-y-2">
              <h4 className="text-[11px] uppercase font-mono font-bold tracking-wider text-[#94A3B8] flex items-center gap-1">
                <CreditCard size={11} /> Historical Bulk POs({selectedDetails?.orders.length || 0})
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {!selectedDetails?.orders || selectedDetails.orders.length === 0 ? (
                  <p className="text-[10px] text-[#94A3B8] italic">No transaction records logged.</p>
                ) : (
                  selectedDetails.orders.map(o => (
                    <div key={o.id} className="flex justify-between items-center text-xs p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div>
                        <span className="font-mono font-bold text-[#2563EB]">#{o.id}</span>
                        <span className="text-[10px] text-[#64748B] block">{o.order_date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-semibold text-[#0F172A] block">${o.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <span className="text-[9px] font-semibold text-[#10B981]">{o.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* NOTES ACCUMULATOR */}
            <div className="space-y-3">
              <h4 className="text-[11px] uppercase font-mono font-bold tracking-wider text-[#94A3B8] flex items-center gap-1">
                <BookOpen size={11} /> Team Follow-up Notes
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {!selectedDetails?.notes || selectedDetails.notes.length === 0 ? (
                  <p className="text-[10px] text-[#94A3B8] italic">No prior conversation entries posted yet.</p>
                ) : (
                  selectedDetails.notes.map(n => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 relative">
                      <p className="text-xs text-[#334155] leading-relaxed">{n.note}</p>
                      <div className="flex items-center justify-between text-[9px] text-[#94A3B8] font-semibold">
                        <span>By: {n.created_by}</span>
                        <span>{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* POST NOTE FORM FIELD */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type follow-up notations..."
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]/40"
                />
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white p-1.5 rounded-lg text-xs"
                >
                  <Plus size={15} />
                </button>
              </form>
            </div>

            {/* TIMELINE ACTIVITIES */}
            <div className="space-y-3 border-t border-[#E2E8F0] pt-4">
              <h4 className="text-[11px] uppercase font-mono font-bold tracking-wider text-[#94A3B8] flex items-center gap-1">
                <Clock size={11} /> Activity Milestones
              </h4>
              <div className="relative pl-4 space-y-4 border-l border-[#E2E8F0] max-h-40 overflow-y-auto">
                {!selectedDetails?.timeline || selectedDetails.timeline.length === 0 ? (
                  <p className="text-[10px] text-[#94A3B8] italic">No actions recorded on profile timeline.</p>
                ) : (
                  selectedDetails.timeline.map(t => (
                    <div key={t.id} className="relative space-y-0.5">
                      <span className="absolute -left-5.5 top-1 w-2.5 h-2.5 rounded-full bg-[#2563EB] border border-white"></span>
                      <p className="text-xs font-semibold text-[#0F172A]">{t.activity_type}</p>
                      <p className="text-[11px] text-[#64748B] leading-tight">{t.description}</p>
                      <span className="text-[9px] font-mono text-[#94A3B8] block">{new Date(t.created_at).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* POPUP POPUP MODAL: CREATE AND EDIT USERS CUSTOMERS */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-[#2563EB] p-4 flex items-center justify-between text-white">
              <h3 className="font-sans font-bold text-sm">
                {formIsEdit ? "Update Client Roster Ledger" : "Introduce Wholesale Client Profile"}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="hover:text-red-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-semibold rounded-lg">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Full Legal Name/Key Contact *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Jameson Reynolds"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Partner Wholesale Company</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. Pacific Coast Wholesale"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Enterprise Level Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="Active">Active Partner</option>
                    <option value="Lead">Wholesale Lead</option>
                    <option value="Inactive">Cold Account</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Account Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. buyer@boutique.com"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Mobile / Contact Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 301-4491"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Corporate Ship-To Address *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="e.g. 1042 Garment Row Boulevard, Port Area"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Billing City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. Los Angeles"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Country *</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    placeholder="e.g. United States"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 hover:bg-[#F8FAFC] border border-[#E2E8F0] text-slate-500 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Profile Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
