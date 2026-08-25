import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { ShieldCheck, Lock, Unlock, X, AlertTriangle, Scale, CheckCircle2 } from "lucide-react";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedItemType?: "CAFE_VERDE" | "CAFE_TOSTADO";
  preselectedItemId?: string;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  preselectedItemType = "CAFE_VERDE",
  preselectedItemId,
}) => {
  const {
    products,
    greenCoffeeReceipts,
    adjustStock,
    currentUser,
  } = useApp();

  const [itemType, setItemType] = useState<"CAFE_VERDE" | "CAFE_TOSTADO">(preselectedItemType);
  const [selectedGreenLotId, setSelectedGreenLotId] = useState<string>(
    preselectedItemId || greenCoffeeReceipts[0]?.id || ""
  );
  const [selectedProductId, setSelectedProductId] = useState<string>(
    preselectedItemId || products[0]?.id || ""
  );
  const [adjustmentDirection, setAdjustmentDirection] = useState<"increment" | "decrement">("decrement");
  const [amountKg, setAmountKg] = useState<number>(5);
  const [reason, setReason] = useState<string>("Merma extraordinaria en almacenamiento");
  const [notes, setNotes] = useState<string>("");
  const [supervisorCode, setSupervisorCode] = useState<string>("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  if (!isOpen) return null;

  const isRoleAuthorized = ["ADMIN_EMPRESA", "SUPER_ADMIN", "GERENTE", "PRODUCCION"].includes(currentUser.role);

  const activeGreenLot = greenCoffeeReceipts.find((l) => l.id === selectedGreenLotId);
  const activeProduct = products.find((p) => p.id === selectedProductId);

  const currentStockKg = itemType === "CAFE_VERDE"
    ? activeGreenLot?.availableKg || 0
    : activeProduct?.stock || 0;

  const effectiveAdjustment = adjustmentDirection === "increment" ? Math.abs(amountKg) : -Math.abs(amountKg);
  const newProjectedStock = Math.max(0, currentStockKg + effectiveAdjustment);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const itemId = itemType === "CAFE_VERDE" ? selectedGreenLotId : selectedProductId;
    const res = adjustStock({
      itemType,
      itemId,
      adjustmentKg: effectiveAdjustment,
      reason,
      notes,
      supervisorAuthCode: supervisorCode,
    });

    if (res.success) {
      setFeedback({ type: "success", message: res.message });
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1400);
    } else {
      setFeedback({ type: "error", message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-[#1A1A1A]/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 px-6 py-4 bg-[#F9F7F2]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8E2030] text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#8E2030]">
                  Control Restringido de Inventario
                </span>
                <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[9px] font-bold flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Solo Autorizados
                </span>
              </div>
              <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
                Ajuste Manual de Stock
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          {/* Authorization status badge */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              isRoleAuthorized
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            {isRoleAuthorized ? (
              <Unlock className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <Lock className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">
                Operador: {currentUser.name} ({currentUser.role})
              </span>
              <p className="text-[11px] mt-0.5 opacity-80">
                {isRoleAuthorized
                  ? "Usuario con permisos directos de ajuste de stock habilitados."
                  : "Tu rol requiere ingresar el PIN de Supervisor (PIN demo: CHERRY2026 o 1234) para autorizar este ajuste."}
              </p>
            </div>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 font-bold ${
                feedback.type === "success"
                  ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                  : "bg-red-100 border-red-300 text-red-900"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-700 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Item Type selection */}
          <div className="space-y-1">
            <label className="font-semibold text-[#1A1A1A]">Tipo de Inventario a Ajustar *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setItemType("CAFE_VERDE")}
                className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                  itemType === "CAFE_VERDE"
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-white border-[#1A1A1A]/20 text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5"
                }`}
              >
                Café Verde (Lotes / Silos)
              </button>
              <button
                type="button"
                onClick={() => setItemType("CAFE_TOSTADO")}
                className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                  itemType === "CAFE_TOSTADO"
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-white border-[#1A1A1A]/20 text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5"
                }`}
              >
                Café Tostado (Productos)
              </button>
            </div>
          </div>

          {/* Item selector */}
          {itemType === "CAFE_VERDE" ? (
            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">Seleccionar Lote de Café Verde *</label>
              <select
                value={selectedGreenLotId}
                onChange={(e) => setSelectedGreenLotId(e.target.value)}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
              >
                {greenCoffeeReceipts.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.lotNumber}: {lot.originCountry} {lot.region} • {lot.availableKg} Kg disponibles
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">Seleccionar Producto Tostado *</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
              >
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} • Stock actual: {prod.stock} Kg
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Adjustment Direction & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">Sentido del Ajuste *</label>
              <select
                value={adjustmentDirection}
                onChange={(e) => setAdjustmentDirection(e.target.value as any)}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden font-bold"
              >
                <option value="decrement">Disminución (-) Merma / Rotura</option>
                <option value="increment">Incremento (+) Sobrante / Conteo</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">Cantidad a Ajustar (Kg) *</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={amountKg}
                onChange={(e) => setAmountKg(Number(e.target.value))}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs font-mono font-bold text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                required
              />
            </div>
          </div>

          {/* Live stock preview calculation */}
          <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-3 flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[10px] text-[#1A1A1A]/60 block uppercase font-bold">Stock Anterior</span>
              <span className="font-bold text-[#1A1A1A]">{currentStockKg} Kg</span>
            </div>
            <div className="text-center font-bold text-[#8E2030]">
              {effectiveAdjustment > 0 ? `+${effectiveAdjustment}` : effectiveAdjustment} Kg
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#1A1A1A]/60 block uppercase font-bold">Nuevo Stock</span>
              <span className="font-bold text-emerald-800 text-sm">{newProjectedStock} Kg</span>
            </div>
          </div>

          {/* Reason selector */}
          <div className="space-y-1">
            <label className="font-semibold text-[#1A1A1A]">Motivo del Ajuste (Auditoría Obligatoria) *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
            >
              <option value="Merma extraordinaria en almacenamiento / Silo">Merma extraordinaria en almacenamiento / Silo</option>
              <option value="Toma de inventario físico mensual / Conteo">Toma de inventario físico mensual / Conteo</option>
              <option value="Muestra para cata SCA o control de calidad">Muestra para cata SCA o control de calidad</option>
              <option value="Rotura de empaque / Defecto de válvula">Rotura de empaque / Defecto de válvula</option>
              <option value="Calibración y purga de tostadora / Molino">Calibración y purga de tostadora / Molino</option>
              <option value="Corrección de remito / Error de carga">Corrección de remito / Error de carga</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#1A1A1A]">Detalle / Justificación</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Silo 1 requirió purga de 5 Kg por grano quebrado..."
              className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
            />
          </div>

          {/* Supervisor Code (if not direct role) */}
          {!isRoleAuthorized && (
            <div className="space-y-1 bg-amber-50/70 border border-amber-200 p-3 rounded-xl">
              <label className="font-bold text-amber-900 flex items-center justify-between">
                <span>PIN de Autorización de Supervisor *</span>
                <span className="text-[10px] text-amber-700 font-normal">Demo: CHERRY2026</span>
              </label>
              <input
                type="password"
                value={supervisorCode}
                onChange={(e) => setSupervisorCode(e.target.value)}
                placeholder="Ingresar PIN supervisor..."
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-mono font-bold text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                required={!isRoleAuthorized}
              />
            </div>
          )}

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
              className="flex items-center gap-2 rounded-lg bg-[#8E2030] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#721926] active:scale-98 transition-all"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Aplicar Ajuste de Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
