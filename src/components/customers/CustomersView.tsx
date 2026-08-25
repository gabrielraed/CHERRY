import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Customer } from "../../types";
import { Customer360Modal } from "./Customer360Modal";
import { CustomerFormModal } from "./CustomerFormModal";
import {
  Search,
  Plus,
  TrendingDown,
  TrendingUp,
  MapPin,
  Cpu,
  RotateCcw,
  Eye,
} from "lucide-react";

export const CustomersView: React.FC = () => {
  const {
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    repeatLastCustomerOrder,
    setActiveTab,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [scoringFilter, setScoringFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  // If a customer was pre-selected from another view
  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || null;

  const filteredCustomers = customers.filter((c) => {
    const matchText =
      c.commercialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.taxId.includes(searchTerm) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.zone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSegment = segmentFilter === "all" || c.segment === segmentFilter;
    const matchScoring = scoringFilter === "all" || c.scoring === scoringFilter;
    const matchStatus = statusFilter === "all" || c.status === statusFilter;

    return matchText && matchSegment && matchScoring && matchStatus;
  });

  const handleQuickRepeat = (e: React.MouseEvent, customerId: string) => {
    e.stopPropagation();
    const newOrder = repeatLastCustomerOrder(customerId);
    if (newOrder) {
      alert(`¡Pedido ${newOrder.orderNumber} generado con éxito por $${newOrder.totalAmount}!`);
      setActiveTab("orders");
    }
  };

  return (
    <div className="space-y-6 pb-16 text-[#1A1A1A]">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-[#1A1A1A]/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8E2030]">
              Directorio Comercial
            </span>
            <span className="h-1 w-1 rounded-full bg-[#1A1A1A]/30"></span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]/50">
              {filteredCustomers.length} de {customers.length} cuentas
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Clientes <span className="italic font-normal">&amp; CRM 360°</span>
          </h1>
          <p className="font-sans text-xs text-[#1A1A1A]/60 mt-1">
            Control de cuentas, perfiles 360, análisis de consumo histórico y parque de comodatos
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab("geomap")}
            className="flex items-center gap-2 rounded-lg border border-[#8E2030]/30 bg-white px-3.5 py-2 text-xs font-semibold text-[#8E2030] hover:bg-[#8E2030]/10 active:scale-98 transition-all shadow-2xs"
          >
            <MapPin className="h-4 w-4 text-[#8E2030]" />
            <span className="font-sans text-[11px] uppercase tracking-[0.15em]">Mapa &amp; Rutas</span>
          </button>
          <button
            onClick={() => {
              setCustomerToEdit(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-[#1A1A1A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#8E2030] active:scale-98 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="font-sans text-[11px] uppercase tracking-[0.15em]">Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#1A1A1A]/10 bg-white p-3.5 shadow-2xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#1A1A1A]/40" />
          <input
            type="text"
            placeholder="Buscar por nombre, CUIT, zona, código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[#1A1A1A]/12 bg-[#F9F7F2] pl-9 pr-3 py-2 text-xs text-[#1A1A1A] focus:border-[#1A1A1A] outline-none font-sans"
          />
        </div>

        <select
          value={segmentFilter}
          onChange={(e) => setSegmentFilter(e.target.value)}
          className="rounded-lg border border-[#1A1A1A]/12 bg-[#F9F7F2] px-3 py-2 text-xs text-[#1A1A1A] outline-none font-sans cursor-pointer"
        >
          <option value="all">Todos los Segmentos</option>
          <option value="Specialty Cafe">Specialty Cafe</option>
          <option value="Restaurant / Gastronomía">Restaurant / Gastronomía</option>
          <option value="Hotel">Hotel</option>
          <option value="Oficina / Corporativo">Oficina / Corporativo</option>
        </select>

        <select
          value={scoringFilter}
          onChange={(e) => setScoringFilter(e.target.value)}
          className="rounded-lg border border-[#1A1A1A]/12 bg-[#F9F7F2] px-3 py-2 text-xs text-[#1A1A1A] outline-none font-sans cursor-pointer"
        >
          <option value="all">Todo Scoring</option>
          <option value="Alto Valor">Alto Valor</option>
          <option value="Crecimiento">Crecimiento</option>
          <option value="Riesgo">En Riesgo (Caída &gt;20%)</option>
          <option value="Riesgo Crítico">Riesgo Crítico</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[#1A1A1A]/12 bg-[#F9F7F2] px-3 py-2 text-xs text-[#1A1A1A] outline-none font-sans cursor-pointer"
        >
          <option value="all">Todos los Estados</option>
          <option value="Activo">Activos</option>
          <option value="En Pausa">En Pausa</option>
          <option value="Inactivo">Inactivos</option>
        </select>
      </div>

      {/* Customer Directory Table */}
      <div className="overflow-x-auto rounded-xl border border-[#1A1A1A]/10 bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-[#1A1A1A]">
          <thead className="border-b border-[#1A1A1A]/10 bg-[#F9F7F2] font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/60">
            <tr>
              <th className="py-3.5 px-4">Cliente / Razón Social</th>
              <th className="py-3.5 px-3">Segmento &amp; Zona</th>
              <th className="py-3.5 px-3">Consumo Promedio</th>
              <th className="py-3.5 px-3">Variación (3m vs 6m)</th>
              <th className="py-3.5 px-3">Máquinas</th>
              <th className="py-3.5 px-3">Saldo CC / Vencido</th>
              <th className="py-3.5 px-3 text-center">Scoring</th>
              <th className="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1A1A]/5 font-sans">
            {filteredCustomers.map((c) => {
              const isDrop = c.consumptionChangePercent < -15;
              const isGrowth = c.consumptionChangePercent > 10;

              return (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className="cursor-pointer hover:bg-[#F9F7F2] transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A1A1A]/5 text-[#1A1A1A] font-serif font-bold text-xs border border-[#1A1A1A]/10">
                        ☕
                      </div>
                      <div>
                        <div className="font-semibold text-[#1A1A1A] group-hover:text-[#8E2030] transition-colors">
                          {c.commercialName}
                        </div>
                        <div className="text-[10px] text-[#1A1A1A]/50">
                          {c.code} • CUIT {c.taxId}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="text-[#1A1A1A] font-medium">{c.segment}</div>
                    <div className="text-[10px] text-[#1A1A1A]/50 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#1A1A1A]/40" />
                      {c.zone}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-[#1A1A1A]">
                    {c.avgMonthlyKg} Kg/mes
                  </td>

                  <td className="py-3.5 px-3">
                    <div
                      className={`inline-flex items-center gap-1 font-bold ${
                        isDrop
                          ? "text-[#8E2030]"
                          : isGrowth
                          ? "text-emerald-700"
                          : "text-[#1A1A1A]/60"
                      }`}
                    >
                      {c.consumptionChangePercent < 0 ? (
                        <TrendingDown className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingUp className="h-3.5 w-3.5" />
                      )}
                      <span>{c.consumptionChangePercent}%</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1 text-[#1A1A1A]/70">
                      <Cpu className="h-3.5 w-3.5 text-[#1A1A1A]/50" />
                      <span>{c.assignedMachineIds.length} máq.</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-serif font-bold text-sm text-[#1A1A1A]">
                      ${c.currentAccountBalance.toLocaleString()}
                    </div>
                    {c.overdueDebt > 0 && (
                      <div className="text-[10px] font-bold text-[#8E2030]">
                        ${c.overdueDebt.toLocaleString()} vencido
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block rounded px-2 py-0.5 font-sans text-[9px] uppercase tracking-[0.15em] font-semibold ${
                        c.scoring === "Alto Valor"
                          ? "bg-emerald-900/10 text-emerald-800 border border-emerald-700/30"
                          : c.scoring === "Crecimiento"
                          ? "bg-[#1A1A1A]/10 text-[#1A1A1A] border border-[#1A1A1A]/20"
                          : c.scoring === "Riesgo"
                          ? "bg-[#C2823D]/10 text-[#C2823D] border border-[#C2823D]/30"
                          : "bg-[#8E2030]/10 text-[#8E2030] border border-[#8E2030]/30"
                      }`}
                    >
                      {c.scoring}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleQuickRepeat(e, c.id)}
                        className="rounded-md bg-[#F2EFE9] p-1.5 text-[#1A1A1A]/70 hover:bg-[#8E2030] hover:text-white border border-[#1A1A1A]/10 transition-colors"
                        title="Repetir último pedido"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedCustomerId(c.id)}
                        className="rounded-md bg-[#F2EFE9] p-1.5 text-[#1A1A1A]/70 hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A]/10 transition-colors"
                        title="Ver Ficha 360"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Customer 360 Modal */}
      {activeCustomer && (
        <Customer360Modal
          customer={activeCustomer}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}

      {/* Customer Form Modal */}
      {isFormOpen && (
        <CustomerFormModal
          customerToEdit={customerToEdit}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};
