import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Coffee,
  RotateCcw,
  Wrench,
  CheckCircle2,
  Cpu,
} from "lucide-react";

export const CustomerPortalView: React.FC = () => {
  const {
    customers,
    orders,
    machines,
    repeatLastCustomerOrder,
    createServiceTicket,
  } = useApp();

  // Active client demo (Café Roma Specialty)
  const client = customers[0];
  const clientOrders = orders.filter((o) => o.customerId === client.id);
  const clientMachines = machines.filter((m) => m.customerId === client.id);

  const [isSuccessMessage, setIsSuccessMessage] = useState<string | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketProblem, setTicketProblem] = useState("Poca presión de vapor");

  const handleRepeatOrder = () => {
    const newOrder = repeatLastCustomerOrder(client.id);
    if (newOrder) {
      setIsSuccessMessage(`¡Pedido ${newOrder.orderNumber} por $${newOrder.totalAmount} generado con éxito! El equipo de tostaduría ya lo está procesando.`);
      setTimeout(() => setIsSuccessMessage(null), 6000);
    }
  };

  const handleRequestService = (e: React.FormEvent) => {
    e.preventDefault();
    const machine = clientMachines[0];

    createServiceTicket({
      customerId: client.id,
      customerName: client.commercialName,
      machineId: machine?.id,
      machineCode: machine?.code,
      machineModel: machine ? `${machine.brand} ${machine.model}` : "Máquina Espresso",
      priority: "Alta",
      reportedProblem: ticketProblem,
      description: "Solicitud de asistencia técnica generada desde el Portal del Cliente.",
    });

    setIsTicketModalOpen(false);
    setIsSuccessMessage("¡Solicitud de service enviada! Un técnico de CHERRY TOST se pondrá en contacto a la brevedad.");
    setTimeout(() => setIsSuccessMessage(null), 6000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 text-[#1A1A1A]">
      {/* Client Header Banner */}
      <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#8E2030] text-white font-serif text-2xl shadow-xs">
              ☕
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">{client.commercialName}</h1>
                <span className="rounded px-2 py-0.5 font-sans text-[9px] uppercase tracking-wider font-semibold bg-emerald-900/10 text-emerald-800 border border-emerald-700/30">
                  Portal Cliente Activo
                </span>
              </div>
              <p className="font-sans text-xs text-[#1A1A1A]/60 mt-1">
                Bienvenido al portal de autogestión de café, pedidos y soporte para tu cafetería
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRepeatOrder}
              className="flex items-center gap-2 rounded-lg bg-[#8E2030] px-5 py-2.5 font-sans text-xs font-semibold text-white shadow-xs hover:brightness-110 active:scale-98 transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="uppercase tracking-wider">Repetir Pedido Habitual</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#1A1A1A]/10 font-sans text-xs">
          <div className="rounded-lg bg-[#F9F7F2] p-3 border border-[#1A1A1A]/10">
            <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider">Saldo en Cuenta</span>
            <p className="font-serif text-base font-bold text-[#1A1A1A] mt-0.5">
              ${client.currentAccountBalance.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-[#F9F7F2] p-3 border border-[#1A1A1A]/10">
            <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider">Consumo Promedio</span>
            <p className="font-serif text-base font-bold text-[#8E2030] mt-0.5">
              {client.avgMonthlyKg} Kg/mes
            </p>
          </div>
          <div className="rounded-lg bg-[#F9F7F2] p-3 border border-[#1A1A1A]/10">
            <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider">Máquinas Asignadas</span>
            <p className="font-serif text-base font-bold text-[#1A1A1A] mt-0.5">
              {clientMachines.length} en Comodato
            </p>
          </div>
          <div className="rounded-lg bg-[#F9F7F2] p-3 border border-[#1A1A1A]/10">
            <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider">Tostaduría de Referencia</span>
            <p className="font-serif text-base font-bold text-[#8E2030] mt-0.5">
              CHERRY TOST HQ
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {isSuccessMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-900/10 border border-emerald-700/30 p-4 text-emerald-800 font-medium font-sans text-xs shadow-2xs">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" />
          <span>{isSuccessMessage}</span>
        </div>
      )}

      {/* Main Grid: Machine Status & Last Orders */}
      <div className="grid gap-5 md:grid-cols-2 font-sans text-xs">
        {/* Machine Status Card */}
        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
            <h3 className="font-serif text-base font-bold text-[#1A1A1A] flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#8E2030]" />
              Tu Máquina de Café en Comodato
            </h3>
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="text-xs font-semibold text-[#8E2030] hover:underline flex items-center gap-1"
            >
              <Wrench className="h-3.5 w-3.5" />
              <span>Pedir Service</span>
            </button>
          </div>

          {clientMachines.map((m) => (
            <div key={m.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-[#1A1A1A] text-sm">{m.brand} {m.model}</h4>
                  <p className="text-[11px] text-[#1A1A1A]/50">Código de inventario: {m.code} • S/N: {m.serialNumber}</p>
                </div>
                <span className="rounded px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-emerald-900/10 text-emerald-800 border border-emerald-700/30">
                  {m.status}
                </span>
              </div>

              <div className="rounded-lg bg-[#F9F7F2] p-3 border border-[#1A1A1A]/10 space-y-1 text-xs">
                <div className="flex justify-between text-[#1A1A1A]/60">
                  <span>Próximo mantenimiento preventivo:</span>
                  <span className="font-semibold text-[#8E2030]">{m.nextServiceDate || "Octubre 2026"}</span>
                </div>
                <div className="flex justify-between text-[#1A1A1A]/60">
                  <span>Café extraído acumulado:</span>
                  <span className="font-serif font-bold text-[#1A1A1A]">{m.totalKgSinceInstall} Kg</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders Card */}
        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
            <h3 className="font-serif text-base font-bold text-[#1A1A1A] flex items-center gap-2">
              <Coffee className="h-4 w-4 text-[#8E2030]" />
              Tus Últimos Pedidos
            </h3>
            <span className="text-[11px] text-[#1A1A1A]/50 font-medium">{clientOrders.length} pedidos</span>
          </div>

          <div className="space-y-2.5">
            {clientOrders.slice(0, 3).map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-lg border border-[#1A1A1A]/10 bg-[#F9F7F2] p-3"
              >
                <div>
                  <div className="font-mono font-bold text-[#1A1A1A] text-xs">{o.orderNumber}</div>
                  <div className="text-[11px] text-[#1A1A1A]/50">
                    {new Date(o.createdAt).toLocaleDateString()} • {o.totalKg} Kg de Café
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-serif font-bold text-[#1A1A1A] text-sm">${o.totalAmount.toLocaleString()}</span>
                  <div className="text-[10px] font-semibold text-[#8E2030] uppercase tracking-wider">{o.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Request Service Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4 backdrop-blur-xs text-[#1A1A1A]">
          <div className="w-full max-w-md rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <h3 className="font-serif text-base font-bold text-[#1A1A1A]">Solicitar Asistencia Técnica</h3>
              <button onClick={() => setIsTicketModalOpen(false)} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A]">✕</button>
            </div>

            <form onSubmit={handleRequestService} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1">Problema o síntoma observado</label>
                <select
                  value={ticketProblem}
                  onChange={(e) => setTicketProblem(e.target.value)}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
                >
                  <option value="Poca presión de vapor">Poca presión de vapor</option>
                  <option value="Goteo en portafiltro / juntas gastadas">Goteo en portafiltro / juntas gastadas</option>
                  <option value="Temperatura baja o inestable de extracción">Temperatura baja o inestable de extracción</option>
                  <option value="Ruido anormal en bomba de agua">Ruido anormal en bomba de agua</option>
                  <option value="Ajuste / Calibración de Molino">Ajuste / Calibración de Molino</option>
                  <option value="Mantenimiento preventivo general">Mantenimiento preventivo general</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1A1A1A]/10">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="rounded-lg border border-[#1A1A1A]/15 bg-white px-3.5 py-1.5 text-xs text-[#1A1A1A]/70 hover:bg-[#F2EFE9]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#8E2030] px-4 py-1.5 font-semibold text-white hover:brightness-110"
                >
                  Enviar Solicitud Urgente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
