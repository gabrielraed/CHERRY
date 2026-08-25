import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { ProductionOrder, GreenCoffeeReceipt } from "../../types";
import {
  Flame,
  Wheat,
  QrCode,
  History,
  ShieldCheck,
  Package,
  Clock,
  TrendingDown,
  Plus,
  Printer,
  CheckCircle2,
  AlertCircle,
  Layers,
  Scale,
  Sparkles,
  Search,
  FileText,
} from "lucide-react";

import { NewRoastOrderModal } from "./NewRoastOrderModal";
import { CompleteRoastModal } from "./CompleteRoastModal";
import { GreenCoffeeReceiptModal } from "./GreenCoffeeReceiptModal";
import { TraceabilityLabelModal } from "./TraceabilityLabelModal";
import { StockAdjustmentModal } from "./StockAdjustmentModal";
import { GreenCoffeeInventoryTable } from "./GreenCoffeeInventoryTable";
import { StockMovementsLedger } from "./StockMovementsLedger";

type ProductionTab = "tueste" | "verde" | "trazabilidad" | "kardex";

export const ProductionView: React.FC = () => {
  const {
    products,
    productionOrders,
    greenCoffeeReceipts,
    orders,
    completeProductionBatch,
    currentUser,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<ProductionTab>("tueste");

  // Modals state
  const [isNewRoastModalOpen, setIsNewRoastModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [preselectedAdjustLotId, setPreselectedAdjustLotId] = useState<string | undefined>(undefined);
  const [batchToComplete, setBatchToComplete] = useState<ProductionOrder | null>(null);
  const [selectedBatchForLabel, setSelectedBatchForLabel] = useState<ProductionOrder | null>(null);

  // Search in Roasting Orders
  const [roastSearchTerm, setRoastSearchTerm] = useState("");
  const [roastStatusFilter, setRoastStatusFilter] = useState<string>("all");

  // Demand calculation
  const pendingOrders = orders.filter(
    (o) => o.status !== "Entregado" && o.status !== "Facturado" && o.status !== "Cobrado" && o.status !== "Cancelado"
  );
  const totalPendingDemandKg = pendingOrders.reduce((sum, o) => sum + o.totalKg, 0);
  const totalFinishedStockKg = products.reduce((sum, p) => sum + p.stock, 0);
  const totalGreenStockKg = greenCoffeeReceipts.reduce((sum, l) => sum + l.availableKg, 0);

  // Filtered production batches
  const filteredBatches = productionOrders.filter((b) => {
    const matchesSearch =
      b.batchNumber.toLowerCase().includes(roastSearchTerm.toLowerCase()) ||
      b.productName.toLowerCase().includes(roastSearchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(roastSearchTerm.toLowerCase()) ||
      b.greenCoffeeOrigin.toLowerCase().includes(roastSearchTerm.toLowerCase());

    const matchesStatus = roastStatusFilter === "all" || b.status === roastStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdjustmentForLot = (lotId?: string) => {
    setPreselectedAdjustLotId(lotId);
    setIsAdjustmentModalOpen(true);
  };

  const handlePlanRoastFromLot = (lot: GreenCoffeeReceipt) => {
    setIsNewRoastModalOpen(true);
  };

  const handlePrintGreenLot = (lot: GreenCoffeeReceipt) => {
    // Generate virtual batch for green lot label printing
    const dummyBatch: ProductionOrder = {
      id: `virtual-${lot.id}`,
      orgId: lot.orgId,
      code: lot.receiptNumber,
      batchNumber: lot.lotNumber,
      productId: "",
      productName: `CAFÉ VERDE: ${lot.originCountry} ${lot.region}`,
      greenCoffeeOrigin: `${lot.originCountry} ${lot.region} (${lot.farmOrProducer})`,
      greenCoffeeKg: lot.availableKg,
      roastedCoffeeTargetKg: lot.availableKg,
      roastProfile: `Grano Verde (${lot.process}, ${lot.variety}) - SCA ${lot.scaScore} pts`,
      roasterMachine: lot.warehouseLocation,
      roasterOperator: lot.registeredBy,
      status: "Planificada",
      date: lot.date,
      notes: lot.notes,
    };
    setSelectedBatchForLabel(dummyBatch);
  };

  return (
    <div className="space-y-6 pb-16 text-[#1A1A1A]">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-[#1A1A1A]/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8E2030]">
              Planta de Tueste &amp; Trazabilidad de Stock
            </span>
            <span className="h-1 w-1 rounded-full bg-[#1A1A1A]/30"></span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]/50">
              Control Integral de Café
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Producción, <span className="italic font-normal">Silos &amp; Trazabilidad</span>
          </h1>
          <p className="font-sans text-xs text-[#1A1A1A]/60 mt-1">
            Remitos de entrada de verde, órdenes de tueste y blends con merma, etiquetas de lote y kardex auditado
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsReceiptModalOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-[#1A1A1A]/20 bg-white px-3.5 py-2 text-xs font-semibold text-[#1A1A1A] shadow-2xs hover:bg-[#F9F7F2] active:scale-98 transition-all"
          >
            <Wheat className="h-4 w-4 text-[#8E2030]" />
            <span className="font-sans text-[11px] uppercase tracking-[0.1em]">Remito Verde</span>
          </button>

          <button
            onClick={() => handleOpenAdjustmentForLot()}
            className="flex items-center gap-2 rounded-lg border border-[#8E2030]/30 bg-[#8E2030]/5 px-3.5 py-2 text-xs font-semibold text-[#8E2030] shadow-2xs hover:bg-[#8E2030]/10 active:scale-98 transition-all"
          >
            <ShieldCheck className="h-4 w-4 text-[#8E2030]" />
            <span className="font-sans text-[11px] uppercase tracking-[0.1em]">Ajuste Autorizado</span>
          </button>

          <button
            onClick={() => setIsNewRoastModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#8E2030] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#721926] active:scale-98 transition-all"
          >
            <Flame className="h-4 w-4" />
            <span className="font-sans text-[11px] uppercase tracking-[0.15em]">Planificar Tueste</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#1A1A1A]/10 pb-2">
        <button
          onClick={() => setActiveSubTab("tueste")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all ${
            activeSubTab === "tueste"
              ? "bg-[#1A1A1A] text-white shadow-xs"
              : "bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:bg-[#F9F7F2]"
          }`}
        >
          <Flame className="h-4 w-4 text-[#8E2030]" />
          <span>Órdenes de Trabajo &amp; Tueste ({productionOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("verde")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all ${
            activeSubTab === "verde"
              ? "bg-[#1A1A1A] text-white shadow-xs"
              : "bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:bg-[#F9F7F2]"
          }`}
        >
          <Wheat className="h-4 w-4 text-[#8E2030]" />
          <span>Silos &amp; Remitos de Entrada Verde ({greenCoffeeReceipts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("trazabilidad")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all ${
            activeSubTab === "trazabilidad"
              ? "bg-[#1A1A1A] text-white shadow-xs"
              : "bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:bg-[#F9F7F2]"
          }`}
        >
          <QrCode className="h-4 w-4 text-[#8E2030]" />
          <span>Trazabilidad &amp; Etiquetas Térmicas</span>
        </button>

        <button
          onClick={() => setActiveSubTab("kardex")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all ${
            activeSubTab === "kardex"
              ? "bg-[#1A1A1A] text-white shadow-xs"
              : "bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:bg-[#F9F7F2]"
          }`}
        >
          <History className="h-4 w-4 text-[#8E2030]" />
          <span>Kardex &amp; Movimientos de Stock</span>
        </button>
      </div>

      {/* Tab 1: Roasting Work Orders */}
      {activeSubTab === "tueste" && (
        <div className="space-y-6">
          {/* KPI Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-sans">
            <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-[#1A1A1A]/60">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Demanda en Backlog</span>
                <Clock className="h-4 w-4 text-[#8E2030]" />
              </div>
              <div className="font-serif text-2xl font-bold text-[#8E2030] mt-2">
                {totalPendingDemandKg} <span className="text-xs font-sans font-normal text-[#1A1A1A]/50">Kg pendientes</span>
              </div>
              <p className="text-[11px] text-[#1A1A1A]/50 mt-1">Requerido para {pendingOrders.length} pedidos activos</p>
            </div>

            <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-[#1A1A1A]/60">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Stock Café Tostado</span>
                <Package className="h-4 w-4 text-purple-700" />
              </div>
              <div className="font-serif text-2xl font-bold text-[#1A1A1A] mt-2">
                {totalFinishedStockKg.toFixed(0)} <span className="text-xs font-sans font-normal text-[#1A1A1A]/50">Kg en empaque</span>
              </div>
              <p className="text-[11px] text-[#1A1A1A]/50 mt-1">Suma de productos terminados</p>
            </div>

            <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-[#1A1A1A]/60">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Stock Café Verde Silos</span>
                <Wheat className="h-4 w-4 text-emerald-700" />
              </div>
              <div className="font-serif text-2xl font-bold text-emerald-800 mt-2">
                {totalGreenStockKg.toLocaleString()} <span className="text-xs font-sans font-normal text-[#1A1A1A]/50">Kg disponibles</span>
              </div>
              <p className="text-[11px] text-[#1A1A1A]/50 mt-1">Materia prima en planta</p>
            </div>

            <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-[#1A1A1A]/60">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Merma Promedio Real</span>
                <TrendingDown className="h-4 w-4 text-[#C2823D]" />
              </div>
              <div className="font-serif text-2xl font-bold text-[#1A1A1A] mt-2">
                15.7% <span className="text-xs font-sans font-normal text-emerald-700">(Rango óptimo)</span>
              </div>
              <p className="text-[11px] text-[#1A1A1A]/50 mt-1">Control por pirólisis y humedad</p>
            </div>
          </div>

          {/* Batches Table Card */}
          <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A1A1A]/10 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[#8E2030]" />
                <h3 className="font-serif text-base font-bold text-[#1A1A1A]">
                  Órdenes de Trabajo &amp; Lotes de Tueste
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#1A1A1A]/40" />
                  <input
                    type="text"
                    placeholder="Buscar por lote, producto, código..."
                    value={roastSearchTerm}
                    onChange={(e) => setRoastSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] text-xs text-[#1A1A1A] focus:bg-white focus:border-[#8E2030] focus:outline-hidden w-56 font-sans"
                  />
                </div>

                <select
                  value={roastStatusFilter}
                  onChange={(e) => setRoastStatusFilter(e.target.value)}
                  className="py-1.5 px-2.5 rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] text-xs text-[#1A1A1A] focus:bg-white focus:border-[#8E2030] focus:outline-hidden font-sans"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="Planificada">Planificada</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Completado">Completado</option>
                </select>

                <button
                  onClick={() => setIsNewRoastModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#8E2030] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#721926] active:scale-98 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Nuevo Tueste</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans text-[#1A1A1A]">
                <thead className="border-b border-[#1A1A1A]/10 text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/50">
                  <tr>
                    <th className="py-2.5 px-3">Lote / OT</th>
                    <th className="py-2.5 px-3">Producto &amp; Composición</th>
                    <th className="py-2.5 px-3">Carga Verde</th>
                    <th className="py-2.5 px-3">Rendimiento Real</th>
                    <th className="py-2.5 px-3">Merma (%)</th>
                    <th className="py-2.5 px-3">Tostadora / Perfil</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]/5">
                  {filteredBatches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-[#F9F7F2]/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-[#8E2030]">{batch.batchNumber}</div>
                        <div className="text-[10px] text-[#1A1A1A]/50 font-mono">
                          {batch.code} • {batch.date}
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#1A1A1A]">{batch.productName}</span>
                          {batch.isBlend && (
                            <span className="bg-[#8E2030]/10 text-[#8E2030] border border-[#8E2030]/20 px-1.5 py-0.2 rounded text-[9px] font-bold">
                              BLEND
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#1A1A1A]/60 truncate" title={batch.greenCoffeeOrigin}>
                          {batch.greenCoffeeOrigin}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-[#1A1A1A]">{batch.greenCoffeeKg} Kg</span>
                        <span className="text-[10px] text-[#1A1A1A]/50 block">verde cargado</span>
                      </td>

                      <td className="py-3 px-3">
                        {batch.actualRoastedKg ? (
                          <div>
                            <span className="font-mono font-bold text-emerald-800 text-sm">
                              {batch.actualRoastedKg} Kg
                            </span>
                            <span className="text-[10px] text-emerald-700 block">tostado en frío</span>
                          </div>
                        ) : (
                          <div className="text-[#1A1A1A]/50 font-mono">
                            Obj: ~{batch.roastedCoffeeTargetKg} Kg
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {batch.lossPercent !== undefined ? (
                          <div>
                            <span className="font-mono font-bold text-[#8E2030]">
                              {batch.lossPercent}%
                            </span>
                            <span className="text-[10px] text-[#1A1A1A]/40 block">
                              (esp. {batch.expectedLossPercent || 15.5}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#1A1A1A]/40 font-mono">Est: {batch.expectedLossPercent || 15.5}%</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-[#1A1A1A]">{batch.roasterMachine}</div>
                        <div className="text-[10px] text-[#1A1A1A]/50 truncate max-w-[160px]">{batch.roastProfile}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            batch.status === "Completado"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : batch.status === "En Proceso"
                              ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                              : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                          }`}
                        >
                          {batch.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {batch.status !== "Completado" ? (
                            <button
                              onClick={() => setBatchToComplete(batch)}
                              className="flex items-center gap-1 rounded bg-[#1A1A1A] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-800 shadow-2xs transition-colors"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Finalizar Tueste</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedBatchForLabel(batch)}
                              className="flex items-center gap-1 rounded border border-[#8E2030]/30 bg-[#8E2030]/5 px-2.5 py-1 text-[11px] font-bold text-[#8E2030] hover:bg-[#8E2030] hover:text-white transition-all shadow-2xs"
                            >
                              <Printer className="h-3 w-3" />
                              <span>Etiqueta Lote</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredBatches.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#1A1A1A]/50">
                        No se encontraron lotes de tueste con los criterios seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Green Coffee Silos & Receipts */}
      {activeSubTab === "verde" && (
        <GreenCoffeeInventoryTable
          onOpenReceiptModal={() => setIsReceiptModalOpen(true)}
          onOpenAdjustmentModal={handleOpenAdjustmentForLot}
          onPlanRoastWithLot={handlePlanRoastFromLot}
          onPrintGreenLotLabel={handlePrintGreenLot}
        />
      )}

      {/* Tab 3: Traceability & Label Explorer */}
      {activeSubTab === "trazabilidad" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1A1A1A]/10 pb-3">
              <QrCode className="h-5 w-5 text-[#8E2030]" />
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                  Generador &amp; Impresor de Etiquetas de Trazabilidad Térmicas
                </h3>
                <p className="text-xs text-[#1A1A1A]/60">
                  Selecciona cualquier lote de producción para generar la etiqueta térmica con código QR, composición de blend y ventana de cata.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productionOrders.map((batch) => (
                <div
                  key={batch.id}
                  className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-4 space-y-3 hover:border-[#8E2030]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#8E2030]">
                        {batch.batchNumber}
                      </span>
                      <span className="text-[10px] font-mono text-[#1A1A1A]/50">
                        {batch.date}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-base text-[#1A1A1A] mt-1">
                      {batch.productName}
                    </h4>
                    <p className="text-xs text-[#1A1A1A]/70 line-clamp-2 mt-0.5">
                      {batch.greenCoffeeOrigin}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-[#1A1A1A]/10 mt-3">
                      <div>
                        <span className="text-[#1A1A1A]/50 block">Rendimiento</span>
                        <strong className="text-[#1A1A1A]">
                          {batch.actualRoastedKg || batch.roastedCoffeeTargetKg} Kg
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#1A1A1A]/50 block">Merma</span>
                        <strong className="text-[#8E2030]">
                          {batch.lossPercent ? `${batch.lossPercent}%` : "En proceso"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedBatchForLabel(batch)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#1A1A1A] py-2 text-xs font-bold text-white hover:bg-[#8E2030] shadow-xs transition-colors"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Ver e Imprimir Etiqueta</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Kardex Movements Ledger */}
      {activeSubTab === "kardex" && (
        <StockMovementsLedger
          onOpenAdjustmentModal={() => handleOpenAdjustmentForLot()}
        />
      )}

      {/* Modals */}
      <NewRoastOrderModal
        isOpen={isNewRoastModalOpen}
        onClose={() => setIsNewRoastModalOpen(false)}
      />

      <CompleteRoastModal
        batch={batchToComplete}
        onClose={() => setBatchToComplete(null)}
        onComplete={(id, kg, notes) => completeProductionBatch(id, kg, notes)}
      />

      <GreenCoffeeReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      <TraceabilityLabelModal
        batch={selectedBatchForLabel}
        onClose={() => setSelectedBatchForLabel(null)}
      />

      <StockAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => {
          setIsAdjustmentModalOpen(false);
          setPreselectedAdjustLotId(undefined);
        }}
        preselectedItemId={preselectedAdjustLotId}
      />
    </div>
  );
};
