import React from "react";
import { useApp } from "../../context/AppContext";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShoppingCart,
  Coffee,
  Factory,
  Package,
  Cpu,
  Wrench,
  Truck,
  Receipt,
  PiggyBank,
  CreditCard,
  BarChart3,
  Sparkles,
  Settings,
  Store,
  MapPin,
} from "lucide-react";

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const {
    activeTab,
    setActiveTab,
    orders,
    machines,
    serviceTickets,
    customers,
    currentUser,
  } = useApp();

  const pendingOrdersCount = orders.filter(
    (o) => o.status !== "Entregado" && o.status !== "Facturado" && o.status !== "Cobrado" && o.status !== "Cancelado"
  ).length;

  const deliveredUninvoicedCount = orders.filter((o) => o.isDeliveredUninvoiced).length;
  const machinesServiceCount = machines.filter(
    (m) => m.status === "Requiere Mantenimiento" || m.status === "En Service"
  ).length;
  const openTicketsCount = serviceTickets.filter((t) => t.status !== "Cerrado" && t.status !== "Resuelto").length;
  const riskCustomersCount = customers.filter((c) => c.scoring === "Riesgo" || c.scoring === "Riesgo Crítico").length;

  const navItems = [
    { id: "dashboard", label: "Dashboard (Control Total)", icon: LayoutDashboard, badge: null },
    { id: "customers", label: "Clientes / CRM 360", icon: Users, badge: riskCustomersCount > 0 ? `${riskCustomersCount} riesgo` : null, badgeColor: "bg-[#8E2030]/10 text-[#8E2030] border border-[#8E2030]/30" },
    { id: "geomap", label: "Mapa & Rutas de Visita", icon: MapPin, badge: "GPS", badgeColor: "bg-[#8E2030] text-white font-semibold" },
    { id: "preventa", label: "Preventa (Mi Día)", icon: Briefcase, badge: "Ruta", badgeColor: "bg-[#1A1A1A]/10 text-[#1A1A1A] border border-[#1A1A1A]/20" },
    { id: "orders", label: "Pedidos & Backlog", icon: ShoppingCart, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : null, badgeColor: "bg-[#8E2030] text-white font-semibold" },
    { id: "production", label: "Producción & Tueste", icon: Factory, badge: null },
    { id: "machines", label: "Máquinas & Rentabilidad", icon: Cpu, badge: machinesServiceCount > 0 ? `${machinesServiceCount}` : null, badgeColor: "bg-[#C2823D] text-white font-semibold" },
    { id: "service", label: "Servicio Técnico", icon: Wrench, badge: openTicketsCount > 0 ? `${openTicketsCount}` : null, badgeColor: "bg-[#1A1A1A] text-white font-semibold" },
    { id: "logistics", label: "Logística & Reparto", icon: Truck, badge: null },
    { id: "billing", label: "Facturación", icon: Receipt, badge: deliveredUninvoicedCount > 0 ? `${deliveredUninvoicedCount} s/fact` : null, badgeColor: "bg-[#8E2030] text-white font-semibold animate-pulse" },
    { id: "current-account", label: "Cuenta Corriente", icon: PiggyBank, badge: null },
    { id: "collections", label: "Cobranzas", icon: CreditCard, badge: null },
    { id: "portal", label: "Portal del Cliente", icon: Store, badge: "Cliente", badgeColor: "bg-emerald-950/10 text-emerald-800 border border-emerald-700/30" },
    { id: "ai", label: "Cherry AI Copilot", icon: Sparkles, badge: "Gemini", badgeColor: "bg-[#8E2030]/10 text-[#8E2030] border border-[#8E2030]/30" },
  ];

  const handleSelect = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#1A1A1A]/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed lg:static top-16 bottom-0 left-0 z-40 w-64 flex-col border-r border-[#1A1A1A]/10 bg-[#F9F7F2] p-4 transition-transform duration-200 ease-in-out lg:flex text-[#1A1A1A] ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {/* User badge preview */}
          <div className="mb-4 rounded-xl border border-[#1A1A1A]/10 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-3">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-lg object-cover ring-1 ring-[#1A1A1A]/15"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A1A1A] text-white font-serif font-bold text-xs italic">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#1A1A1A]">{currentUser.name}</p>
                <p className="truncate font-sans text-[9px] uppercase tracking-[0.15em] font-semibold text-[#8E2030]">
                  {currentUser.role.replace("_", " ")}
                </p>
              </div>
            </div>
          </div>

          <div className="px-2 py-1.5 font-sans text-[9px] uppercase tracking-[0.25em] font-bold text-[#1A1A1A]/40">
            Navegación
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-all ${
                  isActive
                    ? "bg-[#1A1A1A] text-white font-semibold shadow-xs"
                    : "text-[#1A1A1A]/75 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-[#1A1A1A]/50 group-hover:text-[#1A1A1A]"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] font-semibold ${
                      isActive ? "bg-white/20 text-white" : item.badgeColor || "bg-[#1A1A1A]/10 text-[#1A1A1A]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Operational Status Footer */}
        <div className="mt-auto pt-3 border-t border-[#1A1A1A]/10 text-[#1A1A1A]/50 text-[10px] flex items-center justify-between px-2">
          <span className="flex items-center gap-1.5 text-[#1A1A1A]/80 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
            Sistema en Línea
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#1A1A1A]/40">v2.4 PRO</span>
        </div>
      </aside>
    </>
  );
};
