import React, { useState } from "react";
import { ProductionOrder } from "../../types";
import { CheckCircle2, X, Flame, TrendingDown, Scale, ArrowRight } from "lucide-react";

interface CompleteRoastModalProps {
  batch: ProductionOrder | null;
  onClose: () => void;
  onComplete: (batchId: string, actualKg: number, notes?: string) => void;
}

export const CompleteRoastModal: React.FC<CompleteRoastModalProps> = ({
  batch,
  onClose,
  onComplete,
}) => {
  if (!batch) return null;

  const defaultActual = batch.actualRoastedKg || Number((batch.greenCoffeeKg * 0.84).toFixed(1));
  const [actualRoastedKg, setActualRoastedKg] = useState<number>(defaultActual);
  const [roastNotes, setRoastNotes] = useState("");

  const greenKg = batch.greenCoffeeKg;
  const actualLossPercent = Number((((greenKg - actualRoastedKg) / greenKg) * 100).toFixed(1));
  const isLossNormal = actualLossPercent >= 13 && actualLossPercent <= 19;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(batch.id, Number(actualRoastedKg), roastNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-[#1A1A1A]/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 px-6 py-4 bg-[#F9F7F2]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-800">
                Finalización de Tueste
              </span>
              <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
                Registrar Salida de Tambor &amp; Merma
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#1A1A1A]/60 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          {/* Batch Summary */}
          <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-3 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#1A1A1A]">{batch.productName}</span>
              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#1A1A1A]/15 font-bold text-[#8E2030]">
                {batch.batchNumber}
              </span>
            </div>
            <div className="text-[11px] text-[#1A1A1A]/70">
              Origen: {batch.greenCoffeeOrigin}
            </div>
            <div className="flex items-center gap-4 text-[10px] text-[#1A1A1A]/60 pt-1 border-t border-[#1A1A1A]/10">
              <span>Carga Verde: <strong className="text-[#1A1A1A]">{batch.greenCoffeeKg} Kg</strong></span>
              <span>Tostadora: <strong className="text-[#1A1A1A]">{batch.roasterMachine}</strong></span>
            </div>
          </div>

          {/* Actual Yield Input */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#1A1A1A] flex items-center justify-between">
              <span>Café Tostado Real Obtenido (Kg en frío) *</span>
              <span className="text-[10px] text-[#1A1A1A]/50">Pesaje en báscula de enfriador</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={greenKg}
                step="0.1"
                value={actualRoastedKg}
                onChange={(e) => setActualRoastedKg(Number(e.target.value))}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-base font-mono font-bold text-[#1A1A1A] focus:border-emerald-700 focus:outline-hidden"
                required
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-[#1A1A1A]/50">Kg</span>
            </div>
          </div>

          {/* Live Merma / Loss % Analysis */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-3 shadow-2xs">
              <div className="flex items-center justify-between text-[#1A1A1A]/60 text-[10px] uppercase font-bold">
                <span>Merma Real</span>
                <TrendingDown className="h-3.5 w-3.5 text-[#8E2030]" />
              </div>
              <div className="text-xl font-bold font-mono text-[#8E2030] mt-1">
                {actualLossPercent}%
              </div>
              <span className={`text-[10px] font-bold ${isLossNormal ? "text-emerald-700" : "text-amber-700"}`}>
                {isLossNormal ? "✓ Rango estándar (13-19%)" : "⚠ Merma atípica"}
              </span>
            </div>

            <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-3 shadow-2xs">
              <div className="flex items-center justify-between text-[#1A1A1A]/60 text-[10px] uppercase font-bold">
                <span>Pérdida en Masa</span>
                <Scale className="h-3.5 w-3.5 text-[#1A1A1A]/60" />
              </div>
              <div className="text-xl font-bold font-mono text-[#1A1A1A] mt-1">
                {(greenKg - actualRoastedKg).toFixed(1)} <span className="text-xs font-normal">Kg</span>
              </div>
              <span className="text-[10px] text-[#1A1A1A]/50">Evaporación &amp; gases</span>
            </div>
          </div>

          {/* Consequence notice */}
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 text-[11px] space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
              <span>Actualización Automática de Stock:</span>
            </div>
            <ul className="list-disc list-inside text-[10px] text-emerald-800 space-y-0.5 pl-1">
              <li>Se descontarán <strong>{greenKg} Kg</strong> de café verde del silo/lote correspondiente.</li>
              <li>Se sumarán <strong>{actualRoastedKg} Kg</strong> al inventario disponible de <strong>{batch.productName}</strong>.</li>
              <li>Se registrarán los asientos en el Libro Mayor de Movimientos con trazabilidad de lote.</li>
            </ul>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-[#1A1A1A]">Observaciones de Calidad / Cata</label>
            <input
              type="text"
              value={roastNotes}
              onChange={(e) => setRoastNotes(e.target.value)}
              placeholder="Ej: Drop temp 212°C, colorimetro Agtron 62, desarrollo perfecto."
              className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-emerald-700 focus:outline-hidden"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1A1A1A]/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#1A1A1A]/20 bg-white px-4 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-emerald-800 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 active:scale-98 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirmar &amp; Actualizar Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
