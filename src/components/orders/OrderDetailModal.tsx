import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Order, OrderStatus } from "../../types";
import {
  X,
  Calendar,
  Truck,
  Receipt,
  MapPin,
  UserCheck,
  FileCheck,
  PackageCheck,
} from "lucide-react";

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

const statusFlow: OrderStatus[] = [
  "Borrador",
  "Recibido",
  "Confirmado",
  "En producción",
  "Preparado",
  "Despachado",
  "En tránsito",
  "Entregado",
  "Facturado",
  "Cobrado",
];

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const { updateOrderStatus, createInvoiceForOrder, dispatchOrderRemito, setActiveTab } = useApp();
  const [remitoNumber, setRemitoNumber] = useState(`REM-${order.orderNumber.replace("ORD-", "")}`);
  const [isRemitoPromptOpen, setIsRemitoPromptOpen] = useState(false);

  const currentIndex = statusFlow.indexOf(order.status);
  const nextStatus = currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;

  const handleAdvanceStatus = () => {
    if (!nextStatus) return;

    if (nextStatus === "Facturado") {
      const inv = createInvoiceForOrder(order.id);
      if (inv) {
        alert(`¡Factura ${inv.invoiceNumber} emitida automáticamente y vinculada al pedido!`);
      }
    } else if (nextStatus === "Despachado" || nextStatus === "En tránsito") {
      setIsRemitoPromptOpen(true);
    } else {
      updateOrderStatus(order.id, nextStatus);
    }
  };

  const handleConfirmDispatchRemito = () => {
    dispatchOrderRemito(order.id, remitoNumber);
    setIsRemitoPromptOpen(false);
    alert(`¡Remito de Despacho ${remitoNumber} emitido! Stock de café tostado descontado automáticamente.`);
  };

  const handleEmitInvoiceDirect = () => {
    const inv = createInvoiceForOrder(order.id);
    if (inv) {
      alert(`¡Factura ${inv.invoiceNumber} emitida exitosamente!`);
      onClose();
      setActiveTab("billing");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4 backdrop-blur-xs overflow-y-auto text-[#1A1A1A]">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-xl border border-[#1A1A1A]/10 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1A1A1A]/10 bg-[#F9F7F2] p-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1A1A1A] text-white font-serif font-black text-lg">
              📦
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">{order.orderNumber}</h2>
                <span
                  className={`rounded px-2 py-0.5 font-sans text-[9px] uppercase tracking-[0.15em] font-semibold ${
                    order.status === "Entregado"
                      ? "bg-emerald-900/10 text-emerald-800 border border-emerald-700/30"
                      : order.status === "Facturado" || order.status === "Cobrado"
                      ? "bg-[#1A1A1A]/10 text-[#1A1A1A] border border-[#1A1A1A]/20"
                      : order.status === "Cancelado"
                      ? "bg-[#1A1A1A]/5 text-[#1A1A1A]/50"
                      : "bg-[#C2823D]/10 text-[#C2823D] border border-[#C2823D]/30"
                  }`}
                >
                  {order.status}
                </span>

                {order.isDeliveredUninvoiced && (
                  <span className="rounded bg-[#8E2030]/10 px-2 py-0.5 font-sans text-[9px] uppercase tracking-[0.1em] font-bold text-[#8E2030] border border-[#8E2030]/30 animate-pulse">
                    ⚠ Entregado Sin Facturar
                  </span>
                )}
              </div>
              <p className="font-sans text-xs text-[#1A1A1A]/60 mt-0.5">
                Cliente: <strong className="text-[#1A1A1A]">{order.customerName}</strong> • CUIT {order.customerTaxId} • Zona: {order.customerZone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {order.status !== "Despachado" && order.status !== "En tránsito" && order.status !== "Entregado" && order.status !== "Facturado" && order.status !== "Cobrado" && order.status !== "Cancelado" && (
              <button
                onClick={() => setIsRemitoPromptOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[#8E2030]/30 bg-[#8E2030]/10 px-3.5 py-1.5 text-xs font-bold text-[#8E2030] shadow-2xs hover:bg-[#8E2030] hover:text-white transition-all"
              >
                <Truck className="h-3.5 w-3.5" />
                <span className="font-sans text-[11px] uppercase tracking-[0.1em]">Despachar con Remito</span>
              </button>
            )}

            {order.isDeliveredUninvoiced && (
              <button
                onClick={handleEmitInvoiceDirect}
                className="flex items-center gap-1.5 rounded-lg bg-[#8E2030] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#6E131F] transition-colors"
              >
                <Receipt className="h-3.5 w-3.5" />
                <span className="font-sans text-[11px] uppercase tracking-[0.1em]">Emitir Factura</span>
              </button>
            )}

            {nextStatus && order.status !== "Facturado" && order.status !== "Cobrado" && order.status !== "Cancelado" && (
              <button
                onClick={handleAdvanceStatus}
                className="flex items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#8E2030] transition-colors shadow-2xs"
              >
                <span className="font-sans text-[11px] uppercase tracking-[0.1em]">Avanzar a: {nextStatus}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-lg border border-[#1A1A1A]/10 bg-white p-2 text-[#1A1A1A]/50 hover:bg-[#F2EFE9] hover:text-[#1A1A1A] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Remito Dispatch Prompt Modal Overlay */}
        {isRemitoPromptOpen && (
          <div className="p-4 bg-amber-50 border-b border-amber-200 text-xs font-sans text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-[#8E2030] shrink-0" />
              <div>
                <span className="font-bold block text-sm">Confirmar Despacho y Descarga de Stock ({order.totalKg} Kg)</span>
                <span className="text-[11px] text-amber-800">Se emitirá el remito oficial y se descontará el stock de café tostado del kardex.</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={remitoNumber}
                onChange={(e) => setRemitoNumber(e.target.value)}
                placeholder="N° Remito"
                className="rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-[#1A1A1A] w-36"
              />
              <button
                onClick={handleConfirmDispatchRemito}
                className="px-3.5 py-1.5 rounded-lg bg-[#8E2030] text-white font-bold text-xs shadow-xs hover:bg-[#721926] transition-colors"
              >
                Emitir Remito &amp; Descontar Stock
              </button>
              <button
                onClick={() => setIsRemitoPromptOpen(false)}
                className="px-2 py-1.5 text-[#1A1A1A]/60 hover:text-[#1A1A1A] text-xs font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs font-sans">
          {/* Status Stepper Tracker */}
          <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-4">
            <h4 className="font-sans text-[9px] uppercase tracking-[0.25em] font-bold text-[#1A1A1A]/50 mb-3">
              Trazabilidad del Pedido
            </h4>
            <div className="flex items-center justify-between overflow-x-auto pb-2 custom-scrollbar gap-2">
              {statusFlow.map((st, idx) => {
                const isPassed = idx <= currentIndex;
                const isCurrent = idx === currentIndex;
                return (
                  <div key={st} className="flex items-center gap-2 shrink-0">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                        isCurrent
                          ? "bg-[#1A1A1A] text-white ring-4 ring-[#1A1A1A]/10"
                          : isPassed
                          ? "bg-[#8E2030] text-white"
                          : "bg-[#1A1A1A]/10 text-[#1A1A1A]/40"
                      }`}
                    >
                      {isPassed && !isCurrent ? "✓" : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] whitespace-nowrap ${
                        isCurrent
                          ? "text-[#1A1A1A] font-bold"
                          : isPassed
                          ? "text-[#1A1A1A]/80 font-medium"
                          : "text-[#1A1A1A]/40"
                      }`}
                    >
                      {st}
                    </span>
                    {idx < statusFlow.length - 1 && (
                      <div
                        className={`h-0.5 w-4 ${
                          idx < currentIndex ? "bg-[#8E2030]" : "bg-[#1A1A1A]/10"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Commercial Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-4 space-y-2">
              <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#8E2030]">
                Logística &amp; Entrega
              </h4>
              <div className="space-y-1.5 text-[#1A1A1A]/80">
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#1A1A1A]/40" />
                  <span>Dirección: <strong>{order.customerAddress}</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[#1A1A1A]/40" />
                  <span>Fecha Prometida: <strong>{order.promisedDate}</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 text-[#1A1A1A]/40" />
                  <span>Modalidad: <strong>{order.deliveryModality}</strong></span>
                </p>
                {order.driverName && (
                  <p className="flex items-center gap-2">
                    <UserCheck className="h-3.5 w-3.5 text-[#1A1A1A]/40" />
                    <span>Chofer / Furgón: <strong>{order.driverName}</strong></span>
                  </p>
                )}
                {order.deliveryDate && (
                  <p className="text-emerald-800 font-semibold">
                    ✓ Entregado el: {new Date(order.deliveryDate).toLocaleDateString()} por {order.deliveredBy}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-4 space-y-2">
              <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">
                Detalle Comercial &amp; Preventa
              </h4>
              <div className="space-y-1.5 text-[#1A1A1A]/80">
                <p>Ingresado por: <strong>{order.salesRepName}</strong></p>
                {order.preventistaName && <p>Preventista asignado: <strong>{order.preventistaName}</strong></p>}
                <p>Prioridad: <strong>{order.priority}</strong></p>
                {order.notes && <p className="text-[#1A1A1A]/60 italic">Notas: "{order.notes}"</p>}
                {order.invoiceId && (
                  <p className="text-[#8E2030] font-semibold flex items-center gap-1">
                    <Receipt className="h-3.5 w-3.5" />
                    Facturado con ID: {order.invoiceId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 space-y-3 shadow-2xs">
            <h4 className="font-serif text-sm font-bold text-[#1A1A1A]">
              Detalle de Productos ({order.totalKg} Kg de Café)
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#1A1A1A]/10 text-[#1A1A1A]/50 font-bold uppercase text-[9px] tracking-wider">
                  <tr>
                    <th className="py-2">Producto</th>
                    <th className="py-2">Molienda</th>
                    <th className="py-2 text-center">Cantidad</th>
                    <th className="py-2 text-right">Precio Unit.</th>
                    <th className="py-2 text-right">Kg</th>
                    <th className="py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]/5 text-[#1A1A1A]">
                  {order.items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-2.5 font-semibold text-[#1A1A1A]">{it.productName}</td>
                      <td className="py-2.5 text-[#1A1A1A]/60">{it.grind}</td>
                      <td className="py-2.5 text-center font-semibold">{it.quantity} un</td>
                      <td className="py-2.5 text-right">${it.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-right text-[#8E2030] font-bold">{it.totalKg} Kg</td>
                      <td className="py-2.5 text-right font-serif font-bold text-[#1A1A1A]">${it.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="pt-3 border-t border-[#1A1A1A]/10 flex justify-end">
              <div className="w-64 space-y-1 text-xs">
                <div className="flex justify-between text-[#1A1A1A]/60">
                  <span>Subtotal Neto:</span>
                  <span>${order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#1A1A1A]/60">
                  <span>IVA:</span>
                  <span>${order.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#1A1A1A] pt-1.5 border-t border-[#1A1A1A]/10 font-serif">
                  <span>Total Pedido:</span>
                  <span className="text-base text-[#1A1A1A] font-black">${order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
