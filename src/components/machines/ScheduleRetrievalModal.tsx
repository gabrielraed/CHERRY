import React, { useState } from "react";
import { Machine } from "../../types";
import { useApp } from "../../context/AppContext";
import {
  X,
  Truck,
  Calendar,
  AlertTriangle,
  UserCheck,
  CheckSquare,
  FileWarning,
} from "lucide-react";

interface ScheduleRetrievalModalProps {
  machine: Machine;
  onClose: () => void;
}

export const ScheduleRetrievalModal: React.FC<ScheduleRetrievalModalProps> = ({
  machine,
  onClose,
}) => {
  const { scheduleMachineRetrieval } = useApp();

  const [scheduledDate, setScheduledDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [driverName, setDriverName] = useState<string>("Carlos Benítez (Logística)");
  const [reason, setReason] = useState<string>("Fin de contrato de consignación sin renovación");
  const [notes, setNotes] = useState<string>("");
  const [checkDrainBoiler, setCheckDrainBoiler] = useState(true);
  const [checkRemoveFilter, setCheckRemoveFilter] = useState(true);
  const [checkTransportBox, setCheckTransportBox] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const checklistNotes = [
      checkDrainBoiler ? "Drenaje de caldera requerido" : "",
      checkRemoveFilter ? "Retirar filtro de agua Brita" : "",
      checkTransportBox ? "Embalaje protector para transporte" : "",
    ]
      .filter(Boolean)
      .join(". ");

    const fullNotes = [notes.trim(), checklistNotes].filter(Boolean).join(" | ");

    scheduleMachineRetrieval(machine.id, {
      scheduledDate,
      driverName,
      reason,
      notes: fullNotes,
    });

    alert(
      `Retiro programado correctamente para el ${scheduledDate}. Se generó la orden de logística y alerta de retiro.`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/50 p-4 backdrop-blur-xs overflow-y-auto text-[#1A1A1A]">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-[#1A1A1A]/10 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 bg-[#F9F7F2] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1A1A] text-white shadow-xs">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
                Programar Retiro de Máquina
              </h2>
              <p className="font-sans text-xs text-[#1A1A1A]/60">
                {machine.brand} {machine.model} ({machine.code}) • {machine.customerName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-[#1A1A1A]/10 bg-white p-2 text-[#1A1A1A]/50 hover:bg-[#F2EFE9] hover:text-[#1A1A1A] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-sans">
          {/* Warning Banner */}
          <div className="rounded-lg border border-[#C2823D]/30 bg-[#C2823D]/10 p-3.5 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-[#C2823D] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#C2823D] block">
                Planificación Logística de Retiro
              </span>
              <p className="text-[#1A1A1A]/70 text-[11px] mt-0.5">
                Esta acción creará una tarea de retiro técnico para desinstalar el equipo de <strong>{machine.customerName}</strong> y devolverlo a depósito.
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="font-bold text-[#1A1A1A] block flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#8E2030]" />
              <span>Fecha Programada de Retiro:</span>
            </label>
            <input
              type="date"
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs font-medium text-[#1A1A1A] focus:border-[#8E2030] focus:outline-none"
            />
          </div>

          {/* Responsible Driver / Tech */}
          <div className="space-y-1">
            <label className="font-bold text-[#1A1A1A] block flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-[#8E2030]" />
              <span>Chofer / Técnico Responsable del Retiro:</span>
            </label>
            <select
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs font-medium text-[#1A1A1A] focus:border-[#8E2030] focus:outline-none"
            >
              <option value="Carlos Benítez (Logística)">Carlos Benítez (Logística &amp; Reparto Propio)</option>
              <option value="Diego Barreto (Servicio Técnico)">Diego Barreto (Servicio Técnico Especializado)</option>
              <option value="Matías Peralta (Transporte)">Matías Peralta (Transporte de Equipos)</option>
            </select>
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <label className="font-bold text-[#1A1A1A] block flex items-center gap-1.5">
              <FileWarning className="h-3.5 w-3.5 text-[#8E2030]" />
              <span>Motivo del Retiro:</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs font-medium text-[#1A1A1A] focus:border-[#8E2030] focus:outline-none"
            >
              <option value="Fin de contrato de consignación sin renovación">Fin de contrato de consignación sin renovación</option>
              <option value="Incumplimiento de cuota mensual de café (< 50Kg)">Incumplimiento de cuota mensual de café (&lt; 50Kg)</option>
              <option value="Cierre o traspaso de local comercial">Cierre o traspaso de local comercial</option>
              <option value="Reemplazo o upgrade por máquina de mayor capacidad">Reemplazo o upgrade por máquina de mayor capacidad</option>
              <option value="Rescisión voluntaria anticipada acordada">Rescisión voluntaria anticipada acordada</option>
            </select>
          </div>

          {/* Checklist */}
          <div className="rounded-lg border border-[#1A1A1A]/10 bg-[#F9F7F2] p-3.5 space-y-2">
            <span className="font-bold text-[#1A1A1A] block">Protocolo Técnico de Desinstalación:</span>
            <label className="flex items-center gap-2 text-xs text-[#1A1A1A]/80 cursor-pointer">
              <input
                type="checkbox"
                checked={checkDrainBoiler}
                onChange={(e) => setCheckDrainBoiler(e.target.checked)}
                className="rounded border-[#1A1A1A]/30 text-[#8E2030] focus:ring-[#8E2030]"
              />
              <span>Drenaje total de calderas y circuitos de agua caliente</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-[#1A1A1A]/80 cursor-pointer">
              <input
                type="checkbox"
                checked={checkRemoveFilter}
                onChange={(e) => setCheckRemoveFilter(e.target.checked)}
                className="rounded border-[#1A1A1A]/30 text-[#8E2030] focus:ring-[#8E2030]"
              />
              <span>Desconexión y retiro del cartucho de filtración Brita</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-[#1A1A1A]/80 cursor-pointer">
              <input
                type="checkbox"
                checked={checkTransportBox}
                onChange={(e) => setCheckTransportBox(e.target.checked)}
                className="rounded border-[#1A1A1A]/30 text-[#8E2030] focus:ring-[#8E2030]"
              />
              <span>Verificación de portafiltros y accesorios para remito de devolución</span>
            </label>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-bold text-[#1A1A1A] block">
              Observaciones adicionales para el chofer:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Acceso por puerta de servicio antes de las 10:00 AM."
              className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white p-2.5 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1A1A1A]/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#1A1A1A]/20 bg-white px-4 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#F2EFE9] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#8E2030] active:scale-98 transition-all"
            >
              <Truck className="h-4 w-4" />
              <span>Confirmar Retiro Programado</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
