import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, LogIn, ChevronRight, CheckCircle2, UserPlus, Info } from "lucide-react";

export default function AuthPages() {
  const { login, register, error, clearError } = useAuth();

  const [activeForm, setActiveForm] = useState<"login" | "register">("login");

  // Form Fields State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"Admin" | "Manager" | "Employee">("Admin");
  const [success, setSuccess] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess("");
    try {
      await login(username, password);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess("");

    if (password !== confirmPassword) {
      alert("Confirmation passwords do not match.");
      return;
    }

    try {
      await register(username, password, role);
      setSuccess("Account successfully enrolled on local DB. You can now log in!");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setActiveForm("login");
    } catch (err) {
      console.error(err);
    }
  };

  // Quick filler credential triggers for easy testers preview
  const handleQuickInboundFill = (userStr: string, passStr: string) => {
    setUsername(userStr);
    setPassword(passStr);
    clearError();
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB] text-white text-lg font-bold shadow-md mb-3">
          FH
        </div>
        <h2 className="text-xl font-sans font-bold tracking-tight text-[#0F172A]">
          FashionHub ERP-CRM-WMS Tizimi
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Ulgurji kiyim-kechak korxonalari va omborxonalarini boshqarish tizimi.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-sm border border-[#E2E8F0] rounded-2xl sm:px-10 space-y-6">

          {/* TOGGLE FORM SWITCHER */}
          <div className="flex border-b border-[#E2E8F0]">
            <button
              onClick={() => {
                setActiveForm("login");
                clearError();
                setSuccess("");
              }}
              className={`flex-1 pb-3 text-xs font-semibold border-b-2 text-center transition-all cursor-pointer ${
                activeForm === "login"
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Tizimga kirish
            </button>
            <button
              onClick={() => {
                setActiveForm("register");
                clearError();
                setSuccess("");
              }}
              className={`flex-1 pb-3 text-xs font-semibold border-b-2 text-center transition-all cursor-pointer ${
                activeForm === "register"
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Ro'yxatdan o'tish
            </button>
          </div>

          {/* ALERT AND INFOPACKS PANEL */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-[11px] font-semibold rounded-lg flex items-center gap-1.5 animate-pulse">
              <ShieldAlert size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-[11px] font-semibold rounded-lg flex items-center gap-1.5">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeForm === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Foydalanuvchi nomi</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Masalan: admin"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Maxfiy parol</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Parolni kiriting"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2 rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                Tizimga kirish <ChevronRight size={14} />
              </button>
            </form>
          )}

          {/* REGISTRATION FORM */}
          {activeForm === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Foydalanuvchi nomi</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Yorliq uchun unikal nom tanlang"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Ruxsat darajasi (Roli)</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="Admin">Admin (To'liq yuklatilgan huquqlar)</option>
                    <option value="Manager">Menejer (Xodimlarni o'chirishdan tashqari)</option>
                    <option value="Employee">Xodim (Faqat o'qish huquqi)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Parol</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Parol"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Tasdiqlash</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Takrorlang"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2 rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                Ro'yxatdan o'tkazish <UserPlus size={14} />
              </button>
            </form>
          )}

          {/* REVIEWERS TEST CREDENTIALS BOX */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-4 text-xs space-y-2.5">
            <h4 className="font-bold text-[#0F172A] flex items-center gap-1.5">
              <Info size={14} className="text-[#2563EB]" /> Tezkor test ruxsatnomalari (Kirish uchun bosing)
            </h4>
            <p className="text-[#64748B] text-[11px] leading-relaxed">
              Tizimni sinab ko'rish uchun quyidagi rollardan birini bosing; shakl avtomatik to'ldiriladi:
            </p>
            <div className="grid grid-cols-3 gap-2 text-[10px] uppercase font-mono font-bold">
              <button
                type="button"
                onClick={() => handleQuickInboundFill("admin", "admin123")}
                className="bg-[#2563EB]/10 hover:bg-[#2563EB]/20 text-[#2563EB] p-2 rounded border border-[#2563EB]/20 shadow-xs text-center transition-all cursor-pointer"
              >
                ADMIN<br />
                <span className="text-[9px] font-normal text-slate-500 font-sans lowercase">admin / admin123</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickInboundFill("manager", "manager123")}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-2 rounded border border-yellow-200 shadow-xs text-center transition-all cursor-pointer"
              >
                MENEJER<br />
                <span className="text-[9px] font-normal text-slate-500 font-sans lowercase">manager / manager123</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickInboundFill("employee", "employee123")}
                className="bg-green-100 hover:bg-green-200 text-green-800 p-2 rounded border border-green-200 shadow-xs text-center transition-all cursor-pointer"
              >
                XODIM<br />
                <span className="text-[9px] font-normal text-slate-500 font-sans lowercase">employee / employee123</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
