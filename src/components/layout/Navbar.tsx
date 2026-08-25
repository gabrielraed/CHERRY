import React from "react";
import { useApp } from "../../context/AppContext";
import {
  Search,
  Sparkles,
  Bell,
  Building2,
  UserCheck,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";

interface NavbarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const {
    currentOrg,
    organizations,
    setCurrentOrgId,
    currentUser,
    users,
    setCurrentUserId,
    alerts,
    setIsSearchOpen,
    setIsAiDrawerOpen,
    resetToDemoData,
    setActiveTab,
  } = useApp();

  const criticalAlertsCount = alerts.filter((a) => a.severity === "CRITICO").length;

  return (
    <header id="main-navbar" className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#1A1A1A]/10 bg-[#F9F7F2] px-4 md:px-8 text-[#1A1A1A]">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-3.5">
        <button
          id="btn-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A] lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div
          id="brand-logo"
          onClick={() => setActiveTab("dashboard")}
          className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-85"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1A1A1A] text-white shadow-xs">
            <span className="font-serif font-black text-base italic text-[#F9F7F2]">C</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold tracking-tight text-[#1A1A1A]">
                CHERRY <span className="italic font-normal">TOST</span>
              </span>
              <span className="font-sans text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8E2030] bg-[#8E2030]/10 px-1.5 py-0.5 rounded border border-[#8E2030]/20">
                PRO
              </span>
            </div>
            <p className="font-sans text-[9px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]/50 hidden sm:block">
              Coffee Business Operating System
            </p>
          </div>
        </div>
      </div>

      {/* Global Search Bar (Trigger) */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <button
          id="btn-global-search-trigger"
          onClick={() => setIsSearchOpen(true)}
          className="flex w-full items-center justify-between rounded-lg border border-[#1A1A1A]/12 bg-white px-3.5 py-2 text-xs text-[#1A1A1A]/60 shadow-2xs hover:border-[#1A1A1A]/30 hover:text-[#1A1A1A] transition-all"
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-[#1A1A1A]/40" />
            <span className="font-sans">Buscar cliente, máquina (ej: M-00231), pedido...</span>
          </span>
          <kbd className="rounded border border-[#1A1A1A]/15 bg-[#F2EFE9] px-1.5 py-0.5 text-[10px] font-mono text-[#1A1A1A]/70">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Action Buttons & Tenant / Role Switcher */}
      <div className="flex items-center gap-2.5">
        {/* Mobile Search Icon */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex md:hidden rounded-lg p-2 text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A]"
          aria-label="Buscar"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* CHERRY AI Copilot Button (Editorial Accent) */}
        <button
          id="btn-cherry-ai-trigger"
          onClick={() => setIsAiDrawerOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#8E2030] active:scale-98 transition-all"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#E5A93C]" />
          <span className="font-sans text-[11px] uppercase tracking-[0.15em] font-semibold">Cherry AI</span>
        </button>

        {/* Alert Bell */}
        <button
          id="btn-alert-bell"
          onClick={() => setActiveTab("dashboard")}
          className="relative rounded-lg border border-[#1A1A1A]/10 bg-white p-2 text-[#1A1A1A]/70 hover:bg-[#F2EFE9] hover:text-[#1A1A1A] transition-colors shadow-2xs"
          title={`${alerts.length} Alertas del Sistema`}
        >
          <Bell className="h-4 w-4" />
          {criticalAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#8E2030] text-[9px] font-bold text-white ring-2 ring-[#F9F7F2]">
              {criticalAlertsCount}
            </span>
          )}
        </button>

        {/* Organization Multi-Tenant Switcher */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#1A1A1A]/10 bg-white px-2.5 py-1.5 shadow-2xs">
          <Building2 className="h-3.5 w-3.5 text-[#8E2030]" />
          <select
            id="select-organization"
            value={currentOrg.id}
            onChange={(e) => setCurrentOrgId(e.target.value)}
            className="bg-transparent text-xs font-medium text-[#1A1A1A] outline-none cursor-pointer"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id} className="bg-white text-[#1A1A1A]">
                {org.name}
              </option>
            ))}
          </select>
        </div>

        {/* Role & User Switcher */}
        <div className="flex items-center gap-1.5 rounded-lg border border-[#1A1A1A]/10 bg-white px-2.5 py-1.5 shadow-2xs">
          <UserCheck className="h-3.5 w-3.5 text-[#C2823D]" />
          <select
            id="select-user-role"
            value={currentUser.id}
            onChange={(e) => setCurrentUserId(e.target.value)}
            className="bg-transparent text-xs font-medium text-[#1A1A1A] outline-none cursor-pointer max-w-[140px] truncate"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id} className="bg-white text-[#1A1A1A]">
                {u.role.replace("_", " ")}: {u.name.split(" ")[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Demo Button */}
        <button
          id="btn-reset-demo"
          onClick={() => {
            if (confirm("¿Deseas restaurar la base de datos a los datos de demo iniciales?")) {
              resetToDemoData();
            }
          }}
          className="hidden xl:flex items-center gap-1 rounded-lg border border-[#1A1A1A]/10 bg-white p-2 text-[#1A1A1A]/50 hover:bg-[#F2EFE9] hover:text-[#1A1A1A] text-xs shadow-2xs"
          title="Restaurar datos demo"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
};
