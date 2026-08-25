import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { GreenCoffeeReceipt } from "../../types";
import { Wheat, X, Plus, FileText, Scale, Droplets, Sparkles, MapPin } from "lucide-react";

interface GreenCoffeeReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GreenCoffeeReceiptModal: React.FC<GreenCoffeeReceiptModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addGreenCoffeeReceipt, greenCoffeeReceipts, currentUser } = useApp();

  const todayStr = new Date().toISOString().split("T")[0];
  const lotCodeDefault = `LOT-GV-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${String(greenCoffeeReceipts.length + 1).padStart(2, "0")}`;
  const remitoCodeDefault = `REM-VERDE-${String(greenCoffeeReceipts.length + 4896)}`;

  const [receiptNumber, setReceiptNumber] = useState(remitoCodeDefault);
  const [lotNumber, setLotNumber] = useState(lotCodeDefault);
  const [date, setDate] = useState(todayStr);
  const [supplier, setSupplier] = useState("Importadora Café de Origen S.A.");
  const [originCountry, setOriginCountry] = useState("Colombia");
  const [region, setRegion] = useState("Huila, San Agustín");
  const [farmOrProducer, setFarmOrProducer] = useState("Finca La Esperanza");
  const [variety, setVariety] = useState("Caturra / Castillo");
  const [process, setProcess] = useState("Lavado");
  const [altitudeMeters, setAltitudeMeters] = useState(1750);
  const [bagCount, setBagCount] = useState(15);
  const [kgPerBag, setKgPerBag] = useState(60);
  const [costPerKgUSD, setCostPerKgUSD] = useState(6.8);
  const [warehouseLocation, setWarehouseLocation] = useState("Silo Verde 01 - Planta Central");
  const [humidityPercent, setHumidityPercent] = useState(11.2);
  const [scaScore, setScaScore] = useState(86.5);
  const [sensoryNotes, setSensoryNotes] = useState("Notas a caramelo, durazno, chocolate con leche y acidez cítrica brillante.");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const calculatedTotalKg = bagCount * kgPerBag;
  const totalCostUSD = calculatedTotalKg * costPerKgUSD;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addGreenCoffeeReceipt({
      receiptNumber,
      lotNumber,
      date,
      supplier,
      originCountry,
      region,
      farmOrProducer,
      variety,
      process,
      altitudeMeters: Number(altitudeMeters),
      bagCount: Number(bagCount),
      kgPerBag: Number(kgPerBag),
      totalGreenKg: Number(calculatedTotalKg),
      availableKg: Number(calculatedTotalKg),
      costPerKgUSD: Number(costPerKgUSD),
      warehouseLocation,
      humidityPercent: Number(humidityPercent),
      scaScore: Number(scaScore),
      sensoryNotes,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-[#1A1A1A]/10 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 px-6 py-4 bg-[#F9F7F2]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8E2030] text-white shadow-xs">
              <Wheat className="h-5 w-5" />
            </div>
            <div>
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#8E2030]">
                Ingreso de Materia Prima
              </span>
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">
                Remito de Entrada &amp; Asignación de Lote Verde
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs font-sans max-h-[80vh] overflow-y-auto">
          {/* Top Identifiers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">N° Remito de Entrada *</label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs font-mono font-bold text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">N° Lote Asignado (Trazabilidad) *</label>
              <input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs font-mono font-bold text-[#8E2030] focus:border-[#8E2030] focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">Fecha de Ingreso *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                required
              />
            </div>
          </div>

          {/* Supplier & Origin Details */}
          <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-4 space-y-3">
            <div className="font-bold text-[#1A1A1A] flex items-center gap-1.5 text-xs">
              <MapPin className="h-4 w-4 text-[#8E2030]" />
              <span>Procedencia, Finca y Proveedor</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[#1A1A1A]/70 font-medium">Proveedor / Importador *</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-white px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#1A1A1A]/70 font-medium">País de Origen *</label>
                <select
                  value={originCountry}
                  onChange={(e) => setOriginCountry(e.target.value)}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-white px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                >
                  <option value="Colombia">Colombia</option>
                  <option value="Brasil">Brasil</option>
                  <option value="Etiopía">Etiopía</option>
                  <option value="Guatemala">Guatemala</option>
                  <option value="Costa Rica">Costa Rica</option>
                  <option value="Kenia">Kenia</option>
                  <option value="Perú">Perú</option>
                  <option value="Honduras">Honduras</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#1A1A1A]/70 font-medium">Región / Terroir *</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-white px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[#1A1A1A]/70 font-medium">Finca / Productor</label>
                <input
                  type="text"
                  value={farmOrProducer}
                  onChange={(e) => setFarmOrProducer(e.target.value)}
                  placeholder="Ej: Finca Vista Hermosa"
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-white px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#1A1A1A]/70 font-medium">Variedad Botánica</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-white px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#1A1A1A]/70 font-medium">Proceso de Beneficio</label>
                <select
                  value={process}
                  onChange={(e) => setProcess(e.target.value)}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-white px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                >
                  <option value="Lavado">Lavado (Washed)</option>
                  <option value="Natural">Natural (Dry Process)</option>
                  <option value="Honey Amarillo">Honey Amarillo</option>
                  <option value="Honey Rojo / Negro">Honey Rojo / Negro</option>
                  <option value="Anaeróbico">Anaeróbico 72h</option>
                  <option value="Maceración Carbónica">Maceración Carbónica</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#1A1A1A]/70 font-medium">Altura (msnm)</label>
                <input
                  type="number"
                  value={altitudeMeters}
                  onChange={(e) => setAltitudeMeters(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-white px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Quantity & Silo Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">Cantidad de Sacos *</label>
              <input
                type="number"
                min="1"
                value={bagCount}
                onChange={(e) => setBagCount(Number(e.target.value))}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs font-bold text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">Kg por Saco *</label>
              <input
                type="number"
                min="1"
                value={kgPerBag}
                onChange={(e) => setKgPerBag(Number(e.target.value))}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">Total Kg Verde</label>
              <div className="rounded-lg bg-[#F9F7F2] border border-[#1A1A1A]/10 px-3 py-2 text-xs font-mono font-bold text-[#8E2030]">
                {calculatedTotalKg} Kg
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">Costo Unit. USD / Kg</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={costPerKgUSD}
                  onChange={(e) => setCostPerKgUSD(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs font-mono font-bold text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
                  required
                />
                <span className="absolute right-3 top-2 text-[10px] text-[#1A1A1A]/40 font-mono">USD</span>
              </div>
            </div>
          </div>

          {/* Quality & Storage metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">Ubicación en Depósito / Silo *</label>
              <select
                value={warehouseLocation}
                onChange={(e) => setWarehouseLocation(e.target.value)}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
              >
                <option value="Silo Verde 01 - CABA">Silo Verde 01 - CABA</option>
                <option value="Silo Verde 02 - Microcentro">Silo Verde 02 - Microcentro</option>
                <option value="Depósito Pallets Zona Norte">Depósito Pallets Zona Norte</option>
                <option value="Almacén Climatizado Muestras Especiales">Almacén Climatizado Muestras Especiales</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">Humedad Grano Verde (%)</label>
              <input
                type="number"
                step="0.1"
                min="8"
                max="15"
                value={humidityPercent}
                onChange={(e) => setHumidityPercent(Number(e.target.value))}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs font-mono text-[#1A1A1A] focus:border-[#8E2030] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1A1A1A]">Puntaje SCA (Cata Verde)</label>
              <input
                type="number"
                step="0.25"
                min="80"
                max="95"
                value={scaScore}
                onChange={(e) => setScaScore(Number(e.target.value))}
                className="w-full rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-2 text-xs font-mono font-bold text-emerald-800 focus:border-[#8E2030] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#1A1A1A]">Notas Sensoriales / Descriptor de Cata</label>
            <input
              type="text"
              value={sensoryNotes}
              onChange={(e) => setSensoryNotes(e.target.value)}
              placeholder="Ej: Chocolate amargo, almendras tostadas, acidez málica..."
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
              className="flex items-center gap-2 rounded-lg bg-[#8E2030] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#721926] active:scale-98 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Registrar Remito &amp; Cargar Stock Verde</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
