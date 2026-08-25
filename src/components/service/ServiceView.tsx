import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { ServiceTicket } from "../../types";
import {
  Wrench,
  Plus,
} from "lucide-react";

export const ServiceView: React.FC = () => {
  const {
    serviceTickets,
    machines,
    createServiceTicket,
    updateServiceTicket,
    updateMachine,
  } = useApp();

  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState(machines[0]?.id || "");
  const [problem, setProblem] = useState("Baja presión en caldera / Grupo 1 goteando");
  const [priority, setPriority] = useState<any>("Alta");
  const [ticketDesc, setTicketDesc] = useState("El barista reporta que la bomba hace ruido excesivo y la temperatura de extracción no supera los 86°C.");

  const [ticketToClose, setTicketToClose] = useState<ServiceTicket | null>(null);
  const [resolutionDesc, setResolutionDesc] = useState("Cambio de electroválvula y juego de juntas de grupo de 8.5mm. Descalcificación con ácido cítrico realizada.");
  const [costLabor, setCostLabor] = useState(120);

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const machine = machines.find((m) => m.id === selectedMachineId);
    if (!machine) return;

    createServiceTicket({
      machineId: machine.id,
      machineCode: machine.code,
      machineModel: `${machine.brand} ${machine.model}`,
      customerId: machine.customerId,
      customerName: machine.customerName,
      priority,
      reportedProblem: problem,
      description: ticketDesc,
      underWarranty: true,
    });

    setIsNewTicketOpen(false);
  };

  const handleCloseTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketToClose) return;

    updateServiceTicket(ticketToClose.id, {
      status: "Resuelto",
      closedAt: new Date().toISOString(),
      technicianDiagnosis: resolutionDesc,
      laborCostUSD: Number(costLabor),
      totalCostUSD: Number(costLabor) + 60,
    });

    // Restore machine status to Operativa
    if (ticketToClose.machineId) {
      updateMachine(ticketToClose.machineId, { status: "Operativa" });
    }

    setTicketToClose(null);
  };

  return (
    <div className="space-y-6 pb-16 text-[#1A1A1A]">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-[#1A1A1A]/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8E2030]">
              Mantenimiento &amp; Asistencia
            </span>
            <span className="h-1 w-1 rounded-full bg-[#1A1A1A]/30"></span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]/50">
              {serviceTickets.length} tickets
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Servicio Técnico <span className="italic font-normal">&amp; Incidencias</span>
          </h1>
          <p className="font-sans text-xs text-[#1A1A1A]/60 mt-1">
            Control de incidentes en máquinas de café, diagnósticos, historial de intervenciones y costos de mantenimiento
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewTicketOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#1A1A1A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#8E2030] active:scale-98 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="font-sans text-[11px] uppercase tracking-[0.15em]">Abrir Ticket</span>
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3 font-sans text-xs">
        {serviceTickets.map((t) => {
          const isOpen = t.status !== "Resuelto" && t.status !== "Cerrado";

          return (
            <div
              key={t.id}
              className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-3 shadow-2xs hover:border-[#1A1A1A]/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-[#1A1A1A] text-base">{t.reportedProblem}</span>
                    <span className="rounded bg-[#F9F7F2] px-2 py-0.5 text-[10px] text-[#1A1A1A]/70 font-mono border border-[#1A1A1A]/10">
                      {t.ticketNumber}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold ${
                        t.status === "Resuelto"
                          ? "bg-emerald-900/10 text-emerald-800 border border-emerald-700/30"
                          : t.priority === "Crítica" || t.priority === "Alta"
                          ? "bg-[#8E2030]/10 text-[#8E2030] border border-[#8E2030]/30 animate-pulse"
                          : "bg-[#C2823D]/10 text-[#C2823D] border border-[#C2823D]/30"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#1A1A1A]/60">
                    Máquina: <strong className="text-[#1A1A1A] font-semibold">{t.machineModel} ({t.machineCode})</strong> • Cliente:{" "}
                    <strong className="text-[#8E2030]">{t.customerName}</strong>
                  </p>
                </div>

                {isOpen && (
                  <button
                    onClick={() => setTicketToClose(t)}
                    className="rounded-lg bg-[#1A1A1A] px-3.5 py-1.5 font-semibold text-white hover:bg-emerald-800 transition-colors shadow-2xs shrink-0"
                  >
                    Cerrar / Resolver Ticket
                  </button>
                )}
              </div>

              <div className="rounded-lg bg-[#F9F7F2] p-3.5 border border-[#1A1A1A]/10 text-[#1A1A1A] space-y-1.5">
                <p className="text-xs text-[#1A1A1A]/80"><strong>Descripción del Reclamo:</strong> {t.description}</p>
                {t.technicianDiagnosis && (
                  <p className="text-emerald-900 pt-2 border-t border-[#1A1A1A]/10 font-sans text-xs">
                    <strong>Diagnóstico &amp; Solución Técnica:</strong> {t.technicianDiagnosis} (Costo total: ${t.totalCostUSD} USD)
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Ticket Modal */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4 backdrop-blur-xs text-[#1A1A1A]">
          <div className="w-full max-w-lg rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <h3 className="font-serif text-base font-bold text-[#1A1A1A] flex items-center gap-2">
                <Wrench className="h-4 w-4 text-[#8E2030]" />
                Abrir Ticket de Asistencia Técnica
              </h3>
              <button onClick={() => setIsNewTicketOpen(false)} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A]">✕</button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Máquina Afectada</label>
                <select
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brand} {m.model} ({m.code}) - {m.customerName || "En Depósito"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Problema Reportado</label>
                  <input
                    type="text"
                    required
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Prioridad</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica (Máquina parada)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Detalle del síntoma</label>
                <textarea
                  rows={3}
                  required
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1A1A1A]/10">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="rounded-lg border border-[#1A1A1A]/15 bg-white px-3.5 py-1.5 text-xs text-[#1A1A1A]/70 hover:bg-[#F2EFE9]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1A1A1A] px-4 py-1.5 font-semibold text-white hover:bg-[#8E2030]"
                >
                  Registrar Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Ticket Modal */}
      {ticketToClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4 backdrop-blur-xs text-[#1A1A1A]">
          <div className="w-full max-w-md rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <h3 className="font-serif text-base font-bold text-[#1A1A1A]">Cerrar Ticket ({ticketToClose.ticketNumber})</h3>
              <button onClick={() => setTicketToClose(null)} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A]">✕</button>
            </div>

            <form onSubmit={handleCloseTicketSubmit} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Diagnóstico &amp; Solución Aplicada</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionDesc}
                  onChange={(e) => setResolutionDesc(e.target.value)}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Costo Mano de Obra (USD)</label>
                <input
                  type="number"
                  value={costLabor}
                  onChange={(e) => setCostLabor(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1A1A1A]/10">
                <button
                  type="button"
                  onClick={() => setTicketToClose(null)}
                  className="rounded-lg border border-[#1A1A1A]/15 bg-white px-3.5 py-1.5 text-xs text-[#1A1A1A]/70 hover:bg-[#F2EFE9]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-800 px-4 py-1.5 font-semibold text-white hover:bg-emerald-700"
                >
                  Finalizar Service y Habilitar Máquina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
