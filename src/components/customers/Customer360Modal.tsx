import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Customer } from "../../types";
import {
  X,
  Phone,
  Mail,
  MapPin,
  TrendingDown,
  TrendingUp,
  Cpu,
  AlertTriangle,
  RotateCcw,
  UserCheck,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Customer360ModalProps {
  customer: Customer;
  onClose: () => void;
}

export const Customer360Modal: React.FC<Customer360ModalProps> = ({ customer, onClose }) => {
  const {
    orders,
    machines,
    accountMovements,
    crmVisits,
    repeatLastCustomerOrder,
    setActiveTab,
  } = useApp();

  const [activeTab, setActiveSubTab] = useState<"resumen" | "consumo" | "pedidos" | "maquinas" | "cuenta" | "visitas">("resumen");

  const customerOrders = orders.filter((o) => o.customerId === customer.id);
  const customerMachines = machines.filter((m) => m.customerId === customer.id);
  const customerMovements = accountMovements.filter((m) => m.customerId === customer.id);
  const customerVisits = crmVisits.filter((v) => v.customerId === customer.id);

  // Mock 12-month consumption curve
  const monthlyConsumptionData = [
    { month: "Sep", kg: Math.round(customer.avgMonthlyKg * 0.95) },
    { month: "Oct", kg: Math.round(customer.avgMonthlyKg * 1.05) },
    { month: "Nov", kg: Math.round(customer.avgMonthlyKg * 1.1) },
    { month: "Dic", kg: Math.round(customer.avgMonthlyKg * 1.15) },
    { month: "Ene", kg: Math.round(customer.avgMonthlyKg * 0.9) },
    { month: "Feb", kg: Math.round(customer.avgMonthlyKg * 0.85) },
    { month: "Mar", kg: Math.round(customer.avgLast6MonthsKg * 1.0) },
    { month: "Abr", kg: Math.round(customer.avgLast6MonthsKg * 0.95) },
    { month: "May", kg: Math.round(customer.avgLast6MonthsKg * 0.9) },
    { month: "Jun", kg: Math.round(customer.avgLast3MonthsKg * 1.05) },
    { month: "Jul", kg: Math.round(customer.avgLast3MonthsKg * 0.95) },
    { month: "Ago", kg: Math.round(customer.avgLast3MonthsKg) },
  ];

  const handleRepeatOrder = () => {
    const newOrder = repeatLastCustomerOrder(customer.id);
    if (newOrder) {
      alert(`¡Pedido ${newOrder.orderNumber} generado con éxito por $${newOrder.totalAmount}!`);
      onClose();
      setActiveTab("orders");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto text-[#1A1A1A]">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col rounded-xl border border-[#1A1A1A]/10 bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#1A1A1A]/10 bg-[#F9F7F2] p-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1A1A1A] text-white font-serif font-black text-lg">
              ☕
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">{customer.commercialName}</h2>
                <span className="rounded bg-[#1A1A1A]/5 px-2 py-0.5 text-xs font-mono text-[#1A1A1A]/70">
                  {customer.code}
                </span>
                <span
                  className={`rounded px-2 py-0.5 font-sans text-[9px] uppercase tracking-[0.15em] font-semibold ${
                    customer.scoring === "Alto Valor"
                      ? "bg-emerald-900/10 text-emerald-800 border border-emerald-700/30"
                      : customer.scoring === "Crecimiento"
                      ? "bg-[#1A1A1A]/10 text-[#1A1A1A] border border-[#1A1A1A]/20"
                      : customer.scoring === "Riesgo"
                      ? "bg-[#C2823D]/10 text-[#C2823D] border border-[#C2823D]/30"
                      : "bg-[#8E2030]/10 text-[#8E2030] border border-[#8E2030]/30"
                  }`}
                >
                  {customer.scoring}
                </span>
              </div>
              <p className="font-sans text-xs text-[#1A1A1A]/60 mt-0.5">
                {customer.legalName} • CUIT {customer.taxId} • {customer.segment} • Zona {customer.zone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRepeatOrder}
              className="flex items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#8E2030] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="font-sans text-[11px] uppercase tracking-[0.1em]">Repetir Pedido</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-[#1A1A1A]/10 bg-white p-2 text-[#1A1A1A]/50 hover:bg-[#F2EFE9] hover:text-[#1A1A1A] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#1A1A1A]/10 bg-[#F9F7F2] p-3 gap-3 text-xs font-sans">
          <div className="rounded-lg bg-white p-3 border border-[#1A1A1A]/10 shadow-2xs">
            <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider font-semibold">Consumo Promedio</span>
            <div className="font-serif text-base font-bold text-[#1A1A1A] mt-0.5">
              {customer.avgMonthlyKg} Kg/mes
            </div>
          </div>
          <div className="rounded-lg bg-white p-3 border border-[#1A1A1A]/10 shadow-2xs">
            <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider font-semibold">Variación vs 6m</span>
            <div className={`text-base font-bold mt-0.5 flex items-center gap-1 ${
              customer.consumptionChangePercent < -15
                ? "text-[#8E2030]"
                : customer.consumptionChangePercent > 0
                ? "text-emerald-700"
                : "text-[#1A1A1A]"
            }`}>
              {customer.consumptionChangePercent < 0 ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              {customer.consumptionChangePercent}%
            </div>
          </div>
          <div className="rounded-lg bg-white p-3 border border-[#1A1A1A]/10 shadow-2xs">
            <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider font-semibold">Saldo Cuenta Corriente</span>
            <div className="font-serif text-base font-bold text-[#1A1A1A] mt-0.5">
              ${customer.currentAccountBalance.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg bg-white p-3 border border-[#1A1A1A]/10 shadow-2xs">
            <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider font-semibold">Deuda Vencida</span>
            <div className={`font-serif text-base font-bold mt-0.5 ${customer.overdueDebt > 0 ? "text-[#8E2030]" : "text-emerald-700"}`}>
              ${customer.overdueDebt.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-[#1A1A1A]/10 bg-white px-5 text-xs font-semibold overflow-x-auto">
          {[
            { id: "resumen", label: "Visión General & 360" },
            { id: "consumo", label: "Historial de Consumo" },
            { id: "pedidos", label: `Pedidos (${customerOrders.length})` },
            { id: "maquinas", label: `Máquinas (${customerMachines.length})` },
            { id: "cuenta", label: `Cuenta Corriente (${customerMovements.length})` },
            { id: "visitas", label: `Visitas & CRM (${customerVisits.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`py-3 px-4 border-b-2 font-sans text-xs uppercase tracking-[0.1em] transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#8E2030] text-[#8E2030] font-bold"
                  : "border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar font-sans text-xs">
          {activeTab === "resumen" && (
            <div className="grid gap-5 md:grid-cols-2">
              {/* Contact & Commercial Info */}
              <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-4 space-y-3">
                <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#8E2030]">
                  Información Comercial &amp; Contactos
                </h4>
                <div className="space-y-2 text-xs text-[#1A1A1A]/80">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#8E2030]" />
                      <span>{customer.address}, {customer.city} ({customer.zone})</span>
                    </p>
                  </div>
                  {customer.lat !== undefined && customer.lng !== undefined && (
                    <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-[#1A1A1A]/10 text-[11px]">
                      <span className="font-mono text-[10px] text-[#1A1A1A]/70">
                        GPS: {customer.lat.toFixed(4)}, {customer.lng.toFixed(4)}
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${customer.lat},${customer.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#8E2030] hover:underline"
                        >
                          Google Maps ↗
                        </a>
                        <span className="text-[#1A1A1A]/30">•</span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("geomap" as any);
                            onClose();
                          }}
                          className="font-bold text-[#1A1A1A] hover:text-[#8E2030] hover:underline"
                        >
                          Ver en Rutas 🗺️
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#1A1A1A]/40" />
                    <span>{customer.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#1A1A1A]/40" />
                    <span>{customer.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-[#1A1A1A]/40" />
                    <span>Preventista: <strong>{customer.preventistaName}</strong></span>
                  </p>
                </div>

                <div className="border-t border-[#1A1A1A]/10 pt-3">
                  <h5 className="font-sans text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/60 mb-2">Contactos Registrados</h5>
                  {customer.contacts.map((c) => (
                    <div key={c.id} className="rounded-lg bg-white border border-[#1A1A1A]/10 p-2.5 text-xs mb-1.5 shadow-2xs">
                      <div className="flex items-center justify-between font-semibold text-[#1A1A1A]">
                        <span>{c.name} {c.isPrimary && <span className="text-[10px] text-[#8E2030]">(Principal)</span>}</span>
                        <span className="text-[#1A1A1A]/50 text-[10px]">{c.role}</span>
                      </div>
                      <div className="text-[11px] text-[#1A1A1A]/60 mt-0.5">{c.phone} • {c.email}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commercial Terms & Risk Detection */}
              <div className="space-y-4">
                <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-4 space-y-3 text-xs">
                  <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">
                    Condiciones Comerciales
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5 text-[#1A1A1A]">
                    <div className="rounded-lg bg-white border border-[#1A1A1A]/10 p-2.5">
                      <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider block">Condición de Pago</span>
                      <p className="font-serif font-bold text-[#1A1A1A] mt-0.5">{customer.paymentTermDays} días</p>
                    </div>
                    <div className="rounded-lg bg-white border border-[#1A1A1A]/10 p-2.5">
                      <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider block">Límite de Crédito</span>
                      <p className="font-serif font-bold text-[#1A1A1A] mt-0.5">${customer.creditLimit.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg bg-white border border-[#1A1A1A]/10 p-2.5">
                      <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider block">Lista de Precios</span>
                      <p className="font-serif font-bold text-[#1A1A1A] mt-0.5">Tier {customer.priceTier}</p>
                    </div>
                    <div className="rounded-lg bg-white border border-[#1A1A1A]/10 p-2.5">
                      <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider block">Frecuencia de Compra</span>
                      <p className="font-serif font-bold text-[#1A1A1A] mt-0.5">Cada {customer.averagePurchaseFrequencyDays} días</p>
                    </div>
                  </div>
                </div>

                {customer.consumptionChangePercent < -20 && (
                  <div className="rounded-xl border border-[#8E2030]/20 bg-[#8E2030]/5 p-4 text-xs">
                    <div className="flex items-center gap-2 font-bold text-[#8E2030]">
                      <AlertTriangle className="h-4 w-4 text-[#8E2030]" />
                      <span className="font-serif font-bold">Alerta de Retención: Caída de Consumo</span>
                    </div>
                    <p className="text-[#1A1A1A]/80 mt-1">
                      El consumo de este cliente cayó un <strong>{Math.abs(customer.consumptionChangePercent)}%</strong> en los últimos 3 meses comparado a su histórico. Se recomienda visita comercial o degustación de nuevos orígenes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "consumo" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 shadow-2xs">
                <h4 className="font-serif text-sm font-bold text-[#1A1A1A] mb-3">
                  Evolución de Consumo Mensual (Kg de Café Tostado)
                </h4>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyConsumptionData}>
                      <defs>
                        <linearGradient id="cliKg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8E2030" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#8E2030" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#1A1A1A" opacity={0.4} fontSize={11} />
                      <YAxis stroke="#1A1A1A" opacity={0.4} fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#1A1A1A20", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                      <Area type="monotone" dataKey="kg" name="Kg Café" stroke="#8E2030" strokeWidth={2} fill="url(#cliKg)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-3.5">
                  <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider">Promedio Últimos 3 Meses</span>
                  <p className="font-serif text-base font-bold text-[#1A1A1A] mt-1">{customer.avgLast3MonthsKg} Kg/mes</p>
                </div>
                <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-3.5">
                  <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider">Promedio Últimos 6 Meses</span>
                  <p className="font-serif text-base font-bold text-[#1A1A1A] mt-1">{customer.avgLast6MonthsKg} Kg/mes</p>
                </div>
                <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-3.5">
                  <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider">Promedio Últimos 12 Meses</span>
                  <p className="font-serif text-base font-bold text-[#1A1A1A] mt-1">{customer.avgLast12MonthsKg} Kg/mes</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pedidos" && (
            <div className="space-y-3">
              {customerOrders.length === 0 ? (
                <p className="text-xs text-[#1A1A1A]/50">No hay pedidos registrados para este cliente.</p>
              ) : (
                customerOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-xl border border-[#1A1A1A]/10 bg-white p-3.5 text-xs shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2 font-bold text-[#1A1A1A]">
                        <span>{o.orderNumber}</span>
                        <span className="rounded bg-[#1A1A1A]/5 px-2 py-0.5 font-sans text-[9px] uppercase tracking-wider text-[#1A1A1A]/70">
                          {o.status}
                        </span>
                      </div>
                      <p className="text-[#1A1A1A]/60 text-[11px] mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString()} • {o.totalKg} Kg • {(o.items || []).map((it) => it.productName).join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif font-bold text-sm text-[#1A1A1A]">${o.totalAmount.toLocaleString()}</p>
                      <p className="text-[10px] text-[#1A1A1A]/40">{o.deliveryModality}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "maquinas" && (
            <div className="space-y-3">
              {customerMachines.length === 0 ? (
                <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-8 text-center text-xs text-[#1A1A1A]/60">
                  <Cpu className="mx-auto h-8 w-8 text-[#1A1A1A]/30 mb-2" />
                  <p>Este cliente no tiene máquinas de café asignadas en consignación o vendidas.</p>
                </div>
              ) : (
                customerMachines.map((m) => (
                  <div key={m.id} className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 text-xs space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1A1A1A]/5 text-[#1A1A1A] font-bold border border-[#1A1A1A]/10">
                          ⚙️
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">{m.brand} {m.model}</h4>
                          <p className="text-[11px] text-[#1A1A1A]/50">Código: {m.code} • S/N: {m.serialNumber} • Modalidad: {m.modality}</p>
                        </div>
                      </div>
                      <span className="rounded px-2 py-0.5 font-sans text-[9px] uppercase tracking-wider font-semibold bg-emerald-900/10 text-emerald-800 border border-emerald-700/30">
                        {m.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#1A1A1A]/10 text-[11px]">
                      <div>
                        <span className="text-[#1A1A1A]/50 block">Instalación:</span>
                        <p className="font-semibold text-[#1A1A1A]">{m.installationDate || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[#1A1A1A]/50 block">Kg Generados:</span>
                        <p className="font-bold text-[#8E2030]">{m.totalKgSinceInstall} Kg</p>
                      </div>
                      <div>
                        <span className="text-[#1A1A1A]/50 block">Margen Acumulado:</span>
                        <p className="font-bold text-emerald-800">${m.accumulatedCoffeeMarginUSD.toLocaleString()} USD</p>
                      </div>
                      <div>
                        <span className="text-[#1A1A1A]/50 block">Recuperación Costo:</span>
                        <p className="font-bold text-[#1A1A1A]">{m.recoveryPercent}%</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "cuenta" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#F9F7F2] p-3.5 rounded-xl border border-[#1A1A1A]/10 text-xs">
                <span className="text-[#1A1A1A]/60">Saldo Actual en Cuenta Corriente:</span>
                <span className="font-serif text-lg font-black text-[#8E2030]">${customer.currentAccountBalance.toLocaleString()}</span>
              </div>

              {customerMovements.map((mov) => (
                <div key={mov.id} className="flex items-center justify-between rounded-xl border border-[#1A1A1A]/10 bg-white p-3.5 text-xs shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-[#1A1A1A]">
                      <span>{mov.type}: {mov.referenceNumber}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold ${
                        mov.status === "Vencido" ? "bg-[#8E2030]/10 text-[#8E2030]" : "bg-[#1A1A1A]/5 text-[#1A1A1A]/70"
                      }`}>
                        {mov.status} {mov.daysOverdue ? `(${mov.daysOverdue}d)` : ""}
                      </span>
                    </div>
                    <p className="text-[#1A1A1A]/50 text-[11px] mt-0.5">{mov.date} {mov.dueDate ? `• Vence: ${mov.dueDate}` : ""}</p>
                  </div>
                  <div className="text-right">
                    {mov.debit > 0 && <p className="font-serif font-bold text-[#8E2030]">+${mov.debit.toLocaleString()}</p>}
                    {mov.credit > 0 && <p className="font-serif font-bold text-emerald-800">-${mov.credit.toLocaleString()}</p>}
                    <p className="text-[10px] text-[#1A1A1A]/40">Saldo: ${mov.balance.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "visitas" && (
            <div className="space-y-3">
              {customerVisits.length === 0 ? (
                <p className="text-xs text-[#1A1A1A]/50">No hay visitas de preventa registradas.</p>
              ) : (
                customerVisits.map((v) => (
                  <div key={v.id} className="rounded-xl border border-[#1A1A1A]/10 bg-white p-4 text-xs space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between font-bold text-[#1A1A1A]">
                      <span className="font-serif text-sm">{v.purpose} ({v.date} {v.time} hs)</span>
                      <span className="rounded bg-[#8E2030]/10 text-[#8E2030] px-2 py-0.5 text-[10px] font-sans uppercase tracking-wider font-semibold">
                        {v.outcome}
                      </span>
                    </div>
                    <p className="text-[#1A1A1A]/70 leading-relaxed">{v.notes}</p>
                    {v.nextAction && (
                      <div className="mt-2 text-[11px] text-[#8E2030] bg-[#8E2030]/5 p-2.5 rounded-lg border border-[#8E2030]/15">
                        <strong>Próxima acción:</strong> {v.nextAction} ({v.nextActionDate})
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
