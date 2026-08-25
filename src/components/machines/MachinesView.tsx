import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { MachineDetailModal } from "./MachineDetailModal";
import { MachineFormModal } from "./MachineFormModal";
import {
  Search,
  Plus,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Calendar,
  Truck,
  MapPin,
} from "lucide-react";

export const MachinesView: React.FC = () => {
  const {
    machines,
    selectedMachineId,
    setSelectedMachineId,
    setActiveTab,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [contractAlertOnly, setContractAlertOnly] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const activeMachine = machines.find((m) => m.id === selectedMachineId) || null;

  const now = new Date();

  const filteredMachines = machines.filter((m) => {
    const matchText =
      m.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.customerName && m.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.contractNumber && m.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchModality = modalityFilter === "all" || m.modality === modalityFilter;
    const matchStatus = statusFilter === "all" || m.status === statusFilter;

    let matchContractAlert = true;
    if (contractAlertOnly) {
      if (m.modality !== "Comodato / Consignación") return false;
      const expDate = new Date(m.contractExpirationDate || "2099-01-01");
      const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      matchContractAlert = diffDays <= 30 || m.contractStatus === "Vencido" || m.contractStatus === "Retiro Programado";
    }

    return matchText && matchModality && matchStatus && matchContractAlert;
  });

  // Fleet summary stats
  const totalFleetValueUSD = machines.reduce((sum, m) => sum + m.purchaseCostUSD, 0);
  const totalCoffeeGeneratedKg = machines.reduce((sum, m) => sum + m.totalKgSinceInstall, 0);
  const averageRecovery =
    machines.filter((m) => m.modality === "Comodato / Consignación").reduce((sum, m) => sum + m.recoveryPercent, 0) /
    (machines.filter((m) => m.modality === "Comodato / Consignación").length || 1);

  // Contract alert stats
  const expiringContractsCount = machines.filter((m) => {
    if (m.modality !== "Comodato / Consignación") return false;
    const expDate = new Date(m.contractExpirationDate || "2099-01-01");
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;

  return (
    <div className="space-y-6 pb-16 text-[#1A1A1A]">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-[#1A1A1A]/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8E2030]">
              Parque de Equipamiento &amp; Comodatos
            </span>
            <span className="h-1 w-1 rounded-full bg-[#1A1A1A]/30"></span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]/50">
              {filteredMachines.length} unidades registradas
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Máquinas <span className="italic font-normal">&amp; Consignaciones</span>
          </h1>
          <p className="font-sans text-xs text-[#1A1A1A]/60 mt-1">
            Control de contratos escaneados, alertas de vencimiento para renovación/retiro, trazabilidad por serie y amortización por café
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
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#1A1A1A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#8E2030] active:scale-98 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="font-sans text-[11px] uppercase tracking-[0.15em]">Nueva Máquina</span>
          </button>
        </div>
      </div>

      {/* Fleet Strategic Summary Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-sans">
        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#1A1A1A]/60">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Inversión Total Activos</span>
            <DollarSign className="h-4 w-4 text-[#8E2030]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#1A1A1A] mt-2">
            ${totalFleetValueUSD.toLocaleString()} <span className="text-xs font-sans font-normal text-[#1A1A1A]/50">USD</span>
          </div>
          <p className="text-[11px] text-[#1A1A1A]/50 mt-1">Valor residual en flota</p>
        </div>

        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#1A1A1A]/60">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Café en Comodatos</span>
            <TrendingUp className="h-4 w-4 text-[#8E2030]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#8E2030] mt-2">
            {totalCoffeeGeneratedKg.toLocaleString()} <span className="text-xs font-sans font-normal text-[#1A1A1A]/50">Kg</span>
          </div>
          <p className="text-[11px] text-[#1A1A1A]/50 mt-1">Volumen total despachado</p>
        </div>

        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#1A1A1A]/60">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Recuperación Promedio</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="font-serif text-2xl font-bold text-emerald-800 mt-2">
            {averageRecovery.toFixed(0)}%
          </div>
          <p className="text-[11px] text-[#1A1A1A]/50 mt-1">Ratio amortización de flota</p>
        </div>

        <div
          onClick={() => setContractAlertOnly(!contractAlertOnly)}
          className={`cursor-pointer rounded-xl border p-4 shadow-2xs transition-all ${
            contractAlertOnly
              ? "border-[#8E2030] bg-[#8E2030]/10"
              : expiringContractsCount > 0
              ? "border-[#C2823D]/30 bg-[#C2823D]/5 hover:border-[#C2823D]"
              : "border-[#1A1A1A]/10 bg-white"
          }`}
        >
          <div className="flex items-center justify-between text-[#1A1A1A]/60">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Contratos en Alerta</span>
            <AlertTriangle className="h-4 w-4 text-[#C2823D]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#C2823D] mt-2 flex items-center gap-2">
            {expiringContractsCount}{" "}
            <span className="text-xs font-sans font-normal text-[#1A1A1A]/60">por vencer/vencidos</span>
          </div>
          <p className="text-[11px] text-[#8E2030] font-semibold mt-1">
            {contractAlertOnly ? "✓ Mostrando solo alertas (Click para ver todas)" : "Click para filtrar alertas de contrato →"}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#1A1A1A]/10 bg-white p-3.5 shadow-2xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#1A1A1A]/40" />
          <input
            type="text"
            placeholder="Buscar por marca, modelo, serie (S/N), contrato, o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[#1A1A1A]/12 bg-[#F9F7F2] pl-9 pr-3 py-2 text-xs text-[#1A1A1A] focus:border-[#1A1A1A] outline-none font-sans"
          />
        </div>

        <select
          value={modalityFilter}
          onChange={(e) => setModalityFilter(e.target.value)}
          className="rounded-lg border border-[#1A1A1A]/12 bg-[#F9F7F2] px-3 py-2 text-xs text-[#1A1A1A] outline-none font-sans cursor-pointer"
        >
          <option value="all">Todas las Modalidades</option>
          <option value="Comodato / Consignación">Comodato / Consignación</option>
          <option value="Depósito / Disponible">Depósito / Disponible</option>
          <option value="Vendida">Vendida</option>
          <option value="En Reparación">En Reparación</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[#1A1A1A]/12 bg-[#F9F7F2] px-3 py-2 text-xs text-[#1A1A1A] outline-none font-sans cursor-pointer"
        >
          <option value="all">Todos los Estados Técnicos</option>
          <option value="Operativa">Operativa</option>
          <option value="Requiere Mantenimiento">Requiere Mantenimiento</option>
          <option value="En Service">En Service</option>
          <option value="Baja">Baja</option>
        </select>

        <button
          onClick={() => setContractAlertOnly(!contractAlertOnly)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
            contractAlertOnly
              ? "border-[#8E2030] bg-[#8E2030] text-white shadow-xs"
              : "border-[#1A1A1A]/20 bg-white text-[#1A1A1A] hover:bg-[#F2EFE9]"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Vencimientos de Contrato</span>
        </button>
      </div>

      {/* Machine Fleet Grid / Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMachines.map((m) => {
          const isProfitable = m.recoveryPercent >= 100;
          const isWarning = m.status === "Requiere Mantenimiento" || m.status === "En Service";

          // Contract expiration calculation
          const expDate = new Date(m.contractExpirationDate || "2099-01-01");
          const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isExpired = m.modality === "Comodato / Consignación" && diffDays < 0;
          const isExpiringSoon = m.modality === "Comodato / Consignación" && diffDays >= 0 && diffDays <= 30;

          return (
            <div
              key={m.id}
              onClick={() => setSelectedMachineId(m.id)}
              className={`group cursor-pointer rounded-xl border bg-white p-4 hover:border-[#1A1A1A]/30 transition-all flex flex-col justify-between shadow-2xs hover:shadow-md ${
                isExpired
                  ? "border-[#8E2030]/40 ring-1 ring-[#8E2030]/20"
                  : isExpiringSoon
                  ? "border-[#C2823D]/40"
                  : "border-[#1A1A1A]/10"
              }`}
            >
              <div className="space-y-3 font-sans">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1A1A]/5 text-[#1A1A1A] font-bold border border-[#1A1A1A]/10">
                      ⚙️
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-[#1A1A1A] group-hover:text-[#8E2030] transition-colors">
                        {m.brand} {m.model}
                      </h3>
                      <p className="text-[11px] text-[#1A1A1A]/50">
                        {m.code} • S/N: {m.serialNumber}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded px-2 py-0.5 font-sans text-[9px] uppercase tracking-wider font-semibold ${
                      m.status === "Operativa"
                        ? "bg-emerald-900/10 text-emerald-800 border border-emerald-700/30"
                        : isWarning
                        ? "bg-[#8E2030]/10 text-[#8E2030] border border-[#8E2030]/30"
                        : "bg-[#1A1A1A]/5 text-[#1A1A1A]/50"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                {/* Modality & Customer */}
                <div className="rounded-lg bg-[#F9F7F2] p-2.5 text-xs space-y-1 border border-[#1A1A1A]/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider">Modalidad:</span>
                    <span className="font-semibold text-[#1A1A1A]">{m.modality}</span>
                  </div>
                  {m.customerName ? (
                    <div className="flex items-center justify-between pt-1 border-t border-[#1A1A1A]/5">
                      <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider">Cliente:</span>
                      <span className="font-bold text-[#8E2030] truncate max-w-[170px]">
                        {m.customerName}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-800 font-medium pt-1 border-t border-[#1A1A1A]/5">
                      Disponible en Depósito
                    </div>
                  )}
                </div>

                {/* Contract & Expiration Badge for Consignments */}
                {m.modality === "Comodato / Consignación" && (
                  <div className="rounded-lg border border-[#1A1A1A]/10 bg-white p-2.5 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <FileText className="h-3.5 w-3.5 text-[#8E2030]" />
                        <span className="font-mono font-bold text-[10px] text-[#1A1A1A]/80">
                          {m.contractNumber || "CT-COMODATO"}
                        </span>
                      </div>
                      {m.contractFileName && (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-900/10 px-1.5 py-0.2 rounded">
                          ✓ Escaneado
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#1A1A1A]/5 text-[11px]">
                      <span className="text-[#1A1A1A]/60 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-[#1A1A1A]/40" />
                        <span>Vence: <strong>{m.contractExpirationDate || "2026-09-15"}</strong></span>
                      </span>

                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          m.contractStatus === "Retiro Programado"
                            ? "bg-[#1A1A1A] text-white"
                            : isExpired
                            ? "bg-[#8E2030] text-white"
                            : isExpiringSoon
                            ? "bg-[#C2823D]/15 text-[#C2823D] border border-[#C2823D]/30"
                            : "text-emerald-800 bg-emerald-900/10"
                        }`}
                      >
                        {m.contractStatus === "Retiro Programado"
                          ? `🚚 Retiro ${m.retrievalScheduledDate}`
                          : isExpired
                          ? `🚨 Vencido hace ${Math.abs(diffDays)}d`
                          : isExpiringSoon
                          ? `⚠ Vence en ${diffDays}d`
                          : `✓ Quedan ${diffDays}d`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Rentability Progress */}
                {m.modality === "Comodato / Consignación" && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#1A1A1A]/60">Amortización por Café</span>
                      <span
                        className={`font-bold ${
                          isProfitable ? "text-emerald-800" : "text-[#8E2030]"
                        }`}
                      >
                        {m.recoveryPercent}% ({m.totalKgSinceInstall} Kg)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#1A1A1A]/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#8E2030]"
                        style={{ width: `${Math.min(100, m.recoveryPercent)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[11px] text-[#1A1A1A]/50 font-sans">
                <span>Próx. Service: {m.nextServiceDate || "N/A"}</span>
                <span className="text-[#1A1A1A] font-semibold flex items-center gap-1 group-hover:text-[#8E2030] group-hover:translate-x-0.5 transition-all">
                  Ver Ficha &amp; Contrato →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Machine Detail Modal */}
      {activeMachine && (
        <MachineDetailModal
          machine={activeMachine}
          onClose={() => setSelectedMachineId(null)}
        />
      )}

      {/* Machine Form Modal */}
      {isFormOpen && (
        <MachineFormModal
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};
