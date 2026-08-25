import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { GreenCoffeeReceipt } from "../../types";
import { Wheat, Plus, Search, Droplets, MapPin, Scale, Printer, ShieldCheck, Flame, Filter } from "lucide-react";

interface GreenCoffeeInventoryTableProps {
  onOpenReceiptModal: () => void;
  onOpenAdjustmentModal: (lotId?: string) => void;
  onPlanRoastWithLot: (lot: GreenCoffeeReceipt) => void;
  onPrintGreenLotLabel: (lot: GreenCoffeeReceipt) => void;
}

export const GreenCoffeeInventoryTable: React.FC<GreenCoffeeInventoryTableProps> = ({
  onOpenReceiptModal,
  onOpenAdjustmentModal,
  onPlanRoastWithLot,
  onPrintGreenLotLabel,
}) => {
  const { greenCoffeeReceipts } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProcess, setSelectedProcess] = useState<string>("all");

  const filteredLots = greenCoffeeReceipts.filter((lot) => {
    const matchesSearch =
      lot.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.originCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.variety.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProcess =
      selectedProcess === "all" || lot.process.toLowerCase().includes(selectedProcess.toLowerCase());

    return matchesSearch && matchesProcess;
  });

  const totalGreenStockKg = greenCoffeeReceipts.reduce((sum, l) => sum + l.availableKg, 0);
  const totalLotsCount = greenCoffeeReceipts.length;
  const activeLotsCount = greenCoffeeReceipts.filter((l) => l.availableKg > 0).length;

  return (
    <div className="space-y-4">
      {/* Top summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#1A1A1A]/60">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Stock Café Verde Total</span>
            <Wheat className="h-4 w-4 text-[#8E2030]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#1A1A1A] mt-2">
            {totalGreenStockKg.toLocaleString()} <span className="text-xs font-sans font-normal text-[#1A1A1A]/50">Kg en silos</span>
          </div>
          <p className="text-[11px] text-[#1A1A1A]/50 mt-1">
            Disponible para programación de tueste
          </p>
        </div>

        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#1A1A1A]/60">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Lotes de Origen Activos</span>
            <MapPin className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="font-serif text-2xl font-bold text-emerald-800 mt-2">
            {activeLotsCount} <span className="text-xs font-sans font-normal text-[#1A1A1A]/50">de {totalLotsCount} lotes</span>
          </div>
          <p className="text-[11px] text-[#1A1A1A]/50 mt-1">
            Con saldo disponible en almacén
          </p>
        </div>

        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#1A1A1A]/60">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Puntaje SCA Promedio</span>
            <Droplets className="h-4 w-4 text-[#C2823D]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#8E2030] mt-2">
            86.1 <span className="text-xs font-sans font-normal text-[#1A1A1A]/50">pts (Especialidad)</span>
          </div>
          <p className="text-[11px] text-[#1A1A1A]/50 mt-1">
            Humedad controlada promedio: 11.2%
          </p>
        </div>
      </div>

      {/* Main card */}
      <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xs">
        {/* Actions & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A1A1A]/10 pb-4">
          <div className="flex items-center gap-2">
            <Wheat className="h-4 w-4 text-[#8E2030]" />
            <h3 className="font-serif text-base font-bold text-[#1A1A1A]">
              Inventario de Café Verde &amp; Remitos de Entrada
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#1A1A1A]/40" />
              <input
                type="text"
                placeholder="Buscar por lote, remito, origen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] text-xs text-[#1A1A1A] focus:bg-white focus:border-[#8E2030] focus:outline-hidden w-56 font-sans"
              />
            </div>

            <select
              value={selectedProcess}
              onChange={(e) => setSelectedProcess(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] text-xs text-[#1A1A1A] focus:bg-white focus:border-[#8E2030] focus:outline-hidden font-sans"
            >
              <option value="all">Todos los Procesos</option>
              <option value="lavado">Lavado</option>
              <option value="natural">Natural</option>
              <option value="honey">Honey</option>
              <option value="anaerobico">Anaeróbico</option>
            </select>

            <button
              onClick={onOpenReceiptModal}
              className="flex items-center gap-1.5 rounded-lg bg-[#8E2030] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#721926] active:scale-98 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nuevo Remito Verde</span>
            </button>
          </div>
        </div>

        {/* Lots Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans text-[#1A1A1A]">
            <thead className="border-b border-[#1A1A1A]/10 text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/50">
              <tr>
                <th className="py-2.5 px-3">Lote Verde / Remito</th>
                <th className="py-2.5 px-3">País, Región &amp; Finca</th>
                <th className="py-2.5 px-3">Variedad &amp; Proceso</th>
                <th className="py-2.5 px-3">Calidad SCA / Humedad</th>
                <th className="py-2.5 px-3">Stock Disponible (Kg)</th>
                <th className="py-2.5 px-3">Ubicación Silo</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/5">
              {filteredLots.map((lot) => {
                const stockPercentage = Math.round((lot.availableKg / lot.totalGreenKg) * 100);
                const isOutOfStock = lot.availableKg <= 0;

                return (
                  <tr
                    key={lot.id}
                    className={`hover:bg-[#F9F7F2]/50 transition-colors ${
                      isOutOfStock ? "opacity-60 bg-zinc-50" : ""
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-[#8E2030]">
                        {lot.lotNumber}
                      </div>
                      <div className="text-[10px] text-[#1A1A1A]/50 font-mono">
                        {lot.receiptNumber} • {lot.date}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-[#1A1A1A]">
                        {lot.originCountry} — {lot.region}
                      </div>
                      <div className="text-[11px] text-[#1A1A1A]/60">
                        {lot.farmOrProducer || lot.supplier} {lot.altitudeMeters ? `(${lot.altitudeMeters}m)` : ""}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-[#1A1A1A]">
                        {lot.variety}
                      </div>
                      <span className="inline-block mt-0.5 rounded bg-[#1A1A1A]/5 px-1.5 py-0.5 text-[10px] font-semibold text-[#1A1A1A]/70">
                        {lot.process}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-emerald-800 font-mono">
                          {lot.scaScore || 85} pts
                        </span>
                        <span className="text-[10px] text-[#1A1A1A]/40 font-mono">
                          | {lot.humidityPercent || 11}% H₂O
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 min-w-[140px]">
                      <div className="flex justify-between items-baseline font-mono mb-1">
                        <span className="font-bold text-sm text-[#1A1A1A]">
                          {lot.availableKg} Kg
                        </span>
                        <span className="text-[10px] text-[#1A1A1A]/50">
                          de {lot.totalGreenKg} Kg
                        </span>
                      </div>
                      <div className="w-full bg-[#1A1A1A]/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            stockPercentage > 40
                              ? "bg-emerald-600"
                              : stockPercentage > 15
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, stockPercentage))}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-[11px] text-[#1A1A1A]/70 font-medium">
                        {lot.warehouseLocation}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          lot.status === "En Stock" && lot.availableKg > 50
                            ? "bg-emerald-100 text-emerald-800"
                            : lot.availableKg > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-zinc-200 text-zinc-700"
                        }`}
                      >
                        {lot.availableKg > 0 ? (lot.availableKg > 50 ? "En Stock" : "Stock Crítico") : "Agotado"}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onPlanRoastWithLot(lot)}
                          disabled={isOutOfStock}
                          title="Planificar tueste con este lote"
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1A1A1A] text-white text-[10px] font-bold hover:bg-[#8E2030] disabled:opacity-30 transition-colors"
                        >
                          <Flame className="h-3 w-3" />
                          <span>Tostar</span>
                        </button>

                        <button
                          onClick={() => onPrintGreenLotLabel(lot)}
                          title="Imprimir etiqueta de Silo / Lote"
                          className="p-1 rounded text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-colors"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => onOpenAdjustmentModal(lot.id)}
                          title="Ajuste de Stock (Autorizados)"
                          className="p-1 rounded text-[#1A1A1A]/60 hover:text-[#8E2030] hover:bg-red-50 transition-colors"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredLots.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#1A1A1A]/50">
                    No se encontraron lotes de café verde con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
