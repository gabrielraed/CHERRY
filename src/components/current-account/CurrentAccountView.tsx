import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  PiggyBank,
  DollarSign,
  CreditCard,
  ArrowDownRight,
  Receipt,
} from "lucide-react";

export const CurrentAccountView: React.FC = () => {
  const {
    accountMovements,
    customers,
    registerPayment,
  } = useApp();

  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState("all");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCustomerId, setPaymentCustomerId] = useState(customers[0]?.id || "");
  const [paymentAmount, setPaymentAmount] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState("Transferencia");
  const [paymentRef, setPaymentRef] = useState("TRANSF-98214");

  const filteredMovements = accountMovements.filter(
    (m) => selectedCustomerFilter === "all" || m.customerId === selectedCustomerFilter
  );

  const totalReceivables = customers.reduce((sum, c) => sum + c.currentAccountBalance, 0);
  const totalOverdue = customers.reduce((sum, c) => sum + c.overdueDebt, 0);

  const handleRegisterPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerPayment({
      customerId: paymentCustomerId,
      amount: Number(paymentAmount),
      method: paymentMethod,
      reference: paymentRef,
    });
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-16 text-[#1A1A1A]">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-[#1A1A1A]/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8E2030]">
              Tesorería &amp; Créditos
            </span>
            <span className="h-1 w-1 rounded-full bg-[#1A1A1A]/30"></span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]/50">
              Libro Mayor de Clientes
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Cuentas <span className="italic font-normal">Corrientes</span>
          </h1>
          <p className="font-sans text-xs text-[#1A1A1A]/60 mt-1">
            Trazabilidad de débitos por facturas, créditos por cobranzas, imputaciones y saldos en tiempo real
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#1A1A1A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#8E2030] active:scale-98 transition-all"
          >
            <CreditCard className="h-4 w-4" />
            <span className="font-sans text-[11px] uppercase tracking-[0.15em]">Registrar Cobro</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#1A1A1A]/60">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Cuentas por Cobrar</span>
            <PiggyBank className="h-4 w-4 text-[#8E2030]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#1A1A1A] mt-2">
            ${totalReceivables.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#1A1A1A]/50 mt-1">Crédito total concedido en plaza</p>
        </div>

        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#1A1A1A]/60">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Deuda Vencida Exigible</span>
            <DollarSign className="h-4 w-4 text-[#8E2030]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#8E2030] mt-2">
            ${totalOverdue.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#1A1A1A]/50 mt-1">Facturas con plazo expirado</p>
        </div>

        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#1A1A1A]/60">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Cobranzas Registradas Este Mes</span>
            <ArrowDownRight className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="font-serif text-2xl font-bold text-emerald-800 mt-2">
            $9,820.00
          </div>
          <p className="text-[11px] text-[#1A1A1A]/50 mt-1">Ingresos efectivos liquidados</p>
        </div>
      </div>

      {/* Account Movements Ledger */}
      <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A1A1A]/10 pb-3">
          <h3 className="font-serif text-base font-bold text-[#1A1A1A] flex items-center gap-2">
            <Receipt className="h-4 w-4 text-[#8E2030]" />
            Movimientos Contables de Cuenta Corriente
          </h3>

          <select
            value={selectedCustomerFilter}
            onChange={(e) => setSelectedCustomerFilter(e.target.value)}
            className="rounded-lg border border-[#1A1A1A]/12 bg-[#F9F7F2] px-3 py-1.5 text-[#1A1A1A] text-xs outline-none font-sans cursor-pointer"
          >
            <option value="all">Todos los Clientes</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.commercialName} (Saldo: ${c.currentAccountBalance.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans text-[#1A1A1A]">
            <thead className="border-b border-[#1A1A1A]/10 text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/50">
              <tr>
                <th className="py-2.5 px-3">Fecha / Tipo</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Comprobante / Ref</th>
                <th className="py-2.5 px-3 text-right">Débito (Factura)</th>
                <th className="py-2.5 px-3 text-right">Crédito (Cobro)</th>
                <th className="py-2.5 px-3 text-right">Saldo Resultante</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/5">
              {filteredMovements.map((mov) => (
                <tr key={mov.id} className="hover:bg-[#F9F7F2] transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#1A1A1A]">{mov.type}</div>
                    <div className="text-[10px] text-[#1A1A1A]/50">{mov.date}</div>
                  </td>

                  <td className="py-3 px-3 font-serif font-bold text-[#1A1A1A]">
                    {mov.customerName}
                  </td>

                  <td className="py-3 px-3 font-mono text-[#1A1A1A]/70 text-xs">
                    {mov.referenceNumber}
                  </td>

                  <td className="py-3 px-3 text-right font-serif font-bold text-[#8E2030]">
                    {mov.debit > 0 ? `+$${mov.debit.toLocaleString()}` : "-"}
                  </td>

                  <td className="py-3 px-3 text-right font-serif font-bold text-emerald-800">
                    {mov.credit > 0 ? `-$${mov.credit.toLocaleString()}` : "-"}
                  </td>

                  <td className="py-3 px-3 text-right font-serif font-bold text-[#1A1A1A]">
                    ${mov.balance.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        mov.status === "Vencido"
                          ? "bg-[#8E2030]/10 text-[#8E2030] border border-[#8E2030]/30"
                          : mov.status === "Cancelado"
                          ? "bg-emerald-900/10 text-emerald-800 border border-emerald-700/30"
                          : "bg-[#1A1A1A]/5 text-[#1A1A1A]/70"
                      }`}
                    >
                      {mov.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Registration Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4 backdrop-blur-xs text-[#1A1A1A]">
          <div className="w-full max-w-md rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <h3 className="font-serif text-base font-bold text-[#1A1A1A]">Registrar Cobranza / Pago</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A]">✕</button>
            </div>

            <form onSubmit={handleRegisterPaymentSubmit} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Cliente</label>
                <select
                  value={paymentCustomerId}
                  onChange={(e) => setPaymentCustomerId(e.target.value)}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.commercialName} (Deuda: ${c.currentAccountBalance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Monto Percibido ($)</label>
                  <input
                    type="number"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Medio de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
                  >
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Tarjeta">Tarjeta de Débito/Crédito</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Nº Comprobante / Recibo / Transf.</label>
                <input
                  type="text"
                  required
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1A1A1A]/10">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="rounded-lg border border-[#1A1A1A]/15 bg-white px-3.5 py-1.5 text-xs text-[#1A1A1A]/70 hover:bg-[#F2EFE9]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1A1A1A] px-4 py-1.5 font-semibold text-white hover:bg-[#8E2030]"
                >
                  Registrar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
