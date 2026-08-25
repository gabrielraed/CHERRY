import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Order } from "../../types";
import { NewOrderModal } from "./NewOrderModal";
import { OrderDetailModal } from "./OrderDetailModal";
import {
  Search,
  Plus,
  AlertTriangle,
  Eye,
} from "lucide-react";

export const OrdersView: React.FC = () => {
  const { orders, createInvoiceForOrder, updateOrderStatus, setActiveTab } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchText =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerZone.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "all") return matchText;
    if (statusFilter === "pending")
      return (
        matchText &&
        o.status !== "Entregado" &&
        o.status !== "Facturado" &&
        o.status !== "Cobrado" &&
        o.status !== "Cancelado"
      );
    if (statusFilter === "overdue")
      return (
        matchText &&
        o.status !== "Entregado" &&
        o.status !== "Facturado" &&
        o.status !== "Cobrado" &&
        new Date(o.promisedDate) < new Date()
      );
    if (statusFilter === "unbilled") return matchText && o.isDeliveredUninvoiced;
    return matchText && o.status === statusFilter;
  });

  const handleEmitInvoice = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    const inv = createInvoiceForOrder(orderId);
    if (inv) {
      alert(`¡Factura ${inv.invoiceNumber} emitida exitosamente!`);
      setActiveTab("billing");
    }
  };

  const handleQuickAdvance = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    if (order.status === "Recibido") updateOrderStatus(order.id, "Confirmado");
    else if (order.status === "Confirmado") updateOrderStatus(order.id, "En producción");
    else if (order.status === "En producción") updateOrderStatus(order.id, "Preparado");
    else if (order.status === "Preparado") updateOrderStatus(order.id, "Despachado");
    else if (order.status === "Despachado") updateOrderStatus(order.id, "En tránsito");
    else if (order.status === "En tránsito") updateOrderStatus(order.id, "Entregado");
  };

  return (
    <div className="space-y-6 pb-16 text-[#1A1A1A]">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-[#1A1A1A]/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8E2030]">
              Gestión Comercial
            </span>
            <span className="h-1 w-1 rounded-full bg-[#1A1A1A]/30"></span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]/50">
              {filteredOrders.length} registros
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Pedidos <span className="italic font-normal">&amp; Backlog</span>
          </h1>
          <p className="font-sans text-xs text-[#1A1A1A]/60 mt-1">
            Flujo punta a punta: desde preventa y tostado hasta entrega y facturación automática
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#1A1A1A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#8E2030] active:scale-98 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="font-sans text-[11px] uppercase tracking-[0.15em]">Nuevo Pedido</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#1A1A1A]/10 bg-white p-3.5 shadow-2xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#1A1A1A]/40" />
          <input
            type="text"
            placeholder="Buscar por Nº de pedido, cliente, zona..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[#1A1A1A]/12 bg-[#F9F7F2] pl-9 pr-3 py-2 text-xs text-[#1A1A1A] focus:border-[#1A1A1A] outline-none font-sans"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[#1A1A1A]/12 bg-[#F9F7F2] px-3 py-2 text-xs text-[#1A1A1A] outline-none font-sans cursor-pointer"
        >
          <option value="all">Todos los Pedidos</option>
          <option value="pending">Pendientes de Entrega</option>
          <option value="overdue">⚠ Atrasados</option>
          <option value="unbilled">⚠ Entregados Sin Facturar</option>
          <option value="Recibido">Recibidos</option>
          <option value="En producción">En Producción</option>
          <option value="Preparado">Preparados</option>
          <option value="En tránsito">En Tránsito</option>
          <option value="Entregado">Entregados</option>
          <option value="Facturado">Facturados</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-xl border border-[#1A1A1A]/10 bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-[#1A1A1A]">
          <thead className="border-b border-[#1A1A1A]/10 bg-[#F9F7F2] font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/60">
            <tr>
              <th className="py-3.5 px-4">Pedido / Fecha</th>
              <th className="py-3.5 px-3">Cliente &amp; Zona</th>
              <th className="py-3.5 px-3">Café (Kg) / Ítems</th>
              <th className="py-3.5 px-3">Fecha Prometida</th>
              <th className="py-3.5 px-3">Total ($)</th>
              <th className="py-3.5 px-3">Estado</th>
              <th className="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1A1A]/5 font-sans">
            {filteredOrders.map((o) => {
              const isOverdue =
                o.status !== "Entregado" &&
                o.status !== "Facturado" &&
                o.status !== "Cobrado" &&
                new Date(o.promisedDate) < new Date();

              return (
                <tr
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className="cursor-pointer hover:bg-[#F9F7F2] transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A1A1A]/5 text-[#1A1A1A] font-bold border border-[#1A1A1A]/10">
                        📦
                      </div>
                      <div>
                        <div className="font-semibold text-[#1A1A1A] group-hover:text-[#8E2030] transition-colors">
                          {o.orderNumber}
                        </div>
                        <div className="text-[10px] text-[#1A1A1A]/50">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-[#1A1A1A]">{o.customerName}</div>
                    <div className="text-[10px] text-[#1A1A1A]/50">{o.customerZone}</div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-bold text-[#8E2030]">{o.totalKg} Kg</div>
                    <div className="text-[10px] text-[#1A1A1A]/60 truncate max-w-[160px]">
                      {(o.items || []).map((i) => i.productName).join(", ")}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div
                      className={`font-medium flex items-center gap-1 ${
                        isOverdue ? "text-[#8E2030] font-semibold" : "text-[#1A1A1A]"
                      }`}
                    >
                      {isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-[#8E2030]" />}
                      <span>{o.promisedDate}</span>
                    </div>
                    <div className="text-[10px] text-[#1A1A1A]/50">{o.deliveryModality}</div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-serif font-bold text-sm text-[#1A1A1A]">${o.totalAmount.toLocaleString()}</div>
                    <div className="text-[10px] text-[#1A1A1A]/40 font-sans">IVA incl.</div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 font-sans text-[9px] uppercase tracking-[0.15em] font-semibold ${
                        o.status === "Entregado"
                          ? "bg-emerald-900/10 text-emerald-800 border border-emerald-700/30"
                          : o.status === "Facturado"
                          ? "bg-[#1A1A1A]/10 text-[#1A1A1A] border border-[#1A1A1A]/20"
                          : isOverdue
                          ? "bg-[#8E2030]/10 text-[#8E2030] border border-[#8E2030]/30 animate-pulse"
                          : "bg-[#C2823D]/10 text-[#C2823D] border border-[#C2823D]/30"
                      }`}
                    >
                      {o.status}
                    </span>

                    {o.isDeliveredUninvoiced && (
                      <div className="text-[9px] uppercase tracking-[0.1em] font-bold text-[#8E2030] mt-0.5">
                        ⚠ Sin facturar
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {o.isDeliveredUninvoiced && (
                        <button
                          onClick={(e) => handleEmitInvoice(e, o.id)}
                          className="rounded-md bg-[#8E2030] px-2.5 py-1 text-[10px] font-sans uppercase tracking-[0.1em] font-bold text-white hover:bg-[#6E131F] shadow-2xs"
                          title="Emitir Factura"
                        >
                          Facturar
                        </button>
                      )}

                      {o.status !== "Entregado" && o.status !== "Facturado" && o.status !== "Cobrado" && (
                        <button
                          onClick={(e) => handleQuickAdvance(e, o)}
                          className="rounded-md bg-[#F2EFE9] px-2.5 py-1 text-[10px] font-sans uppercase tracking-[0.1em] font-semibold text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A]/10 transition-colors"
                          title="Avanzar etapa"
                        >
                          Avanzar →
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="rounded-md bg-[#F2EFE9] p-1.5 text-[#1A1A1A]/70 hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A]/10 transition-colors"
                        title="Ver detalle de pedido"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New Order Modal */}
      {isNewModalOpen && <NewOrderModal onClose={() => setIsNewModalOpen(false)} />}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
