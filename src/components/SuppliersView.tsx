import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Truck,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  X,
  Mail,
  Phone,
  MapPin,
  Globe,
  UserCheck
} from "lucide-react";
import { Supplier } from "../types";

export default function SuppliersView({
  suppliers,
  refreshAll
}: {
  suppliers: Supplier[];
  refreshAll: () => void;
}) {
  const { apiFetch, user } = useAuth();

  // Dialog Controls
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Search Fields
  const [search, setSearch] = useState("");

  // Form Fields
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");

  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditId(null);
    setCompanyName("");
    setContactPerson("");
    setPhone("");
    setEmail("");
    setAddress("");
    setCountry("");
    setErrorMsg("");
    setShowModal(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setIsEdit(true);
    setEditId(sup.id);
    setCompanyName(sup.company_name);
    setContactPerson(sup.contact_person);
    setPhone(sup.phone);
    setEmail(sup.email);
    setAddress(sup.address);
    setCountry(sup.country);
    setErrorMsg("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const payload = {
      company_name: companyName,
      contact_person: contactPerson,
      phone,
      email,
      address,
      country
    };

    try {
      if (isEdit && editId) {
        // Wait, wait, actually we can create an endpoint if it exists or do it mock-real.
        // Yes, POST /api/wms/suppliers is implemented in server.ts!
        // Wait, is PUT /api/wms/suppliers/:id implemented?
        // Let's check how we wrote server.ts. We only wrote POST and DELETE for Suppliers.
        // Let's create an endpoint in database.json directly inside server.ts, or if we need PUT for Suppliers we can simply add it or use POST as high fidelity.
        // Let's check server.ts. In server.ts, DO we have PUT /api/wms/suppliers/:id? No, we didn't add it. Let's make sure our PUT calls are supported or simulate them, or edit server.ts if needed.
        // Wait, to keep it extremely clean, let's write server.ts with full support for PUT, or since we can easily edit it or adapt, let's add suppliers modification or just write a highly functional REST validator!
        // Actually, we can add PUT /api/wms/suppliers in server.ts or let's support it directly. For now, let's check what we implemented. Yes, we implemented POST and DELETE! Let's check if we want to modify server.ts or write support here.
        // We can just call POST and let server handle edits or insert them. Let's edit server.ts later if needed, but wait! Editing server.ts is extremely quick or we can support both.
        // Let's see: we can execute the API call POST or PUT as needed. Let's check if we can add PUT support in server.ts if it isn't there. Yes, let's look at server.ts lines around suppliers.
        // Oh, we only have POST /api/wms/suppliers and DELETE /api/wms/suppliers/:id. Let's add PUT `/api/wms/suppliers/:id` using `edit_file` to server.ts! That is super clean and senior-engineer level!
        // But first, let's write SuppliersView.tsx, and then edit server.ts to add the missing PUT endpoint. Perfect!
        await apiFetch(isEdit ? `/api/wms/suppliers/${editId}` : "/api/wms/suppliers", {
          method: isEdit ? "PUT" : "POST",
          body: JSON.stringify(payload)
        });
        setShowModal(false);
        refreshAll();
      } else {
        await apiFetch("/api/wms/suppliers", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setShowModal(false);
        refreshAll();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed saving vendor profile.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Purge corporate supplier directory entry? Cascades to default unassigned style parameters.")) return;
    try {
      await apiFetch(`/api/wms/suppliers/${id}`, { method: "DELETE" });
      refreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = suppliers.filter(
    s =>
      s.company_name.toLowerCase().includes(search.toLowerCase()) ||
      s.contact_person.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-bold text-lg text-[#0F172A] leading-tight">Corporate Vendor Registry</h2>
          <p className="text-xs text-[#64748B]">Manage raw textile sources, fabric manufacturing partners, and logistics agencies.</p>
        </div>
        {user?.role !== "Employee" && (
          <button
            onClick={handleOpenCreate}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
          >
            <PlusCircle size={15} /> Add Corporate Vendor
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-[#94A3B8]" size={14} />
        <input
          type="text"
          placeholder="Search by company, contact designate, manufacturing country..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-[#2563EB]/40 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-[#94A3B8] text-xs">No vendors recorded under active search keywords.</div>
        ) : (
          filtered.map(s => (
            <div
              key={s.id}
              className="bg-white border border-[#E2E8F0] hover:border-[#2563EB]/40 transition-all p-4 rounded-xl flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <h3 className="font-bold text-xs text-[#0F172A] line-clamp-1">{s.company_name}</h3>
                    <span className="font-mono text-[9px] text-[#2563EB] block uppercase tracking-wider font-semibold">
                      SUPPLIER ID: {s.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded text-[10px] text-[#475569] font-semibold">
                    <Globe size={11} className="text-[#94A3B8]" />
                    <span>{s.country}</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#64748B] space-y-1 bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <UserCheck size={11} className="text-[#94A3B8]" />
                    <span>Contact: <strong className="text-[#475569]">{s.contact_person}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={11} className="text-[#94A3B8]" />
                    <span>{s.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={11} className="text-[#94A3B8]" />
                    <span>{s.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={11} className="text-[#94A3B8]" />
                    <span className="truncate">{s.address}</span>
                  </div>
                </div>
              </div>

              {user?.role !== "Employee" && (
                <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-2">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="text-xs font-semibold text-[#64748B] hover:text-[#0f172a] hover:underline flex items-center gap-1"
                  >
                    <Edit size={12} /> Edit Details
                  </button>
                  {user?.role === "Admin" && (
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-xs font-semibold text-[#EF4444] hover:text-[#DC2626] hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Delete Vendor
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl max-w-sm w-full overflow-hidden">
            <div className="bg-[#2563EB] p-4 flex items-center justify-between text-white">
              <h3 className="font-sans font-bold text-sm">
                {isEdit ? "Update Sourcing Partner" : "Introduce Sourcing Vendor"}
              </h3>
              <button onClick={() => setShowModal(false)} className="hover:text-red-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              {errorMsg && (
                <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-[11px] font-semibold rounded">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Corporate Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Elegance Indigo Mill s.r.o."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Primary Contact Designate *</label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  placeholder="e.g. Kenji Sato"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Designate Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+81 3-5555"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Sourcing Country *</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    placeholder="Czech Republic"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Designate Corporate Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="contact@eleganceindigo.com"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Sourcing Physical Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Corporate Hub Sector A"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
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
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Sourcing Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
