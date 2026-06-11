import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Briefcase,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  X,
  Mail,
  Phone,
  Calendar,
  Contact,
  DollarSign
} from "lucide-react";
import { Employee } from "../types";

export default function EmployeesView({
  employees,
  refreshAll
}: {
  employees: Employee[];
  refreshAll: () => void;
}) {
  const { apiFetch, user } = useAuth();

  // Modal State Control
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Search filter
  const [search, setSearch] = useState("");

  // Form Fields holding
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [salary, setSalary] = useState(0);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [joiningDate, setJoiningDate] = useState("");

  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditId(null);
    setFullName("");
    setPosition("");
    setDepartment("Logistics & WMS");
    setSalary(55000);
    setPhone("");
    setEmail("");
    setAddress("");
    setJoiningDate(new Date().toISOString().split("T")[0]);
    setError("");
    setShowModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setIsEdit(true);
    setEditId(emp.id);
    setFullName(emp.full_name);
    setPosition(emp.position);
    setDepartment(emp.department);
    setSalary(emp.salary);
    setPhone(emp.phone);
    setEmail(emp.email);
    setAddress(emp.address);
    setJoiningDate(emp.joining_date);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = {
      full_name: fullName,
      position,
      department,
      salary,
      phone,
      email,
      address,
      joining_date: joiningDate
    };

    try {
      if (isEdit && editId) {
        await apiFetch(`/api/erp/employees/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch("/api/erp/employees", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      setShowModal(false);
      refreshAll();
    } catch (err: any) {
      setError(err.message || "Failed saving employee profile details.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Purge staff registry listing? Payroll metrics calculations will automatically modify.")) return;
    try {
      await apiFetch(`/api/erp/employees/${id}`, { method: "DELETE" });
      refreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Basic search filters
  const filtered = employees.filter(
    e =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  // Stats computation
  const totalSalaries = employees.reduce((acc, curr) => acc + curr.salary, 0);
  const averageSalary = employees.length > 0 ? Math.round(totalSalaries / employees.length) : 0;

  return (
    <div className="space-y-6">
      {/* QUICK HR ACCUMULATORS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total staff */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#94A3B8]">Staff Roster Count</span>
            <p className="font-sans font-bold text-lg text-[#0F172A] mt-0.5">{employees.length} active members</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#2563EB]/5 flex items-center justify-center text-[#2563EB]">
            <Briefcase size={16} />
          </div>
        </div>

        {/* Total salaries payroll */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#94A3B8]">Annualized Payroll Burden</span>
            <p className="font-sans font-bold text-lg text-[#0F172A] mt-0.5">${totalSalaries.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#10B981]/5 flex items-center justify-center text-[#10B981]">
            <DollarSign size={16} />
          </div>
        </div>

        {/* Average salary */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#94A3B8]">Average Salary Grade</span>
            <p className="font-sans font-bold text-lg text-[#0F172A] mt-0.5">${averageSalary.toLocaleString()}/yr</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#0EA5E9]/5 flex items-center justify-center text-[#0EA5E9]">
            <Calendar size={16} />
          </div>
        </div>
      </div>

      {/* SEARCH AND CONTROL BAR */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-sans font-bold text-lg text-[#0F172A] leading-tight">HR Staff Directory</h2>
            <p className="text-xs text-[#64748B]">Manage staffing roles, salaries grades, and joining milestones.</p>
          </div>
          {user?.role !== "Employee" && (
            <button
              onClick={handleOpenCreate}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
            >
              <PlusCircle size={15} /> Add Employee Profile
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-[#94A3B8]" size={14} />
          <input
            type="text"
            placeholder="Search by legal name, role positions, department context..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-[#2563EB]/40 outline-none"
          />
        </div>

        {/* DATA LEDGER TABLE */}
        <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold h-10 bg-[#F8FAFC]">
                <th className="px-4">Employee Legal Profile</th>
                <th className="px-4">Role &amp; Department</th>
                <th className="px-4 text-right">Annual Salary Grade</th>
                <th className="px-4">Designate Contact</th>
                <th className="px-4">Joining Date</th>
                <th className="px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[#94A3B8]">
                    No employees active under current search query filters.
                  </td>
                </tr>
              ) : (
                filtered.map(emp => (
                  <tr key={emp.id} className="h-12 hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4">
                      <p className="font-bold text-[#0F172A]">{emp.full_name}</p>
                      <span className="font-mono text-[9px] text-[#94A3B8]">ID REFERENCE: FH-EMP-{emp.id}</span>
                    </td>
                    <td className="px-4">
                      <p className="font-medium text-[#475569]">{emp.position}</p>
                      <span className="inline-block px-1.5 py-0.5 bg-[#F1F5F9] rounded text-[9px] text-[#64748B] font-mono font-semibold">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-4 text-right font-mono font-semibold text-[#0F172A]">
                      ${emp.salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 space-y-0.5 text-[10px] text-slate-500">
                      <div className="flex items-center gap-1 text-[#475569]">
                        <Mail size={10} /> {emp.email}
                      </div>
                      <div className="flex items-center gap-1 text-[#64748B]">
                        <Phone size={10} /> {emp.phone}
                      </div>
                    </td>
                    <td className="px-4 text-[#64748B] font-medium">{emp.joining_date}</td>
                    <td className="px-4 text-right space-x-2">
                      {user?.role !== "Employee" && (
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="text-[#64748B] hover:text-[#0F172A] font-semibold"
                          title="Modify Ledger"
                        >
                          <Edit size={14} className="inline" />
                        </button>
                      )}
                      {user?.role === "Admin" && (
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="text-[#EF4444] hover:text-[#DC2626] font-semibold"
                          title="Unsafe Purge Staff"
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

      {/* POPUP MODAL: DYNAMIC HR ROSTERING */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-[#2563EB] p-4 flex items-center justify-between text-white">
              <h3 className="font-sans font-bold text-sm">
                {isEdit ? "Update Personnel File" : "Enroll Staff Member"}
              </h3>
              <button onClick={() => setShowModal(false)} className="hover:text-red-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-[11px] font-semibold rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Eleanor Crosby"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Enterprise Position *</label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    placeholder="e.g. Warehouse Lead Assortment"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Department Division *</label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="Logistics & WMS">Logistics &amp; WMS</option>
                    <option value="Design & Sourcing">Design &amp; Sourcing</option>
                    <option value="Finance & ERP">Finance &amp; ERP</option>
                    <option value="Human Resources Operations">HR Operations</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Annualized Base Salary ($) *</label>
                  <input
                    type="number"
                    required
                    value={salary}
                    onChange={e => setSalary(parseFloat(e.target.value))}
                    placeholder="Base annual salaries grade"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Enrollment Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={joiningDate}
                    onChange={e => setJoiningDate(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. employee@fashionhub.com"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Primary Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (555) 791-2292"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Physical Address Coordinates *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Physical residential coordinates address"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
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
                  Save Personnel File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
