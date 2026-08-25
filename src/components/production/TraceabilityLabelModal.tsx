import React, { useRef } from "react";
import { ProductionOrder, GreenCoffeeReceipt } from "../../types";
import { Printer, X, QrCode, CheckCircle2, Flame, Sparkles, Coffee, ShieldCheck } from "lucide-react";

interface TraceabilityLabelModalProps {
  batch: ProductionOrder | null;
  greenLot?: GreenCoffeeReceipt | null;
  onClose: () => void;
}

export const TraceabilityLabelModal: React.FC<TraceabilityLabelModalProps> = ({
  batch,
  greenLot,
  onClose,
}) => {
  const labelRef = useRef<HTMLDivElement>(null);
  const [labelFormat, setLabelFormat] = React.useState<"bolsa" | "caja">("bolsa");
  const [bagSize, setBagSize] = React.useState<"250g" | "500g" | "1Kg">("1Kg");

  if (!batch) return null;

  const handlePrint = () => {
    window.print();
  };

  const roastDate = batch.date || new Date().toISOString().split("T")[0];
  const bestBeforeDate = new Date(new Date(roastDate).getTime() + (batch.bestBeforeDays || 90) * 86400000)
    .toISOString()
    .split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static print:z-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-[#1A1A1A]/10 overflow-hidden print:border-none print:shadow-none print:w-full">
        {/* Header - Hidden during print */}
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 px-6 py-4 bg-[#F9F7F2] print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8E2030] text-white shadow-xs">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#8E2030]">
                  Trazabilidad de Lote
                </span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] font-bold">
                  Verificado SCA
                </span>
              </div>
              <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
                Etiqueta Térmica &amp; Código de Lote
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-[#8E2030] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#721926] active:scale-98 transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir Etiqueta</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-[#1A1A1A]/60 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Controls - Hidden during print */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-[#F9F7F2]/50 border-b border-[#1A1A1A]/10 text-xs font-sans print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-[#1A1A1A]/60 font-medium">Formato:</span>
            <button
              onClick={() => setLabelFormat("bolsa")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                labelFormat === "bolsa"
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5"
              }`}
            >
              Bolsa de Café
            </button>
            <button
              onClick={() => setLabelFormat("caja")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                labelFormat === "caja"
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5"
              }`}
            >
              Caja / Pallet Mayorista
            </button>
          </div>

          {labelFormat === "bolsa" && (
            <div className="flex items-center gap-1.5">
              <span className="text-[#1A1A1A]/60 font-medium">Presentación:</span>
              {(["250g", "500g", "1Kg"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setBagSize(size)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    bagSize === size
                      ? "bg-[#8E2030] text-white"
                      : "bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Printable Label Area */}
        <div className="p-6 flex justify-center bg-zinc-100 print:bg-white print:p-0">
          <div
            ref={labelRef}
            className={`bg-white border-2 border-dashed border-[#1A1A1A]/30 p-6 rounded-xl text-[#1A1A1A] font-sans shadow-sm print:border-solid print:border-[#1A1A1A] print:shadow-none print:rounded-none ${
              labelFormat === "bolsa" ? "w-[380px]" : "w-[480px]"
            }`}
          >
            {/* Label Header */}
            <div className="flex items-start justify-between border-b-2 border-[#1A1A1A] pb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-[#8E2030]" />
                  <span className="font-serif font-black text-base tracking-wider uppercase text-[#1A1A1A]">
                    CHERRY TOST
                  </span>
                </div>
                <p className="font-sans text-[9px] uppercase tracking-[0.25em] font-semibold text-[#8E2030]">
                  Specialty Coffee Roasters • CABA
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block border border-[#1A1A1A] px-2 py-0.5 font-mono text-[10px] font-bold rounded">
                  {labelFormat === "bolsa" ? `PESO NETO ${bagSize}` : "PALLET / CAJA"}
                </span>
                <p className="text-[9px] text-[#1A1A1A]/60 font-mono mt-0.5">{batch.code}</p>
              </div>
            </div>

            {/* Product Name & Profile */}
            <div className="my-4 text-center">
              <h3 className="font-serif text-xl font-black text-[#1A1A1A] tracking-tight leading-tight">
                {batch.productName}
              </h3>
              <p className="text-xs font-semibold text-[#8E2030] mt-0.5">
                {batch.roastProfile}
              </p>
            </div>

            {/* Batch & Traceability Grid */}
            <div className="rounded-lg border border-[#1A1A1A]/20 bg-[#F9F7F2] p-3 text-[11px] space-y-2 mb-4">
              <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-1.5">
                <span className="font-semibold text-[#1A1A1A]/60 uppercase text-[9px] tracking-wider">
                  N° Lote Tostado:
                </span>
                <span className="font-mono font-bold text-[#8E2030] bg-white px-2 py-0.5 rounded border border-[#1A1A1A]/15">
                  {batch.batchNumber}
                </span>
              </div>

              {batch.isBlend && batch.blendComponents && batch.blendComponents.length > 0 ? (
                <div className="space-y-1">
                  <span className="font-semibold text-[#1A1A1A]/60 uppercase text-[9px] tracking-wider block">
                    Composición del Blend (Lotes Verdes):
                  </span>
                  <div className="space-y-1">
                    {batch.blendComponents.map((comp, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] bg-white p-1 rounded border border-[#1A1A1A]/10 font-mono">
                        <span>{comp.origin}</span>
                        <span className="font-bold text-[#8E2030]">{comp.percentage}% ({comp.greenLotNumber})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-1.5">
                  <span className="font-semibold text-[#1A1A1A]/60 uppercase text-[9px] tracking-wider">
                    Lote Café Verde:
                  </span>
                  <span className="font-mono font-semibold text-[#1A1A1A]">
                    {batch.greenLotNumber || greenLot?.lotNumber || "LOT-GV-ORIGEN"}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                <div>
                  <span className="text-[#1A1A1A]/60 block text-[8px] uppercase font-bold">Fecha de Tueste</span>
                  <span className="font-mono font-bold text-[#1A1A1A]">{roastDate}</span>
                </div>
                <div>
                  <span className="text-[#1A1A1A]/60 block text-[8px] uppercase font-bold">Consumo Preferente</span>
                  <span className="font-mono font-bold text-[#1A1A1A]">{bestBeforeDate}</span>
                </div>
                <div>
                  <span className="text-[#1A1A1A]/60 block text-[8px] uppercase font-bold">Tostadora / Curva</span>
                  <span className="font-medium text-[#1A1A1A]">{batch.roasterMachine}</span>
                </div>
                <div>
                  <span className="text-[#1A1A1A]/60 block text-[8px] uppercase font-bold">Tostador Resp.</span>
                  <span className="font-medium text-[#1A1A1A]">{batch.roasterOperator}</span>
                </div>
              </div>
            </div>

            {/* Degas & Storage Recommendation */}
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded p-2 text-[10px] mb-3 flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Ventana óptima de cata:</span> Desgasificar al menos 7 días desde fecha de tueste. Conservar cerrado con válvula en lugar fresco y seco.
              </div>
            </div>

            {/* QR Code & Barcode Section */}
            <div className="flex items-center justify-between border-t-2 border-[#1A1A1A] pt-3">
              <div className="flex items-center gap-2.5">
                {/* Visual Stylized QR Code */}
                <div className="h-16 w-16 bg-white border border-[#1A1A1A] p-1 flex flex-col justify-between items-center rounded shadow-2xs">
                  <div className="grid grid-cols-4 gap-0.5 w-full h-full">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i % 2 === 0 || i === 3 || i === 12 || i === 15)
                            ? "bg-[#1A1A1A]"
                            : "bg-transparent"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-[9px] text-[#1A1A1A]/70 leading-tight">
                  <span className="font-bold block text-[#1A1A1A]">Escanear para Trazabilidad</span>
                  <span>Origen, SCA Score, Curva de Tueste y Certificación</span>
                </div>
              </div>

              {/* Barcode visual */}
              <div className="text-right">
                <div className="flex items-end gap-0.5 h-7 justify-end mb-1">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2].map((h, i) => (
                    <div
                      key={i}
                      className="bg-[#1A1A1A] w-[2px]"
                      style={{ height: `${h * 6}px` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[9px] tracking-widest text-[#1A1A1A]/70">
                  {batch.batchNumber.replace(/-/g, "")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 bg-[#F9F7F2] border-t border-[#1A1A1A]/10 text-right print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#1A1A1A]/20 bg-white text-xs font-semibold text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
