import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Machine } from "../../types";
import {
  X,
  DollarSign,
  Wrench,
  MapPin,
  History,
  Plus,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Truck,
  Eye,
} from "lucide-react";
import { ContractScanModal } from "./ContractScanModal";
import { RenewContractModal } from "./RenewContractModal";
import { ScheduleRetrievalModal } from "./ScheduleRetrievalModal";

interface MachineDetailModalProps {
  machine: Machine;
  onClose: () => void;
}

export const MachineDetailModal: React.FC<MachineDetailModalProps> = ({ machine, onClose }) => {
  const {
    addMachineMovement,
    createServiceTicket,
    setActiveTab,
    setSelectedCustomerId,
  } = useApp();

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<any>("Mantenimiento Preventivo");
  const [movementDesc, setMovementDesc] = useState("");
  const [movementCost, setMovementCost] = useState(0);

  // Contract & Expiration Modals State
  const [isContractScanOpen, setIsContractScanOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isRetrievalModalOpen, setIsRetrievalModalOpen] = useState(false);

  // Calculate contract expiration
  const expDateStr = machine.contractExpirationDate || "2026-09-15";
  const expDate = new Date(expDateStr);
  const now = new Date();
  const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const isExpired = diffDays < 0;
  const isExpiringSoon = diffDays >= 0 && diffDays <= 30;

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    addMachineMovement(machine.id, {
      type: movementType,
      description: movementDesc,
      cost: Number(movementCost),
      technicianName: "Diego Barreto",
    });
    setMovementDesc("");
    setMovementCost(0);
    setIsMovementModalOpen(false);
  };

  const handleCreateTicket = () => {
    createServiceTicket({
      machineId: machine.id,
      machineCode: machine.code,
      machineModel: `${machine.brand} ${machine.model}`,
      customerId: machine.customerId,
      customerName: machine.customerName,
      priority: "Alta",
      reportedProblem: "Service preventivo programado",
      description: "Revisión general de bombas, juntas de grupo, descalcificación y presión de caldera.",
    });
    alert("Ticket de servicio técnico generado correctamente.");
    onClose();
    setActiveTab("service");
  };

  const isProfitable = machine.recoveryPercent >= 100;
  const isGoodPace = machine.recoveryPercent >= 50 && (machine.installedAgeMonths || 0) < 12;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4 backdrop-blur-xs overflow-y-auto text-[#1A1A1A]">
        <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-xl border border-[#1A1A1A]/10 bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#1A1A1A]/10 bg-[#F9F7F2] p-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1A1A1A] text-white font-serif font-black text-lg">
                ⚙️
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">
                    {machine.brand} {machine.model}
                  </h2>
                  <span className="rounded bg-[#1A1A1A]/5 px-2 py-0.5 text-xs font-mono text-[#1A1A1A]/70">
                    {machine.code}
                  </span>
                  <span className="rounded px-2 py-0.5 font-sans text-[9px] uppercase tracking-wider font-semibold bg-[#1A1A1A]/10 text-[#1A1A1A] border border-[#1A1A1A]/20">
                    {machine.modality}
                  </span>
                </div>
                <p className="font-sans text-xs text-[#1A1A1A]/60 mt-0.5">
                  Serie: {machine.serialNumber} • Tipo: {machine.type} • {machine.capacity}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleCreateTicket}
                className="flex items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#8E2030] transition-colors shadow-2xs"
              >
                <Wrench className="h-3.5 w-3.5" />
                <span className="font-sans text-[11px] uppercase tracking-[0.1em]">Abrir Ticket</span>
              </button>
              <button
                onClick={onClose}
                className="rounded-lg border border-[#1A1A1A]/10 bg-white p-2 text-[#1A1A1A]/50 hover:bg-[#F2EFE9] hover:text-[#1A1A1A] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs font-sans">
            {/* CONSIGNMENT & CONTRACT EXPIRATION MODULE */}
            {machine.modality === "Comodato / Consignación" && (
              <div className="rounded-xl border border-[#8E2030]/20 bg-gradient-to-br from-[#F9F7F2] to-white p-4 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1A1A1A]/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#8E2030]" />
                    <h3 className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                      Contrato de Consignación &amp; Control de Vencimiento
                    </h3>
                  </div>
                  
                  {/* Status Badge */}
                  <span
                    className={`rounded px-2.5 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      machine.contractStatus === "Retiro Programado"
                        ? "bg-[#1A1A1A] text-white border border-[#1A1A1A]"
                        : isExpired
                        ? "bg-[#8E2030] text-white animate-pulse"
                        : isExpiringSoon
                        ? "bg-[#C2823D]/15 text-[#C2823D] border border-[#C2823D]/40 font-black"
                        : "bg-emerald-900/10 text-emerald-800 border border-emerald-700/30"
                    }`}
                  >
                    {machine.contractStatus === "Retiro Programado" ? (
                      <>
                        <Truck className="h-3 w-3" />
                        <span>🚚 Retiro Programado ({machine.retrievalScheduledDate})</span>
                      </>
                    ) : isExpired ? (
                      <>
                        <AlertTriangle className="h-3 w-3" />
                        <span>🚨 Vencido hace {Math.abs(diffDays)} días</span>
                      </>
                    ) : isExpiringSoon ? (
                      <>
                        <AlertTriangle className="h-3 w-3" />
                        <span>⚠ Vence en {diffDays} días (Prever Acción)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        <span>✓ Vigente ({diffDays} días restantes)</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Contract Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-2.5 rounded-lg bg-white border border-[#1A1A1A]/10 shadow-2xs">
                    <span className="text-[#1A1A1A]/50 text-[10px] uppercase font-bold block">Nº de Contrato</span>
                    <span className="font-mono font-bold text-xs text-[#8E2030] block mt-0.5 truncate">
                      {machine.contractNumber || "CT-COMODATO-2024-019"}
                    </span>
                    <span className="text-[10px] text-[#1A1A1A]/40">Firma: {machine.contractStartDate || machine.installationDate || "12/03/2024"}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-[#1A1A1A]/10 shadow-2xs">
                    <span className="text-[#1A1A1A]/50 text-[10px] uppercase font-bold block">Fecha Vencimiento</span>
                    <span className={`font-serif font-bold text-sm block mt-0.5 ${isExpired ? "text-[#8E2030]" : isExpiringSoon ? "text-[#C2823D]" : "text-[#1A1A1A]"}`}>
                      {expDateStr}
                    </span>
                    <span className="text-[10px] text-[#1A1A1A]/50">{machine.contractTermMonths || 30} meses de plazo</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-[#1A1A1A]/10 shadow-2xs">
                    <span className="text-[#1A1A1A]/50 text-[10px] uppercase font-bold block">Compromiso Café</span>
                    <span className="font-serif font-bold text-sm text-[#1A1A1A] block mt-0.5">
                      {machine.minimumMonthlyKg || 60} Kg / mes
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Real: {machine.avgMonthlyKg} Kg/m</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-[#1A1A1A]/10 shadow-2xs">
                    <span className="text-[#1A1A1A]/50 text-[10px] uppercase font-bold block">Contrato Escaneado</span>
                    <button
                      onClick={() => setIsContractScanOpen(true)}
                      className="text-left font-bold text-xs text-[#8E2030] hover:underline block mt-0.5 truncate flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3 shrink-0" />
                      <span className="truncate">{machine.contractFileName || "Ver Contrato PDF"}</span>
                    </button>
                    <span className="text-[10px] text-[#1A1A1A]/40">Firmas &amp; Sello OK</span>
                  </div>
                </div>

                {/* Direct Strategic Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#1A1A1A]/5">
                  <p className="text-[11px] text-[#1A1A1A]/60 flex items-center gap-1.5">
                    <span>Previsión operativa de comodatos para renovación anticipada o retiro logístico.</span>
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsContractScanOpen(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1A1A] hover:bg-[#F2EFE9] transition-colors shadow-2xs"
                    >
                      <FileText className="h-3.5 w-3.5 text-[#8E2030]" />
                      <span>Ver Escaneado</span>
                    </button>
                    <button
                      onClick={() => setIsRenewModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-[#8E2030] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#721926] transition-colors shadow-xs"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Renovar Contrato</span>
                    </button>
                    <button
                      onClick={() => setIsRetrievalModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-[#1A1A1A]/30 bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1A1A] hover:bg-[#F2EFE9] transition-colors shadow-2xs"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      <span>Programar Retiro</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STRATEGIC RENTABILITY & PAYBACK ENGINE */}
            <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-4 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#8E2030]" />
                  <h3 className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                    Motor de Retorno de Inversión (Payback &amp; Rentabilidad de Comodato)
                  </h3>
                </div>
                <span
                  className={`rounded px-2.5 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider ${
                    isProfitable
                      ? "bg-emerald-900/10 text-emerald-800 border border-emerald-700/30"
                      : isGoodPace
                      ? "bg-[#C2823D]/10 text-[#C2823D] border border-[#C2823D]/30"
                      : "bg-[#8E2030]/10 text-[#8E2030] border border-[#8E2030]/30"
                  }`}
                >
                  {isProfitable
                    ? "✓ Inversión Amortizada"
                    : isGoodPace
                    ? "⏳ En Plazo de Recuperación"
                    : "⚠ Riesgo / Bajo Volumen"}
                </span>
              </div>

              {/* Metrics Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-white p-3 border border-[#1A1A1A]/10 shadow-2xs">
                  <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider block">Costo Compra (USD)</span>
                  <p className="font-serif text-base font-bold text-[#1A1A1A] mt-0.5">
                    ${machine.purchaseCostUSD.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-[#1A1A1A]/40">Actual: ${machine.currentValueUSD.toLocaleString()}</span>
                </div>

                <div className="rounded-lg bg-white p-3 border border-[#1A1A1A]/10 shadow-2xs">
                  <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider block">Café Acumulado</span>
                  <p className="font-serif text-base font-bold text-[#8E2030] mt-0.5">
                    {machine.totalKgSinceInstall.toLocaleString()} Kg
                  </p>
                  <span className="text-[10px] text-[#1A1A1A]/40">12m: {machine.kgLast12Months} Kg</span>
                </div>

                <div className="rounded-lg bg-white p-3 border border-[#1A1A1A]/10 shadow-2xs">
                  <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider block">Margen Café USD</span>
                  <p className="font-serif text-base font-bold text-emerald-800 mt-0.5">
                    ${machine.accumulatedCoffeeMarginUSD.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-[#1A1A1A]/40">Basado en $ / Kg</span>
                </div>

                <div className="rounded-lg bg-white p-3 border border-[#1A1A1A]/10 shadow-2xs">
                  <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider block">Recuperación</span>
                  <p className="font-serif text-base font-bold text-[#1A1A1A] mt-0.5">
                    {machine.recoveryPercent}%
                  </p>
                  <span className="text-[10px] text-[#1A1A1A]/40">Payback: {machine.paybackMonths} m</span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#1A1A1A]/60">Progreso de Amortización de Activo</span>
                  <span className="text-[#8E2030] font-bold">{machine.recoveryPercent}% del costo cubierto</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#1A1A1A]/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#8E2030]"
                    style={{ width: `${Math.min(100, machine.recoveryPercent)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Current Location & Customer Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#8E2030]">
                    Ubicación &amp; Asignación Actual
                  </h4>
                  {machine.lat !== undefined && machine.lng !== undefined && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${machine.lat},${machine.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-semibold text-[#8E2030] hover:underline flex items-center gap-1"
                    >
                      <span>Google Maps ↗</span>
                    </a>
                  )}
                </div>
                {machine.customerId ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1A1A1A] text-sm">{machine.customerName}</span>
                      <button
                        onClick={() => {
                          setSelectedCustomerId(machine.customerId!);
                          setActiveTab("customers");
                          onClose();
                        }}
                        className="text-[11px] font-semibold text-[#8E2030] hover:underline"
                      >
                        Ver Ficha 360 →
                      </button>
                    </div>
                    <p className="text-[#1A1A1A]/70 text-xs flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#8E2030]" />
                      <span>{machine.locationAddress}</span>
                    </p>
                    {machine.lat !== undefined && machine.lng !== undefined && (
                      <div className="flex items-center justify-between text-[11px] bg-white rounded-md px-2.5 py-1 border border-[#1A1A1A]/10">
                        <span className="text-[#1A1A1A]/60 font-mono text-[10px]">
                          GPS: {machine.lat.toFixed(4)}, {machine.lng.toFixed(4)}
                        </span>
                        <button
                          onClick={() => {
                            setActiveTab("geomap" as any);
                            onClose();
                          }}
                          className="text-[#8E2030] font-bold text-[10px] hover:underline"
                        >
                          Ver en Mapa de Rutas 🗺️
                        </button>
                      </div>
                    )}
                    <p className="text-[#1A1A1A]/70 text-xs">
                      Instalada el: <strong>{machine.installationDate}</strong> ({machine.installedAgeMonths} meses en local)
                    </p>
                    <p className="text-[#1A1A1A]/70 text-xs flex items-center justify-between">
                      <span>Contrato: <strong>{machine.contractNumber || "Comodato Estándar"}</strong></span>
                      <button
                        onClick={() => setIsContractScanOpen(true)}
                        className="text-[#8E2030] font-semibold hover:underline"
                      >
                        Ver Documento ↗
                      </button>
                    </p>
                  </div>
                ) : (
                  <div className="text-[#1A1A1A]/50 py-2">
                    Máquina en depósito general (disponible para asignación).
                  </div>
                )}
              </div>

              {/* Technical Service & Maintenance Status */}
              <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-4 space-y-2.5">
                <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">
                  Estado Técnico &amp; Mantenimiento
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#1A1A1A]/60">Estado operativo:</span>
                    <span className="font-bold text-[#1A1A1A]">{machine.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#1A1A1A]/60">Próximo Service Programado:</span>
                    <span className="font-bold text-[#8E2030]">{machine.nextServiceDate || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#1A1A1A]/60">Técnico responsable:</span>
                    <span className="text-[#1A1A1A] font-medium">{machine.responsibleTechName || "Diego Barreto"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#1A1A1A]/60">Garantía hasta:</span>
                    <span className="text-[#1A1A1A]">{machine.warrantyUntil || "Sin garantía"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Movement & Service History Timeline */}
            <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-[#1A1A1A]/40" />
                  <h4 className="font-serif text-sm font-bold text-[#1A1A1A]">
                    Historial de Movimientos, Servicios &amp; Contratos
                  </h4>
                </div>
                <button
                  onClick={() => setIsMovementModalOpen(true)}
                  className="flex items-center gap-1 font-sans text-[10px] uppercase tracking-[0.1em] font-semibold text-[#8E2030] hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  <span>Registrar Evento</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {machine.movements.map((mov) => (
                  <div
                    key={mov.id}
                    className="flex items-start justify-between rounded-lg bg-[#F9F7F2] p-3 text-xs border border-[#1A1A1A]/5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1A1A1A]">{mov.type}</span>
                        <span className="text-[10px] text-[#1A1A1A]/50">{mov.date}</span>
                      </div>
                      <p className="text-[#1A1A1A]/70 text-[11px] mt-0.5">{mov.description}</p>
                      {mov.customerName && (
                        <p className="text-[10px] text-[#1A1A1A]/50 mt-0.5">Cliente: {mov.customerName}</p>
                      )}
                    </div>
                    {mov.cost !== undefined && mov.cost > 0 && (
                      <span className="font-serif font-bold text-[#8E2030]">
                        ${mov.cost.toLocaleString()} USD
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Scanned Viewer Modal */}
      {isContractScanOpen && (
        <ContractScanModal
          machine={machine}
          onClose={() => setIsContractScanOpen(false)}
          onOpenRenewModal={() => setIsRenewModalOpen(true)}
          onOpenRetrievalModal={() => setIsRetrievalModalOpen(true)}
        />
      )}

      {/* Renew Contract Modal */}
      {isRenewModalOpen && (
        <RenewContractModal
          machine={machine}
          onClose={() => setIsRenewModalOpen(false)}
        />
      )}

      {/* Schedule Retrieval Modal */}
      {isRetrievalModalOpen && (
        <ScheduleRetrievalModal
          machine={machine}
          onClose={() => setIsRetrievalModalOpen(false)}
        />
      )}

      {/* Register Manual Movement Modal */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#1A1A1A]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-[#1A1A1A]/10 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <h3 className="font-serif text-base font-bold text-[#1A1A1A]">
                Registrar Movimiento / Service
              </h3>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddMovement} className="mt-4 space-y-3.5 text-xs font-sans">
              <div>
                <label className="font-bold text-[#1A1A1A]">Tipo de Evento:</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#1A1A1A]/20 p-2 text-xs focus:border-[#8E2030] focus:outline-none"
                >
                  <option value="Mantenimiento Preventivo">Mantenimiento Preventivo</option>
                  <option value="Reparación">Reparación Correctiva</option>
                  <option value="Cambio de Piezas">Cambio de Piezas / Juntas</option>
                  <option value="Traslado">Traslado de Local</option>
                  <option value="Renovación Contrato">Renovación de Contrato</option>
                  <option value="Retiro">Retiro a Depósito</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-[#1A1A1A]">Descripción:</label>
                <textarea
                  required
                  rows={3}
                  value={movementDesc}
                  onChange={(e) => setMovementDesc(e.target.value)}
                  placeholder="Detalle de tareas técnicas o motivos del movimiento..."
                  className="mt-1 w-full rounded-lg border border-[#1A1A1A]/20 p-2 text-xs focus:border-[#8E2030] focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-[#1A1A1A]">Costo Asociado (USD):</label>
                <input
                  type="number"
                  min="0"
                  value={movementCost}
                  onChange={(e) => setMovementCost(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-[#1A1A1A]/20 p-2 text-xs focus:border-[#8E2030] focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#1A1A1A]/10">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="rounded-lg border border-[#1A1A1A]/20 px-3 py-1.5 text-xs text-[#1A1A1A]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#8E2030] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#721926]"
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
