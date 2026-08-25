import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { StockMovement, StockMovementType } from "../../types";
import { History, Search, Filter, ArrowDownRight, ArrowUpRight, ShieldCheck, FileText } from "lucide-react";

interface StockMovementsLedgerProps {
  onOpenAdjustmentModal: () => void;
}

export const StockMovementsLedger: React.FC<StockMovementsLedgerProps> = ({
  onOpenAdjustmentModal,
}) => {
  const { stockMovements } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterItemType, setFilterItemType] = useState<string>("all");

  const filteredMovements = stockMovements.filter((mov) => {
    const matchesSearch =
      mov.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mov.lotNumber && mov.lotNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mov.referenceDocument && mov.referenceDocument.toLowerCase().includes(searchTerm.toLowerCase())) ||
      mov.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.authorizedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || mov.type === filterType;
    const matchesItemType = filterItemType === "all" || mov.itemType === filterItemType;

    return matchesSearch && matchesType && matchesItemType;
  });

  const getMovementBadge = (type: StockMovementType) => {
    switch (type) {
      case "ENTRADA_REMITO_VERDE":
        return { label: "Entrada Remito Verde", bg: "bg-emerald-100 text-emerald-800 border-emerald-200", isPositive: true };
      case "CONSUMO_TUESTE":
        return { label: "Consumo Tueste", bg: "bg-amber-100 text-amber-800 border-amber-200", isPositive: false };
      case "PRODUCCION_TOSTADO":
        return { label: "Producción Tostada", bg: "bg-purple-100 text-purple-800 border-purple-200", isPositive: true };
      case "SALIDA_REMITO_DESPACHO":
        return { label: "Salida Remito Despacho", bg: "bg-blue-100 text-blue-800 border-blue-200", isPositive: false };
      case "AJUSTE_INVENTARIO_POSITIVO":
        return { label: "Ajuste Autorizado (+)", bg: "bg-teal-100 text-teal-800 border-teal-200", isPositive: true };
      case "AJUSTE_INVENTARIO_NEGATIVO":
        return { label: "Ajuste Autorizado (-)", bg: "bg-rose-100 text-rose-800 border-rose-200", isPositive: false };
      case "MERMA_EXTRAORDINARIA":
        return { label: "Merma Extraordinaria", bg: "bg-red-100 text-red-800 border-red-200", isPositive: false };
      case "MUESTRA_CATA":
        return { label: "Muestra de Cata", bg: "bg-zinc-100 text-zinc-800 border-zinc-200", isPositive: false };
      default:
        return { label: type, bg: "bg-zinc-100 text-zinc-800 border-zinc-200", isPositive: false };
    }
  };

  return (
    <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xs text-[#1A1A1A]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A1A1A]/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#8E2030]" />
            <h3 className="font-serif text-base font-bold text-[#1A1A1A]">
              Kardex &amp; Trazabilidad de Movimientos de Stock
            </h3>
          </div>
          <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
            Registro inmutable de entradas por remito, consumos de tueste, producciones y salidas de despacho
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#1A1A1A]/40" />
            <input
              type="text"
              placeholder="Buscar por lote, remito, motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] text-xs text-[#1A1A1A] focus:bg-white focus:border-[#8E2030] focus:outline-hidden w-56 font-sans"
            />
          </div>

          <select
            value={filterItemType}
            onChange={(e) => setFilterItemType(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] text-xs text-[#1A1A1A] focus:bg-white focus:border-[#8E2030] focus:outline-hidden font-sans"
          >
            <option value="all">Todo Tipo de Café</option>
            <option value="CAFE_VERDE">Solo Café Verde</option>
            <option value="CAFE_TOSTADO">Solo Café Tostado</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] text-xs text-[#1A1A1A] focus:bg-white focus:border-[#8E2030] focus:outline-hidden font-sans"
          >
            <option value="all">Todos los Movimientos</option>
            <option value="ENTRADA_REMITO_VERDE">Entradas Remito Verde</option>
            <option value="CONSUMO_TUESTE">Consumo Tueste</option>
            <option value="PRODUCCION_TOSTADO">Producción Tostado</option>
            <option value="SALIDA_REMITO_DESPACHO">Salidas Despacho</option>
            <option value="AJUSTE_INVENTARIO_POSITIVO">Ajustes (+)</option>
            <option value="AJUSTE_INVENTARIO_NEGATIVO">Ajustes (-)</option>
          </select>

          <button
            onClick={onOpenAdjustmentModal}
            className="flex items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#8E2030] active:scale-98 transition-all"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>Ajuste Autorizado</span>
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans text-[#1A1A1A]">
          <thead className="border-b border-[#1A1A1A]/10 text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/50">
            <tr>
              <th className="py-2.5 px-3">Fecha / Hora</th>
              <th className="py-2.5 px-3">Tipo Movimiento</th>
              <th className="py-2.5 px-3">Ítem / Lote</th>
              <th className="py-2.5 px-3">Cantidad (Kg)</th>
              <th className="py-2.5 px-3">Stock Ant. → Nuevo</th>
              <th className="py-2.5 px-3">Documento Ref.</th>
              <th className="py-2.5 px-3">Motivo / Autorizado por</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1A1A]/5">
            {filteredMovements.map((mov) => {
              const badge = getMovementBadge(mov.type);
              const isPositive = mov.quantityKg > 0;

              return (
                <tr key={mov.id} className="hover:bg-[#F9F7F2]/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-[#1A1A1A]">{mov.date}</div>
                    <div className="text-[10px] text-[#1A1A1A]/50 font-mono">{mov.time}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {badge.label}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-bold text-[#1A1A1A]">{mov.itemName}</div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#1A1A1A]/60 font-mono">
                      <span className="text-[#8E2030] font-bold">{mov.lotNumber || "—"}</span>
                      <span>• {mov.itemType === "CAFE_VERDE" ? "Café Verde" : "Café Tostado"}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`font-mono text-sm font-bold ${
                        isPositive ? "text-emerald-800" : "text-rose-800"
                      }`}
                    >
                      {isPositive ? `+${mov.quantityKg}` : mov.quantityKg} Kg
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-mono text-xs text-[#1A1A1A]/70">
                      {mov.previousStockKg} Kg <span className="text-[#1A1A1A]/40">→</span>{" "}
                      <strong className="text-[#1A1A1A]">{mov.newStockKg} Kg</strong>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] font-bold bg-[#F9F7F2] border border-[#1A1A1A]/10 px-2 py-0.5 rounded text-[#1A1A1A]">
                      {mov.referenceDocument || "—"}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="text-[11px] font-medium text-[#1A1A1A] max-w-xs truncate">
                      {mov.reason}
                    </div>
                    <div className="text-[10px] text-[#1A1A1A]/50 mt-0.5">
                      Por: <strong>{mov.authorizedBy}</strong> ({mov.userRole})
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredMovements.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#1A1A1A]/50">
                  No se registraron movimientos con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
