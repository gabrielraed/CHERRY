import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { BlendComponent, GreenCoffeeReceipt } from "../../types";
import { Flame, X, Plus, Trash2, Scale, Layers, Sparkles, AlertCircle, Info } from "lucide-react";

interface NewRoastOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewRoastOrderModal: React.FC<NewRoastOrderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { products, greenCoffeeReceipts, addProductionBatch, currentUser } = useApp();

  const [orderType, setOrderType] = useState<"single" | "blend">("single");
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [singleGreenLotId, setSingleGreenLotId] = useState(greenCoffeeReceipts[0]?.id || "");
  const [totalGreenKg, setTotalGreenKg] = useState<number>(60);
  const [roastProfile, setRoastProfile] = useState("Espresso Medio (Perfil Cherry Blend)");
  const [roasterMachine, setRoasterMachine] = useState("Giesen W15A Roaster");
  const [expectedLossPercent, setExpectedLossPercent] = useState<number>(15.5);
  const [notes, setNotes] = useState("");

  // Blend components state
  const [blendComponents, setBlendComponents] = useState<
    { greenLotId: string; percentage: number }[]
  >([
    { greenLotId: greenCoffeeReceipts[0]?.id || "", percentage: 70 },
    { greenLotId: greenCoffeeReceipts[1]?.id || "", percentage: 30 },
  ]);

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const singleGreenLot = greenCoffeeReceipts.find((l) => l.id === singleGreenLotId);

  // Target roasted kg estimation
  const estimatedRoastedKg = Number((totalGreenKg * (1 - expectedLossPercent / 100)).toFixed(1));

  // Blend calculation
  const totalBlendPercent = blendComponents.reduce((sum, c) => sum + (Number(c.percentage) || 0), 0);
  const isBlendValid = totalBlendPercent === 100;

  const handleAddBlendComponent = () => {
    const availableLots = greenCoffeeReceipts.filter(
      (lot) => !blendComponents.some((c) => c.greenLotId === lot.id)
    );
    const nextLotId = availableLots[0]?.id || greenCoffeeReceipts[0]?.id || "";
    setBlendComponents([...blendComponents, { greenLotId: nextLotId, percentage: 0 }]);
  };

  const handleRemoveBlendComponent = (index: number) => {
    if (blendComponents.length <= 1) return;
    setBlendComponents(blendComponents.filter((_, i) => i !== index));
  };

  const handleUpdateBlendComponent = (index: number, field: "greenLotId" | "percentage", value: any) => {
    setBlendComponents(
      blendComponents.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (orderType === "blend" && !isBlendValid) {
      alert("La suma de porcentajes del blend debe ser exactamente 100%.");
      return;
    }

    const todayStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const generatedBatchNumber = `LOT-TOST-${todayStr}-${Math.floor(10 + Math.random() * 90)}`;

    if (orderType === "blend") {
      const calculatedComponents: BlendComponent[] = blendComponents.map((c) => {
        const lot = greenCoffeeReceipts.find((l) => l.id === c.greenLotId);
        const compKg = Number(((totalGreenKg * Number(c.percentage)) / 100).toFixed(1));
        return {
          greenLotId: c.greenLotId,
          greenLotNumber: lot?.lotNumber || "LOT-GV",
          origin: `${lot?.originCountry} ${lot?.region} (${lot?.farmOrProducer || lot?.variety})`,
          percentage: Number(c.percentage),
          greenKg: compKg,
        };
      });

      const blendOriginDesc = calculatedComponents
        .map((c) => `${c.origin} (${c.percentage}%)`)
        .join(" + ");

      addProductionBatch({
        productId: selectedProductId,
        productName: selectedProduct?.name || "Blend de la Casa",
        isBlend: true,
        blendComponents: calculatedComponents,
        greenCoffeeOrigin: blendOriginDesc,
        greenCoffeeKg: Number(totalGreenKg),
        roastedCoffeeTargetKg: estimatedRoastedKg,
        expectedLossPercent: Number(expectedLossPercent),
        roastProfile,
        roasterMachine,
        batchNumber: generatedBatchNumber,
        status: "Planificada",
        notes,
      });
    } else {
      addProductionBatch({
        productId: selectedProductId,
        productName: selectedProduct?.name || "Single Origin Roast",
        isBlend: false,
        greenLotNumber: singleGreenLot?.lotNumber,
        greenCoffeeOrigin: `${singleGreenLot?.originCountry} ${singleGreenLot?.region} (${singleGreenLot?.variety})`,
        greenCoffeeKg: Number(totalGreenKg),
        roastedCoffeeTargetKg: estimatedRoastedKg,
        expectedLossPercent: Number(expectedLossPercent),
        roastProfile,
        roasterMachine,
        batchNumber: generatedBatchNumber,
        status: "Planificada",
        notes,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-[#1A1A1A]/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 px-6 py-4 bg-[#F9F7F2]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8E2030] text-white shadow-xs">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#8E2030]">
                Orden de Trabajo de Tueste
              </span>
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">
                Planificar Tueste &amp; Merma
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs font-sans">
          {/* Order Type Toggle: Single Origin vs Blend */}
          <div className="flex rounded-xl bg-[#F9F7F2] p-1.5 border border-[#1A1A1A]/10">
            <button
              type="button"
              onClick={() => setOrderType("single")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                orderType === "single"
                  ? "bg-white text-[#1A1A1A] shadow-xs border border-[#1A1A1A]/10"
                  : "text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
              }`}
            >
              <Scale className="h-4 w-4 text-[#8E2030]" />
              <span>Origen Único (Single Origin)</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType("blend")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                orderType === "blend"
                  ? "bg-white text-[#1A1A1A] shadow-xs border border-[#1A1A1A]/10"
                  : "text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
              }`}
            >
              <Layers className="h-4 w-4 text-[#8E2030]" />
              <span>Blend / Mezcla Multi-origen</span>
            </button>
          </div>

          {/* Product selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#1A1A1A]">Producto Terminado a Producir *</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs font-medium text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — Stock actual: {p.stock} Kg ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Single Origin Green Coffee Selection */}
          {orderType === "single" && (
            <div className="space-y-1.5 rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-4">
              <label className="font-semibold text-[#1A1A1A] flex items-center justify-between">
                <span>Lote de Café Verde a Cargar *</span>
                {singleGreenLot && (
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                    Disponible: {singleGreenLot.availableKg} Kg
                  </span>
                )}
              </label>
              <select
                value={singleGreenLotId}
                onChange={(e) => setSingleGreenLotId(e.target.value)}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                required
              >
                {greenCoffeeReceipts.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.lotNumber} — {lot.originCountry} {lot.region} ({lot.variety}, {lot.process}) • {lot.availableKg} Kg disp. (Silo: {lot.warehouseLocation})
                  </option>
                ))}
              </select>

              {singleGreenLot && (
                <div className="grid grid-cols-3 gap-2 text-[10px] text-[#1A1A1A]/70 pt-2 border-t border-[#1A1A1A]/10">
                  <div>
                    <span className="font-bold block text-[#1A1A1A]">Humedad:</span>
                    {singleGreenLot.humidityPercent || 11}%
                  </div>
                  <div>
                    <span className="font-bold block text-[#1A1A1A]">Cata SCA:</span>
                    {singleGreenLot.scaScore || 85} pts
                  </div>
                  <div>
                    <span className="font-bold block text-[#1A1A1A]">Costo/Kg:</span>
                    ${singleGreenLot.costPerKgUSD} USD
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Blend Components Multi-Origin Builder */}
          {orderType === "blend" && (
            <div className="space-y-3 rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-semibold text-[#1A1A1A] block">
                    Composición del Blend (Lotes Verdes)
                  </label>
                  <p className="text-[10px] text-[#1A1A1A]/60">
                    Define la proporción % de cada lote verde para el cálculo de descontado de stock
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddBlendComponent}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#8E2030] bg-white border border-[#8E2030]/20 px-2.5 py-1 rounded-md hover:bg-[#8E2030] hover:text-white transition-all shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Agregar Lote</span>
                </button>
              </div>

              {/* Components list */}
              <div className="space-y-2">
                {blendComponents.map((comp, index) => {
                  const lot = greenCoffeeReceipts.find((l) => l.id === comp.greenLotId);
                  const componentKg = ((totalGreenKg * (Number(comp.percentage) || 0)) / 100).toFixed(1);

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-[#1A1A1A]/10 shadow-2xs"
                    >
                      <span className="font-bold text-[#8E2030] text-[10px] w-5 text-center">
                        #{index + 1}
                      </span>
                      <div className="flex-1">
                        <select
                          value={comp.greenLotId}
                          onChange={(e) => handleUpdateBlendComponent(index, "greenLotId", e.target.value)}
                          className="w-full rounded border border-[#1A1A1A]/15 bg-white px-2 py-1 text-[11px] text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                        >
                          {greenCoffeeReceipts.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.lotNumber}: {l.originCountry} {l.region} ({l.availableKg} Kg disp.)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24 flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={comp.percentage}
                          onChange={(e) =>
                            handleUpdateBlendComponent(index, "percentage", Number(e.target.value))
                          }
                          className="w-14 rounded border border-[#1A1A1A]/15 px-2 py-1 text-right text-xs font-bold text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                          placeholder="%"
                        />
                        <span className="text-xs font-bold text-[#1A1A1A]/60">%</span>
                      </div>

                      <div className="w-20 text-right font-mono text-[11px] font-bold text-[#1A1A1A]">
                        {componentKg} <span className="text-[9px] font-normal text-[#1A1A1A]/50">Kg</span>
                      </div>

                      {blendComponents.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBlendComponent(index)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Total percentage validation indicator */}
              <div
                className={`flex items-center justify-between p-2 rounded-lg text-[11px] font-bold ${
                  isBlendValid
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {!isBlendValid && <AlertCircle className="h-4 w-4 text-red-600" />}
                  <span>Total Proporción Blend:</span>
                </div>
                <div className="font-mono text-sm">
                  {totalBlendPercent}% {isBlendValid ? "(Válido 100%)" : `(Debe ser 100%, falta/sobra ${100 - totalBlendPercent}%)`}
                </div>
              </div>
            </div>
          )}

          {/* Green Kg & Roaster Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">Café Verde a Cargar (Kg) *</label>
              <input
                type="number"
                min="5"
                max="500"
                step="0.5"
                value={totalGreenKg}
                onChange={(e) => setTotalGreenKg(Number(e.target.value))}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs font-bold text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">Merma Esperada (%)</label>
              <input
                type="number"
                min="10"
                max="25"
                step="0.1"
                value={expectedLossPercent}
                onChange={(e) => setExpectedLossPercent(Number(e.target.value))}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">Tostado Objetivo Est.</label>
              <div className="rounded-lg bg-[#F9F7F2] border border-[#1A1A1A]/10 px-3 py-2 text-xs font-mono font-bold text-[#8E2030]">
                ~{estimatedRoastedKg} Kg tostado
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">Tostadora Asignada *</label>
              <select
                value={roasterMachine}
                onChange={(e) => setRoasterMachine(e.target.value)}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
              >
                <option value="Giesen W15A Roaster (Tambor 15 Kg)">Giesen W15A Roaster (Tambor 15 Kg)</option>
                <option value="Diedrich IR-12 Specialty Roaster">Diedrich IR-12 Specialty Roaster</option>
                <option value="Probat UG22 Industrial">Probat UG22 Industrial</option>
                <option value="Aillio Bullet R1 (Muestras de Cata)">Aillio Bullet R1 (Muestras de Cata)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">Perfil de Tueste *</label>
              <select
                value={roastProfile}
                onChange={(e) => setRoastProfile(e.target.value)}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
              >
                <option value="Espresso Medio-Oscuro (DTR 21% - Cuerpo y Crema)">Espresso Medio-Oscuro (DTR 21% - Cuerpo y Crema)</option>
                <option value="Omnitostado Equilibrado (DTR 18.5% - Espresso & Filtro)">Omnitostado Equilibrado (DTR 18.5% - Espresso & Filtro)</option>
                <option value="Claro Nórdico Filtro (DTR 15.5% - Acidez y Fruta)">Claro Nórdico Filtro (DTR 15.5% - Acidez y Fruta)</option>
                <option value="Dark French Roast (DTR 24% - Intenso)">Dark French Roast (DTR 24% - Intenso)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#1A1A1A]">Notas de Batch / Observaciones</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Curva piloto para nueva cosecha; ajustar airflow en primer crack."
              className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
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
              disabled={orderType === "blend" && !isBlendValid}
              className="flex items-center gap-2 rounded-lg bg-[#8E2030] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#721926] disabled:opacity-50 active:scale-98 transition-all"
            >
              <Flame className="h-4 w-4" />
              <span>Crear Orden de Tueste</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
