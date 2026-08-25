import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Order } from "../../types";
import {
  Truck,
  MapPin,
  CheckCircle2,
} from "lucide-react";

export const LogisticsView: React.FC = () => {
  const { orders, deliveryRoutes, updateOrderStatus, createInvoiceForOrder, setActiveTab } = useApp();

  const [podOrder, setPodOrder] = useState<Order | null>(null);
  const [receiverName, setReceiverName] = useState("");
  const [receiverDni, setReceiverDni] = useState("");
  const [podNotes, setPodNotes] = useState("");

  const logisticsOrders = orders.filter(
    (o) =>
      o.deliveryModality === "Reparto Propio" ||
      o.status === "Preparado" ||
      o.status === "Despachado" ||
      o.status === "En tránsito" ||
      o.status === "Entregado"
  );

  const handleOpenPOD = (order: Order) => {
    setPodOrder(order);
    setReceiverName(order.customerName);
    setReceiverDni("");
    setPodNotes("");
  };

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!podOrder) return;

    updateOrderStatus(podOrder.id, "Entregado", {
      deliveredBy: "Carlos Mendoza (Chofer Furgón #1)",
      deliveryNotes: `Recibido por: ${receiverName} (${receiverDni}). ${podNotes}`,
    });

    setPodOrder(null);
  };

  return (
    <div className="space-y-6 pb-16 text-[#1A1A1A]">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-[#1A1A1A]/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8E2030]">
              Flota &amp; Cadena de Suministro
            </span>
            <span className="h-1 w-1 rounded-full bg-[#1A1A1A]/30"></span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]/50">
              {deliveryRoutes.length} rutas activas
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Logística <span className="italic font-normal">&amp; Entregas</span>
          </h1>
          <p className="font-sans text-xs text-[#1A1A1A]/60 mt-1">
            Control de furgones, hoja de ruta diaria, confirmación de entrega en calle y prueba de recepción (POD)
          </p>
        </div>
      </div>

      {/* Active Fleet Routes Summary */}
      <div className="grid gap-4 sm:grid-cols-2 font-sans text-xs">
        {deliveryRoutes.map((r) => {
          const stopsCount = r.stops?.length ?? r.totalOrdersCount ?? 0;
          const stopDestinations = (r.stops || []).map((s) => s.customerName);
          return (
            <div
              key={r.id}
              className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1A1A]/5 text-[#1A1A1A] font-bold border border-[#1A1A1A]/10">
                    🚐
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-[#1A1A1A] text-sm">{r.code}</h3>
                    <p className="text-[11px] text-[#1A1A1A]/50">
                      Chofer: <strong className="text-[#1A1A1A] font-semibold">{r.driverName}</strong> • {r.vehicle}
                    </p>
                  </div>
                </div>
                <span className="rounded px-2 py-0.5 font-sans text-[9px] uppercase tracking-wider font-semibold bg-[#1A1A1A]/5 text-[#1A1A1A] border border-[#1A1A1A]/10">
                  {r.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1A1A1A]/10 text-[11px]">
                <div>
                  <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider">Paradas:</span>
                  <p className="font-semibold text-[#1A1A1A]">{stopsCount} cafeterías</p>
                </div>
                <div>
                  <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider">Café en Ruta:</span>
                  <p className="font-serif font-bold text-[#8E2030]">{r.totalKg} Kg</p>
                </div>
                <div>
                  <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider">Destinos:</span>
                  <p className="font-medium text-[#1A1A1A] truncate" title={stopDestinations.join(", ")}>
                    {stopDestinations.length > 0 ? stopDestinations.join(", ") : "En preparación"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delivery Orders Backlog List */}
      <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
          <h3 className="font-serif text-base font-bold text-[#1A1A1A] flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#8E2030]" />
            Hoja de Ruta &amp; Entregas de Hoy
          </h3>
          <span className="font-sans text-[11px] text-[#1A1A1A]/50 font-medium">
            {logisticsOrders.filter((o) => o.status !== "Entregado" && o.status !== "Facturado").length} entregas pendientes
          </span>
        </div>

        <div className="space-y-3 font-sans">
          {logisticsOrders.map((order) => {
            const isDelivered = order.status === "Entregado" || order.status === "Facturado";
            const isInTransit = order.status === "En tránsito" || order.status === "Despachado";

            return (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[#1A1A1A]/10 bg-[#F9F7F2] p-4 hover:border-[#1A1A1A]/30 transition-all text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-[#1A1A1A] text-sm">{order.customerName}</span>
                    <span className="rounded bg-white px-2 py-0.5 text-[10px] text-[#8E2030] font-mono border border-[#1A1A1A]/10">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 font-sans text-[9px] uppercase tracking-wider font-semibold ${
                        isDelivered
                          ? "bg-emerald-900/10 text-emerald-800 border border-emerald-700/30"
                          : isInTransit
                          ? "bg-[#C2823D]/10 text-[#C2823D] border border-[#C2823D]/30 animate-pulse"
                          : "bg-[#1A1A1A]/5 text-[#1A1A1A]/70"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#1A1A1A]/60 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#1A1A1A]/40 shrink-0" />
                    <span>{order.customerAddress} ({order.customerZone})</span>
                  </p>
                  <p className="text-[11px] text-[#1A1A1A]/70">
                    Carga: <strong className="text-[#8E2030] font-serif font-bold">{order.totalKg} Kg de Café</strong> • ${order.totalAmount.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {order.status === "Preparado" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "En tránsito", { driverName: "Carlos Mendoza" })}
                      className="rounded-lg bg-[#1A1A1A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#8E2030] shadow-2xs transition-colors"
                    >
                      Iniciar Despacho
                    </button>
                  )}

                  {(order.status === "En tránsito" || order.status === "Despachado") && (
                    <button
                      onClick={() => handleOpenPOD(order)}
                      className="flex items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#8E2030] active:scale-98 transition-all"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Confirmar Entrega (POD)</span>
                    </button>
                  )}

                  {order.isDeliveredUninvoiced && (
                    <button
                      onClick={() => {
                        const inv = createInvoiceForOrder(order.id);
                        if (inv) {
                          alert(`¡Factura ${inv.invoiceNumber} emitida automáticamente!`);
                          setActiveTab("billing");
                        }
                      }}
                      className="rounded-lg bg-[#8E2030] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 shadow-2xs"
                    >
                      Emitir Factura
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Proof of Delivery (POD) Modal */}
      {podOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4 backdrop-blur-xs text-[#1A1A1A]">
          <div className="w-full max-w-md rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <h3 className="font-serif text-base font-bold text-[#1A1A1A]">Comprobante de Entrega en Calle (POD)</h3>
              <button onClick={() => setPodOrder(null)} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A]">
                ✕
              </button>
            </div>

            <div className="rounded-lg bg-[#F9F7F2] p-3 border border-[#1A1A1A]/10 font-sans text-xs space-y-1">
              <p><strong>Pedido:</strong> {podOrder.orderNumber}</p>
              <p><strong>Cliente:</strong> {podOrder.customerName}</p>
              <p><strong>Bultos / Café:</strong> {podOrder.totalKg} Kg de Café Tostado</p>
            </div>

            <form onSubmit={handleConfirmDelivery} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Nombre de Quien Recibe</label>
                <input
                  type="text"
                  required
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Ej: Camila Varela (Barista / Encargada)"
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">DNI / Firma Digital</label>
                <input
                  type="text"
                  value={receiverDni}
                  onChange={(e) => setReceiverDni(e.target.value)}
                  placeholder="DNI 35.881.200"
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Observaciones de la Entrega</label>
                <input
                  type="text"
                  value={podNotes}
                  onChange={(e) => setPodNotes(e.target.value)}
                  placeholder="Bultos entregados en perfecto estado con precinto."
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#1A1A1A]/10">
                <button
                  type="button"
                  onClick={() => setPodOrder(null)}
                  className="rounded-lg border border-[#1A1A1A]/15 bg-white px-3.5 py-1.5 text-xs text-[#1A1A1A]/70 hover:bg-[#F2EFE9]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1A1A1A] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#8E2030]"
                >
                  Registrar Entrega Conforme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
