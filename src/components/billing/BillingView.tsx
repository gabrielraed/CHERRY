import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Invoice } from "../../types";
import {
  Receipt,
  AlertTriangle,
  Plus,
  Search,
  Download,
} from "lucide-react";

export const BillingView: React.FC = () => {
  const {
    invoices,
    orders,
    createInvoiceForOrder,
    createManualInvoice,
    customers,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual invoice state
  const [manualCustomerId, setManualCustomerId] = useState(customers[0]?.id || "");
  const [manualAmount, setManualAmount] = useState(500);
  const [manualDesc, setManualDesc] = useState("Venta directa de café tostado");

  const unbilledOrders = orders.filter((o) => o.isDeliveredUninvoiced);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInvoiceAllDelivered = () => {
    let count = 0;
    unbilledOrders.forEach((o) => {
      createInvoiceForOrder(o.id);
      count++;
    });
    alert(`¡Se emitieron con éxito ${count} facturas para los pedidos entregados!`);
  };

  const handleManualInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === manualCustomerId);
    if (!cust) return;

    createManualInvoice({
      customerId: cust.id,
      customerName: cust.commercialName,
      customerTaxId: cust.taxId,
      subtotal: manualAmount,
      vatAmount: manualAmount * 0.21,
      totalAmount: manualAmount * 1.21,
      items: [
        {
          description: manualDesc,
          quantity: 1,
          unitPrice: manualAmount,
          total: manualAmount,
        },
      ],
    });

    setIsManualModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-16 text-[#1A1A1A]">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-[#1A1A1A]/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8E2030]">
              Administración Fiscal &amp; Facturación
            </span>
            <span className="h-1 w-1 rounded-full bg-[#1A1A1A]/30"></span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]/50">
              {invoices.length} facturas
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Facturación <span className="italic font-normal">&amp; Comprobantes</span>
          </h1>
          <p className="font-sans text-xs text-[#1A1A1A]/60 mt-1">
            Control de comprobantes fiscales, vinculación automática con entregas e impacto directo en Cuenta Corriente
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#1A1A1A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#8E2030] active:scale-98 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="font-sans text-[11px] uppercase tracking-[0.15em]">Factura Manual</span>
          </button>
        </div>
      </div>

      {/* Critical Section: Delivered Uninvoiced Orders Banner */}
      {unbilledOrders.length > 0 && (
        <div className="rounded-xl border border-[#8E2030]/20 bg-[#8E2030]/5 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-[#8E2030]" />
              <div>
                <h3 className="font-serif font-bold text-[#8E2030] text-base">
                  Pedidos Entregados Pendientes de Facturación ({unbilledOrders.length})
                </h3>
                <p className="font-sans text-xs text-[#1A1A1A]/60">
                  La mercadería ya fue recibida por el cliente pero aún no fue emitida su factura fiscal ni cargada a su cuenta corriente.
                </p>
              </div>
            </div>

            <button
              onClick={handleInvoiceAllDelivered}
              className="rounded-lg bg-[#8E2030] px-4 py-2 font-sans text-xs uppercase tracking-wider font-semibold text-white hover:brightness-110 shadow-xs transition-all"
            >
              Facturar Todos ({unbilledOrders.length})
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
            {unbilledOrders.map((ord) => (
              <div
                key={ord.id}
                className="flex items-center justify-between rounded-lg border border-[#8E2030]/15 bg-white p-3 shadow-2xs"
              >
                <div>
                  <div className="font-serif font-bold text-[#1A1A1A] text-xs">{ord.orderNumber} • {ord.customerName}</div>
                  <div className="font-sans text-[10px] text-[#1A1A1A]/50">
                    {ord.totalKg} Kg de Café • ${ord.totalAmount.toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => createInvoiceForOrder(ord.id)}
                  className="rounded-md bg-[#1A1A1A] px-2.5 py-1 font-sans text-[10px] uppercase tracking-wider font-semibold text-white hover:bg-[#8E2030] transition-colors"
                >
                  Emitir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoices Directory */}
      <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A1A1A]/10 pb-3">
          <h3 className="font-serif text-base font-bold text-[#1A1A1A] flex items-center gap-2">
            <Receipt className="h-4 w-4 text-[#8E2030]" />
            Comprobantes Emitidos
          </h3>

          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#1A1A1A]/40" />
            <input
              type="text"
              placeholder="Buscar por Nº factura o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-[#1A1A1A]/12 bg-[#F9F7F2] pl-8 pr-3 py-1.5 text-xs text-[#1A1A1A] outline-none font-sans"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans text-[#1A1A1A]">
            <thead className="border-b border-[#1A1A1A]/10 text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/50">
              <tr>
                <th className="py-2.5 px-3">Nº Factura / Fecha</th>
                <th className="py-2.5 px-3">Cliente &amp; CUIT</th>
                <th className="py-2.5 px-3">Vencimiento</th>
                <th className="py-2.5 px-3">Total ($)</th>
                <th className="py-2.5 px-3">Saldo Adeudado</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/5">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F9F7F2] transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-[#1A1A1A]">{inv.invoiceNumber}</div>
                    <div className="text-[10px] text-[#1A1A1A]/50">{inv.date} ({inv.type})</div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-serif font-bold text-[#1A1A1A]">{inv.customerName}</div>
                    <div className="text-[10px] text-[#1A1A1A]/50 font-mono">{inv.customerTaxId}</div>
                  </td>

                  <td className="py-3 px-3 text-[#1A1A1A]/70">
                    {inv.dueDate}
                  </td>

                  <td className="py-3 px-3 font-serif font-bold text-[#1A1A1A]">
                    ${inv.totalAmount.toLocaleString()}
                  </td>

                  <td className="py-3 px-3">
                    {inv.balanceDue > 0 ? (
                      <span className="font-serif font-bold text-[#8E2030]">${inv.balanceDue.toLocaleString()}</span>
                    ) : (
                      <span className="font-medium text-emerald-800">$0.00 (Saldada)</span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        inv.status === "Cobrada Total"
                          ? "bg-emerald-900/10 text-emerald-800 border border-emerald-700/30"
                          : inv.status === "Cobrada Parcial"
                          ? "bg-[#C2823D]/10 text-[#C2823D] border border-[#C2823D]/30"
                          : "bg-[#1A1A1A]/5 text-[#1A1A1A]/70"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => alert(`Factura ${inv.invoiceNumber} lista para impresión fiscal / PDF.`)}
                      className="rounded-lg border border-[#1A1A1A]/10 bg-white p-1.5 text-[#1A1A1A]/60 hover:bg-[#F2EFE9] hover:text-[#1A1A1A] transition-colors"
                      title="Descargar PDF"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Invoice Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4 backdrop-blur-xs text-[#1A1A1A]">
          <div className="w-full max-w-md rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <h3 className="font-serif text-base font-bold text-[#1A1A1A]">Emitir Factura Manual</h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A]">✕</button>
            </div>

            <form onSubmit={handleManualInvoiceSubmit} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Cliente</label>
                <select
                  value={manualCustomerId}
                  onChange={(e) => setManualCustomerId(e.target.value)}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.commercialName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Descripción de Concepto</label>
                <input
                  type="text"
                  required
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Monto Neto ($)</label>
                <input
                  type="number"
                  required
                  value={manualAmount}
                  onChange={(e) => setManualAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1A1A1A]/10">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="rounded-lg border border-[#1A1A1A]/15 bg-white px-3.5 py-1.5 text-xs text-[#1A1A1A]/70 hover:bg-[#F2EFE9]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1A1A1A] px-4 py-1.5 font-semibold text-white hover:bg-[#8E2030]"
                >
                  Emitir e Impactar en CC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
