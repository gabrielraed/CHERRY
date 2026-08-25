import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Customer } from "../../types";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
} from "lucide-react";

export const CollectionsView: React.FC = () => {
  const {
    customers,
    collectionLogs,
    recordCollectionFollowUp,
  } = useApp();

  const [selectedDebtor, setSelectedDebtor] = useState<Customer | null>(null);
  const [channel, setChannel] = useState<any>("WhatsApp");
  const [result, setResult] = useState<any>("Promesa de Pago");
  const [promisedDate, setPromisedDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const debtors = customers
    .filter((c) => c.overdueDebt > 0)
    .sort((a, b) => b.overdueDebt - a.overdueDebt);

  const handleLogFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtor) return;

    recordCollectionFollowUp({
      customerId: selectedDebtor.id,
      customerName: selectedDebtor.commercialName,
      channel,
      result,
      overdueAmount: selectedDebtor.overdueDebt,
      promisedPaymentDate: result === "Promesa de Pago" ? promisedDate : undefined,
      notes,
    });

    setSelectedDebtor(null);
    setNotes("");
  };

  const getWhatsAppMessage = (customer: Customer) => {
    return `Hola ${customer.commercialName}, te escribimos de CHERRY TOST. Queríamos consultar sobre el saldo vencido por $${customer.overdueDebt.toLocaleString()}. ¿Podrían confirmarnos fecha de pago para coordinar la imputación? Muchas gracias.`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 3000);
  };

  return (
    <div className="space-y-6 pb-16 text-[#1A1A1A]">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-[#1A1A1A]/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8E2030]">
              Crédito &amp; Cobranzas
            </span>
            <span className="h-1 w-1 rounded-full bg-[#1A1A1A]/30"></span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]/50">
              {debtors.length} cuentas en mora
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Gestión <span className="italic font-normal">de Cobranzas</span>
          </h1>
          <p className="font-sans text-xs text-[#1A1A1A]/60 mt-1">
            Panel de seguimiento preventivo y correctivo, registro de promesas de pago y plantillas de contacto
          </p>
        </div>
      </div>

      {/* Debtors List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 font-sans text-xs">
        {debtors.map((cust) => {
          const waMessage = getWhatsAppMessage(cust);

          return (
            <div
              key={cust.id}
              className="rounded-xl border border-[#8E2030]/20 bg-white p-4 space-y-3 shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-[#1A1A1A] text-sm">{cust.commercialName}</h3>
                    <p className="text-[11px] text-[#1A1A1A]/50">{cust.phone} • {cust.zone}</p>
                  </div>
                  <span className="rounded px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-[#8E2030]/10 text-[#8E2030] border border-[#8E2030]/30">
                    Vencido
                  </span>
                </div>

                <div className="rounded-lg bg-[#F9F7F2] p-3 border border-[#1A1A1A]/10 space-y-1">
                  <div className="flex justify-between text-[#1A1A1A]/60">
                    <span className="text-[10px] uppercase tracking-wider">Deuda Vencida:</span>
                    <span className="font-serif font-bold text-[#8E2030] text-sm">
                      ${cust.overdueDebt.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#1A1A1A]/50 text-[10px]">
                    <span>Saldo Total CC:</span>
                    <span>${cust.currentAccountBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#1A1A1A]/50 text-[10px]">
                    <span>Plazo Otorgado:</span>
                    <span>{cust.paymentTermDays} días</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#1A1A1A]/10">
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(waMessage, cust.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-700/30 bg-emerald-900/10 p-2 font-semibold text-emerald-800 hover:bg-emerald-900/20 transition-colors text-xs"
                  >
                    {copiedIndex === cust.id ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                        <span>¡Mensaje Copiado!</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Copiar WhatsApp</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedDebtor(cust)}
                    className="rounded-lg bg-[#1A1A1A] p-2 text-white hover:bg-[#8E2030] font-semibold text-xs transition-colors"
                    title="Registrar Gestión"
                  >
                    + Registro
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Follow-up Logs Table */}
      <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xs">
        <div className="border-b border-[#1A1A1A]/10 pb-3">
          <h3 className="font-serif text-base font-bold text-[#1A1A1A] flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#8E2030]" />
            Historial de Gestiones de Cobranza ({collectionLogs.length})
          </h3>
        </div>

        {collectionLogs.length === 0 ? (
          <p className="text-[#1A1A1A]/50 py-4 text-center font-sans text-xs italic">Aún no se han registrado llamadas o acuerdos en esta sesión.</p>
        ) : (
          <div className="space-y-2 font-sans text-xs">
            {collectionLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-lg border border-[#1A1A1A]/10 bg-[#F9F7F2] p-3"
              >
                <div>
                  <div className="font-semibold text-[#1A1A1A]">
                    {log.customerName} • <span className="text-[#8E2030]">{log.result}</span>
                  </div>
                  <p className="text-[11px] text-[#1A1A1A]/60 mt-0.5">{log.notes}</p>
                </div>
                <div className="text-right text-[11px] text-[#1A1A1A]/50">
                  <p>{log.date} ({log.channel})</p>
                  {log.promisedPaymentDate && (
                    <p className="text-emerald-800 font-semibold">Promesa: {log.promisedPaymentDate}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Follow Up Modal */}
      {selectedDebtor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4 backdrop-blur-xs text-[#1A1A1A]">
          <div className="w-full max-w-md rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-[#1A1A1A]">Registrar Gestión de Cobranza</h3>
                <p className="font-serif text-[#8E2030] text-xs font-semibold">{selectedDebtor.commercialName}</p>
              </div>
              <button onClick={() => setSelectedDebtor(null)} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A]">✕</button>
            </div>

            <form onSubmit={handleLogFollowUp} className="space-y-3 font-sans text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Canal de Contacto</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] p-2 text-[#1A1A1A] outline-none"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Llamada Telefónica">Llamada Telefónica</option>
                    <option value="Email">Email</option>
                    <option value="Visita Personal">Visita Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Resultado de la Gestión</label>
                  <select
                    value={result}
                    onChange={(e) => setResult(e.target.value as any)}
                    className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] p-2 text-[#1A1A1A] outline-none"
                  >
                    <option value="Promesa de Pago">Promesa de Pago</option>
                    <option value="Sin Respuesta">Sin Respuesta</option>
                    <option value="Reclamo de Facturación">Reclamo de Facturación</option>
                    <option value="Plan de Pagos Acordado">Plan de Pagos Acordado</option>
                  </select>
                </div>
              </div>

              {result === "Promesa de Pago" && (
                <div>
                  <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Fecha Prometida de Pago</label>
                  <input
                    type="date"
                    required
                    value={promisedDate}
                    onChange={(e) => setPromisedDate(e.target.value)}
                    className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] p-2 text-[#1A1A1A] outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Notas / Detalle del Compromiso</label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalles de la llamada o acuerdo..."
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] p-2 text-[#1A1A1A] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1A1A1A]/10">
                <button
                  type="button"
                  onClick={() => setSelectedDebtor(null)}
                  className="rounded-lg border border-[#1A1A1A]/15 bg-white px-3.5 py-1.5 text-xs text-[#1A1A1A]/70 hover:bg-[#F2EFE9]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#8E2030] px-4 py-1.5 font-semibold text-white hover:brightness-110"
                >
                  Guardar Gestión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
