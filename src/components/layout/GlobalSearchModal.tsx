import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Search,
  X,
  Users,
  Cpu,
  ShoppingCart,
  Coffee,
  ArrowRight,
} from "lucide-react";

interface GlobalSearchModalProps {
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onClose }) => {
  const {
    customers,
    machines,
    orders,
    products,
    setSelectedCustomerId,
    setSelectedMachineId,
    setActiveTab,
  } = useApp();

  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const q = query.trim().toLowerCase();

  const matchedCustomers = q
    ? customers
        .filter(
          (c) =>
            c.commercialName.toLowerCase().includes(q) ||
            c.legalName.toLowerCase().includes(q) ||
            c.code.toLowerCase().includes(q) ||
            c.taxId.includes(q) ||
            c.zone.toLowerCase().includes(q)
        )
        .slice(0, 5)
    : [];

  const matchedMachines = q
    ? machines
        .filter(
          (m) =>
            m.serialNumber.toLowerCase().includes(q) ||
            m.model.toLowerCase().includes(q) ||
            m.brand.toLowerCase().includes(q) ||
            (m.customerName && m.customerName.toLowerCase().includes(q))
        )
        .slice(0, 5)
    : [];

  const matchedOrders = q
    ? orders
        .filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.status.toLowerCase().includes(q)
        )
        .slice(0, 5)
    : [];

  const matchedProducts = q
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.origin.toLowerCase().includes(q) ||
            p.variety.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
        )
        .slice(0, 5)
    : [];

  const hasResults =
    matchedCustomers.length > 0 ||
    matchedMachines.length > 0 ||
    matchedOrders.length > 0 ||
    matchedProducts.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#1A1A1A]/40 p-4 pt-16 sm:pt-24 backdrop-blur-xs text-[#1A1A1A]">
      <div className="relative w-full max-w-2xl rounded-xl border border-[#1A1A1A]/10 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-[#1A1A1A]/10 bg-[#F9F7F2] px-4 py-3.5">
          <Search className="h-5 w-5 text-[#8E2030]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente, máquina (ej: M-00231), pedido, café..."
            className="flex-1 bg-transparent font-sans text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/40 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="rounded p-1 text-[#1A1A1A]/40 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block rounded border border-[#1A1A1A]/15 bg-[#F2EFE9] px-1.5 py-0.5 font-mono text-[10px] text-[#1A1A1A]/70">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs font-sans">
          {!q && (
            <div className="py-8 text-center text-[#1A1A1A]/50">
              <p className="font-serif text-sm italic">Escribe para buscar en todo el sistema de Cherry Tost</p>
              <p className="text-[11px] mt-1 text-[#1A1A1A]/40">Clientes • Máquinas • Pedidos • Variedades de Café</p>
            </div>
          )}

          {q && !hasResults && (
            <div className="py-8 text-center text-[#1A1A1A]/50">
              <p className="font-serif text-sm">No se encontraron resultados para &quot;{query}&quot;</p>
              <p className="text-[11px] mt-1 text-[#1A1A1A]/40">Verifica la ortografía o intenta con otro término</p>
            </div>
          )}

          {/* Customers Section */}
          {matchedCustomers.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 pb-2 text-[10px] uppercase tracking-[0.15em] font-semibold text-[#8E2030]">
                <Users className="h-3.5 w-3.5" />
                <span>Clientes ({matchedCustomers.length})</span>
              </div>
              <div className="space-y-1">
                {matchedCustomers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomerId(c.id);
                      setActiveTab("customers");
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-lg p-2.5 hover:bg-[#F9F7F2] transition-colors text-left border border-transparent hover:border-[#1A1A1A]/10"
                  >
                    <div>
                      <span className="font-medium text-[#1A1A1A]">{c.commercialName}</span>
                      <span className="ml-2 font-mono text-[10px] text-[#1A1A1A]/50">({c.code})</span>
                      <p className="text-[11px] text-[#1A1A1A]/60 mt-0.5">
                        {c.zone} • {c.segment} • Consumo: {c.avgMonthlyKg} kg/m
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-[#1A1A1A]/30" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Machines Section */}
          {matchedMachines.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 pb-2 text-[10px] uppercase tracking-[0.15em] font-semibold text-[#C2823D]">
                <Cpu className="h-3.5 w-3.5" />
                <span>Máquinas & Comodatos ({matchedMachines.length})</span>
              </div>
              <div className="space-y-1">
                {matchedMachines.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMachineId(m.id);
                      setActiveTab("machines");
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-lg p-2.5 hover:bg-[#F9F7F2] transition-colors text-left border border-transparent hover:border-[#1A1A1A]/10"
                  >
                    <div>
                      <span className="font-medium text-[#1A1A1A]">{m.brand} {m.model}</span>
                      <span className="ml-2 font-mono text-[10px] text-[#1A1A1A]/50">[{m.serialNumber}]</span>
                      <p className="text-[11px] text-[#1A1A1A]/60 mt-0.5">
                        {m.modality} • {m.customerName ? `Instalada en: ${m.customerName}` : "En Depósito"}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-[#1A1A1A]/30" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Orders Section */}
          {matchedOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 pb-2 text-[10px] uppercase tracking-[0.15em] font-semibold text-[#1A1A1A]">
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>Pedidos ({matchedOrders.length})</span>
              </div>
              <div className="space-y-1">
                {matchedOrders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setActiveTab("orders");
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-lg p-2.5 hover:bg-[#F9F7F2] transition-colors text-left border border-transparent hover:border-[#1A1A1A]/10"
                  >
                    <div>
                      <span className="font-semibold text-[#1A1A1A]">{o.orderNumber}</span>
                      <span className="ml-2 text-[#1A1A1A]/70">{o.customerName}</span>
                      <p className="text-[11px] text-[#1A1A1A]/60 mt-0.5">
                        Estado: {o.status} • Total: ${o.totalAmount} ({o.totalKg} kg)
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-[#1A1A1A]/30" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Section */}
          {matchedProducts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 pb-2 text-[10px] uppercase tracking-[0.15em] font-semibold text-[#8E2030]">
                <Coffee className="h-3.5 w-3.5" />
                <span>Catálogo de Café ({matchedProducts.length})</span>
              </div>
              <div className="space-y-1">
                {matchedProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveTab("production");
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-lg p-2.5 hover:bg-[#F9F7F2] transition-colors text-left border border-transparent hover:border-[#1A1A1A]/10"
                  >
                    <div>
                      <span className="font-medium text-[#1A1A1A]">{p.name}</span>
                      <span className="ml-2 font-mono text-[10px] text-[#1A1A1A]/50">[{p.sku}]</span>
                      <p className="text-[11px] text-[#1A1A1A]/60 mt-0.5">
                        {p.origin} • {p.variety} • Tueste {p.roastProfile} • Stock: {p.stockKg} kg
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-[#1A1A1A]/30" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
