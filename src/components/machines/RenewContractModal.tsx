import React, { useState } from "react";
import { Machine } from "../../types";
import { useApp } from "../../context/AppContext";
import {
  X,
  RefreshCw,
  Calendar,
  Coffee,
  FileCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface RenewContractModalProps {
  machine: Machine;
  onClose: () => void;
}

export const RenewContractModal: React.FC<RenewContractModalProps> = ({ machine, onClose }) => {
  const { renewMachineContract } = useApp();

  const currentExpStr = machine.contractExpirationDate || "2026-09-15";
  const currentExpDate = new Date(currentExpStr);

  const [termOption, setTermOption] = useState<number>(12); // months
  const [customDate, setCustomDate] = useState<string>(() => {
    const d = new Date(currentExpDate);
    d.setMonth(d.getMonth() + 12);
    return d.toISOString().split("T")[0];
  });
  const [minimumKg, setMinimumKg] = useState<number>(machine.minimumMonthlyKg || 60);
  const [notes, setNotes] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileScanUrl, setFileScanUrl] = useState<string>("");

  const handleTermChange = (months: number) => {
    setTermOption(months);
    const d = new Date(currentExpDate);
    d.setMonth(d.getMonth() + months);
    setCustomDate(d.toISOString().split("T")[0]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFileScanUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    renewMachineContract(machine.id, {
      newExpirationDate: customDate,
      addMonths: termOption,
      minimumMonthlyKg: Number(minimumKg),
      notes: notes.trim() || `Renovación de consignación por +${termOption} meses acordada con ${machine.customerName}.`,
      contractFileName: fileName || `Adenda_Renovacion_${machine.code}_${customDate}.pdf`,
      contractScanUrl: fileScanUrl || undefined,
    });
    alert(`¡Contrato de consignación para ${machine.brand} ${machine.model} renovado exitosamente hasta el ${customDate}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/50 p-4 backdrop-blur-xs overflow-y-auto text-[#1A1A1A]">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-[#1A1A1A]/10 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 bg-[#F9F7F2] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8E2030] text-white shadow-xs">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
                Renovar Contrato de Consignación
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
          {/* Current Expiration Summary */}
          <div className="rounded-lg border border-[#1A1A1A]/10 bg-[#F9F7F2] p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[#1A1A1A]/50 text-[10px] uppercase font-bold block">Vencimiento Actual</span>
              <span className="font-serif font-bold text-sm text-[#8E2030]">{currentExpStr}</span>
            </div>
            <div className="text-right">
              <span className="text-[#1A1A1A]/50 text-[10px] uppercase font-bold block">Consumo Promedio Real</span>
              <span className="font-serif font-bold text-sm text-emerald-800">{machine.avgMonthlyKg} Kg / mes</span>
            </div>
          </div>

          {/* Term Extension Options */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#1A1A1A] block">
              Plazo de Extensión / Renovación:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[6, 12, 24, 36].map((months) => (
                <button
                  type="button"
                  key={months}
                  onClick={() => handleTermChange(months)}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                    termOption === months
                      ? "border-[#8E2030] bg-[#8E2030] text-white shadow-xs"
                      : "border-[#1A1A1A]/20 bg-white text-[#1A1A1A] hover:bg-[#F2EFE9]"
                  }`}
                >
                  +{months} meses
                </button>
              ))}
            </div>
          </div>

          {/* New Expiration Date */}
          <div className="space-y-1">
            <label className="font-bold text-[#1A1A1A] block flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#8E2030]" />
              <span>Nueva Fecha de Vencimiento:</span>
            </label>
            <input
              type="date"
              required
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setTermOption(0);
              }}
              className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs font-medium text-[#1A1A1A] focus:border-[#8E2030] focus:outline-none"
            />
          </div>

          {/* Minimum Monthly Kg */}
          <div className="space-y-1">
            <label className="font-bold text-[#1A1A1A] block flex items-center gap-1.5">
              <Coffee className="h-3.5 w-3.5 text-[#8E2030]" />
              <span>Compromiso de Consumo Mínimo (Kg/mes):</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={minimumKg}
              onChange={(e) => setMinimumKg(Number(e.target.value))}
              className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs font-medium text-[#1A1A1A] focus:border-[#8E2030] focus:outline-none"
            />
            <p className="text-[10px] text-[#1A1A1A]/50">
              Actualmente el cliente consume {machine.avgMonthlyKg} Kg/mes.
            </p>
          </div>

          {/* Attach New Signed Addendum / Contract Scan */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#1A1A1A] block flex items-center gap-1.5">
              <FileCheck className="h-3.5 w-3.5 text-[#8E2030]" />
              <span>Adjuntar Nueva Adenda / Contrato Firmado (PDF/Imagen):</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-[#1A1A1A]/30 bg-[#F9F7F2] p-3 text-xs text-[#1A1A1A]/70 cursor-pointer hover:bg-[#F2EFE9] transition-colors">
                <Upload className="h-4 w-4 text-[#8E2030]" />
                <span className="font-medium truncate">
                  {fileName ? `Archivo: ${fileName}` : "Seleccionar o arrastrar adenda firmada"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {/* Renewal Notes */}
          <div className="space-y-1">
            <label className="font-bold text-[#1A1A1A] block">
              Notas y Observaciones del Acuerdo:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Reunión comercial realizada. Se acordó mantenimiento preventivo semestral bonificado."
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
              className="flex items-center gap-1.5 rounded-lg bg-[#8E2030] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#721926] active:scale-98 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirmar Renovación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
