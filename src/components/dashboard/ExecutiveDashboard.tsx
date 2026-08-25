import React from "react";
import { useApp } from "../../context/AppContext";
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  Cpu,
  Truck,
  Users,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const ExecutiveDashboard: React.FC = () => {
  const {
    currentOrg,
    customers,
    orders,
    machines,
    alerts,
    setActiveTab,
    setSelectedCustomerId,
    setSelectedMachineId,
    setIsAiDrawerOpen,
    dismissAlert,
  } = useApp();

  // Financial & Sales Calculations
  const totalSalesMonth = orders
    .filter((o) => o.status !== "Cancelado")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalKgMonth = orders
    .filter((o) => o.status !== "Cancelado")
    .reduce((sum, o) => sum + o.totalKg, 0);

  const averageTicket = orders.length > 0 ? totalSalesMonth / orders.length : 0;

  // Orders Operational Breakdown
  const pendingOrders = orders.filter(
    (o) => o.status !== "Entregado" && o.status !== "Facturado" && o.status !== "Cobrado" && o.status !== "Cancelado"
  );
  const overdueOrders = pendingOrders.filter((o) => new Date(o.promisedDate) < new Date());
  const preparedOrders = orders.filter((o) => o.status === "Preparado");
  const inTransitOrders = orders.filter((o) => o.status === "En tránsito" || o.status === "Despachado");
  const deliveredUninvoicedOrders = orders.filter((o) => o.isDeliveredUninvoiced);

  // Receivables & Collections
  const totalReceivables = customers.reduce((sum, c) => sum + c.currentAccountBalance, 0);
  const totalOverdue = customers.reduce((sum, c) => sum + c.overdueDebt, 0);

  // Machines breakdown
  const installedMachines = machines.filter(
    (m) => m.modality === "Comodato / Consignación" || m.modality === "Vendida"
  );
  const consignedMachines = machines.filter((m) => m.modality === "Comodato / Consignación");
  const inRepairMachines = machines.filter((m) => m.status === "En Service" || m.modality === "En Reparación");
  const availableMachines = machines.filter((m) => m.modality === "Depósito / Disponible");
  const serviceNeededMachines = machines.filter((m) => m.status === "Requiere Mantenimiento");

  // Coffee kg generated via consigned machines
  const consignedKgTotal = consignedMachines.reduce((sum, m) => sum + m.totalKgSinceInstall, 0);

  // Customers metrics
  const activeCustomers = customers.filter((c) => c.status === "Activo");
  const riskCustomers = customers.filter((c) => c.scoring === "Riesgo" || c.scoring === "Riesgo Crítico");
  const growthCustomers = customers.filter((c) => c.scoring === "Crecimiento");

  // Evolution chart data (last 6 months demo curve)
  const salesTrendData = [
    { month: "Mar", salesUSD: 8900, kg: 420 },
    { month: "Abr", salesUSD: 10400, kg: 490 },
    { month: "May", salesUSD: 11800, kg: 560 },
    { month: "Jun", salesUSD: 12900, kg: 610 },
    { month: "Jul", salesUSD: 13800, kg: 660 },
    { month: "Ago", salesUSD: totalSalesMonth + 8200, kg: totalKgMonth + 410 },
  ];

  // Aging distribution data
  const agingData = [
    { name: "Al día (0-15d)", value: Math.max(0, totalReceivables - totalOverdue), color: "#2E7D32" },
    { name: "Vencido 16-30d", value: totalOverdue * 0.45, color: "#C2823D" },
    { name: "Vencido 31-60d", value: totalOverdue * 0.35, color: "#D97706" },
    { name: "Vencido +60d", value: totalOverdue * 0.2, color: "#8E2030" },
  ];

  const handleAlertAction = (alert: any) => {
    if (alert.actionTarget) {
      setActiveTab(alert.actionTarget);
      if (alert.entityType === "customer" && alert.entityId) {
        setSelectedCustomerId(alert.entityId);
      } else if (alert.entityType === "machine" && alert.entityId) {
        setSelectedMachineId(alert.entityId);
      }
    }
  };

  return (
    <div className="space-y-8 pb-16 text-[#1A1A1A]">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[#1A1A1A]/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8E2030]">
              Dashboard Ejecutivo
            </span>
            <span className="h-1 w-1 rounded-full bg-[#1A1A1A]/30"></span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]/50">
              {currentOrg.name}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A]">
            Control Total <span className="italic font-normal">&amp; Rendimiento</span>
          </h1>
          <p className="font-sans text-xs text-[#1A1A1A]/60 mt-1">
            {currentOrg.legalName} • Razón Social {currentOrg.taxId} • Moneda: {currentOrg.currency}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("production")}
            className="flex items-center gap-2 rounded-lg border border-[#8E2030]/30 bg-[#8E2030]/10 px-3.5 py-2 text-xs font-bold text-[#8E2030] shadow-xs hover:bg-[#8E2030] hover:text-white active:scale-98 transition-all"
          >
            <span className="font-sans text-[11px] uppercase tracking-[0.1em]">🏭 Planta &amp; Tueste</span>
          </button>
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#1A1A1A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#8E2030] active:scale-98 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#E5A93C]" />
            <span className="font-sans text-[11px] uppercase tracking-[0.15em]">Consultar Copilot</span>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className="rounded-lg border border-[#1A1A1A]/20 bg-white px-4 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#F2EFE9] transition-colors shadow-2xs"
          >
            + Nuevo Pedido
          </button>
        </div>
      </div>

      {/* Coffee Roasting, Green Silos & Traceability Operational Banner */}
      <div className="rounded-xl border border-[#8E2030]/20 bg-gradient-to-r from-white via-[#F9F7F2] to-white p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8E2030] text-white shadow-xs">
              <span className="font-serif font-black text-lg">☕</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold text-[#1A1A1A]">
                  Planta de Tueste, Silos &amp; Trazabilidad de Stock
                </h3>
                <span className="bg-[#8E2030]/10 text-[#8E2030] border border-[#8E2030]/20 font-sans text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded">
                  Control Integral
                </span>
              </div>
              <p className="font-sans text-xs text-[#1A1A1A]/60 mt-0.5">
                Remitos de entrada de café verde, formulación de blends con merma, etiquetas de lote y kardex auditado
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("production")}
              className="flex items-center gap-1.5 rounded-lg bg-[#8E2030] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#721926] active:scale-98 transition-all"
            >
              <span>Ir a Planta &amp; Tueste →</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div
            onClick={() => setActiveTab("production")}
            className="p-3 rounded-lg bg-white border border-[#1A1A1A]/10 hover:border-[#8E2030]/50 cursor-pointer transition-all shadow-2xs"
          >
            <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/50 block">Silos Café Verde</span>
            <span className="font-serif font-bold text-lg text-emerald-800">4,750 Kg</span>
            <span className="text-[11px] text-[#1A1A1A]/60 block mt-0.5">4 Lotes registrados</span>
          </div>

          <div
            onClick={() => setActiveTab("production")}
            className="p-3 rounded-lg bg-white border border-[#1A1A1A]/10 hover:border-[#8E2030]/50 cursor-pointer transition-all shadow-2xs"
          >
            <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/50 block">Tuestes &amp; Blends</span>
            <span className="font-serif font-bold text-lg text-[#1A1A1A]">4 Órdenes</span>
            <span className="text-[11px] text-[#8E2030] font-bold block mt-0.5">Control de merma</span>
          </div>

          <div
            onClick={() => setActiveTab("production")}
            className="p-3 rounded-lg bg-white border border-[#1A1A1A]/10 hover:border-[#8E2030]/50 cursor-pointer transition-all shadow-2xs"
          >
            <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/50 block">Etiquetas Térmicas</span>
            <span className="font-serif font-bold text-lg text-purple-900">QR &amp; Trazabilidad</span>
            <span className="text-[11px] text-[#1A1A1A]/60 block mt-0.5">Impresión térmica</span>
          </div>

          <div
            onClick={() => setActiveTab("production")}
            className="p-3 rounded-lg bg-white border border-[#1A1A1A]/10 hover:border-[#8E2030]/50 cursor-pointer transition-all shadow-2xs"
          >
            <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/50 block">Kardex &amp; Ajustes</span>
            <span className="font-serif font-bold text-lg text-[#1A1A1A]">Auditado</span>
            <span className="text-[11px] text-amber-800 font-semibold block mt-0.5">PIN Supervisor</span>
          </div>
        </div>
      </div>

      {/* Critical Alert Center */}
      <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#8E2030]/10 text-[#8E2030] border border-[#8E2030]/20">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#1A1A1A]">Centro de Alertas &amp; Riesgos</h2>
              <p className="font-sans text-[11px] text-[#1A1A1A]/60">Detección automática en tiempo real de atrasos, cobranzas y consumo</p>
            </div>
          </div>
          <span className="rounded-full bg-[#F2EFE9] px-3 py-1 font-sans text-[10px] uppercase tracking-[0.15em] font-semibold text-[#1A1A1A]/70 border border-[#1A1A1A]/10">
            {alerts.length} activas
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {alerts.slice(0, 6).map((alert) => {
            const isCritical = alert.severity === "CRITICO";
            const isAttention = alert.severity === "ATENCION";
            const isOpportunity = alert.severity === "OPORTUNIDAD";

            const badgeBg = isCritical
              ? "bg-[#8E2030]/10 text-[#8E2030] border-[#8E2030]/30"
              : isAttention
              ? "bg-[#C2823D]/10 text-[#C2823D] border-[#C2823D]/30"
              : isOpportunity
              ? "bg-emerald-900/10 text-emerald-800 border-emerald-700/30"
              : "bg-[#1A1A1A]/10 text-[#1A1A1A] border-[#1A1A1A]/20";

            return (
              <div
                key={alert.id}
                className="group relative flex flex-col justify-between rounded-lg border border-[#1A1A1A]/10 bg-[#F9F7F2] p-4 hover:border-[#1A1A1A]/30 transition-all shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`rounded px-1.5 py-0.5 font-sans text-[9px] uppercase tracking-[0.15em] font-semibold border ${badgeBg}`}>
                      {alert.severity} • {alert.category}
                    </span>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] text-xs"
                      title="Descartar"
                    >
                      ✕
                    </button>
                  </div>
                  <h4 className="font-serif text-xs font-bold text-[#1A1A1A] group-hover:text-[#8E2030] transition-colors">
                    {alert.title}
                  </h4>
                  <p className="font-sans text-[11px] leading-relaxed text-[#1A1A1A]/70 line-clamp-2">
                    {alert.description}
                  </p>
                </div>

                {alert.actionLabel && (
                  <button
                    onClick={() => handleAlertAction(alert)}
                    className="mt-3 flex items-center justify-between rounded-md bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#8E2030] hover:bg-[#8E2030]/5 border border-[#1A1A1A]/10 transition-colors shadow-2xs"
                  >
                    <span>{alert.actionLabel}</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Grid - Primary Business Metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Ventas Totales */}
        <div
          onClick={() => setActiveTab("billing")}
          className="cursor-pointer rounded-xl border border-[#1A1A1A]/10 bg-white p-5 hover:border-[#1A1A1A]/30 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-[#1A1A1A]/60 font-sans text-[10px] uppercase tracking-[0.2em] font-semibold">
            <span>Ventas Facturadas / Mes</span>
            <DollarSign className="h-4 w-4 text-[#2E7D32]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#1A1A1A]">
              ${totalSalesMonth.toLocaleString()}
            </span>
            <span className="flex items-center font-sans text-xs font-semibold text-[#2E7D32]">
              <ArrowUpRight className="h-3.5 w-3.5" /> +14.2%
            </span>
          </div>
          <div className="mt-2 font-sans text-[11px] text-[#1A1A1A]/50">
            Ticket promedio: <span className="text-[#1A1A1A] font-semibold">${averageTicket.toFixed(0)}</span>
          </div>
        </div>

        {/* Kg de Café Vendidos */}
        <div
          onClick={() => setActiveTab("production")}
          className="cursor-pointer rounded-xl border border-[#1A1A1A]/10 bg-white p-5 hover:border-[#1A1A1A]/30 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-[#1A1A1A]/60 font-sans text-[10px] uppercase tracking-[0.2em] font-semibold">
            <span>Café Tostado Vendido</span>
            <Package className="h-4 w-4 text-[#C2823D]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#1A1A1A]">
              {totalKgMonth.toLocaleString()} <span className="font-sans text-sm font-normal text-[#1A1A1A]/50">Kg</span>
            </span>
            <span className="flex items-center font-sans text-xs font-semibold text-[#2E7D32]">
              <ArrowUpRight className="h-3.5 w-3.5" /> +9.8%
            </span>
          </div>
          <div className="mt-2 font-sans text-[11px] text-[#1A1A1A]/50">
            En comodato: <span className="text-[#1A1A1A] font-semibold">{consignedKgTotal.toLocaleString()} Kg acum.</span>
          </div>
        </div>

        {/* Cuentas por Cobrar & Deuda */}
        <div
          onClick={() => setActiveTab("collections")}
          className="cursor-pointer rounded-xl border border-[#1A1A1A]/10 bg-white p-5 hover:border-[#1A1A1A]/30 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-[#1A1A1A]/60 font-sans text-[10px] uppercase tracking-[0.2em] font-semibold">
            <span>Cuentas por Cobrar</span>
            <CreditCard className="h-4 w-4 text-[#8E2030]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#1A1A1A]">
              ${totalReceivables.toLocaleString()}
            </span>
            {totalOverdue > 0 && (
              <span className="flex items-center rounded bg-[#8E2030]/10 px-1.5 py-0.5 font-sans text-[9px] uppercase tracking-[0.1em] font-bold text-[#8E2030] border border-[#8E2030]/20">
                ${totalOverdue.toLocaleString()} vencido
              </span>
            )}
          </div>
          <div className="mt-2 font-sans text-[11px] text-[#1A1A1A]/50">
            Vence hoy: <span className="text-[#1A1A1A] font-semibold">$1,450.00</span>
          </div>
        </div>

        {/* Máquinas Instaladas */}
        <div
          onClick={() => setActiveTab("machines")}
          className="cursor-pointer rounded-xl border border-[#1A1A1A]/10 bg-white p-5 hover:border-[#1A1A1A]/30 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-[#1A1A1A]/60 font-sans text-[10px] uppercase tracking-[0.2em] font-semibold">
            <span>Parque de Máquinas</span>
            <Cpu className="h-4 w-4 text-[#1A1A1A]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#1A1A1A]">
              {installedMachines.length}{" "}
              <span className="font-sans text-sm font-normal text-[#1A1A1A]/50">/ {machines.length} total</span>
            </span>
            <span className="font-sans text-xs text-[#1A1A1A]/60">
              ({consignedMachines.length} comodatos)
            </span>
          </div>
          <div className="mt-2 font-sans text-[11px] text-[#1A1A1A]/50">
            Disponibles en depósito: <span className="text-[#2E7D32] font-semibold">{availableMachines.length}</span>
          </div>
        </div>
      </div>

      {/* Operative Pillars */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Estado del Backlog de Pedidos */}
        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
            <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A] flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-[#C2823D]" />
              Flujo de Pedidos
            </h3>
            <button
              onClick={() => setActiveTab("orders")}
              className="font-sans text-[10px] uppercase tracking-[0.1em] font-semibold text-[#8E2030] hover:underline"
            >
              Ver backlog ({pendingOrders.length})
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            <div className="flex items-center justify-between rounded-lg bg-[#F9F7F2] px-3 py-2 text-xs border border-[#1A1A1A]/5">
              <span className="text-[#1A1A1A]/70">Pedidos pendientes de entrega</span>
              <span className="font-bold text-[#1A1A1A]">{pendingOrders.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#8E2030]/5 border border-[#8E2030]/20 px-3 py-2 text-xs">
              <span className="font-semibold text-[#8E2030] flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-[#8E2030]" />
                Pedidos atrasados
              </span>
              <span className="font-black text-[#8E2030]">{overdueOrders.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#F9F7F2] px-3 py-2 text-xs border border-[#1A1A1A]/5">
              <span className="text-[#1A1A1A]/70">Preparados para despacho</span>
              <span className="font-bold text-[#C2823D]">{preparedOrders.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#F9F7F2] px-3 py-2 text-xs border border-[#1A1A1A]/5">
              <span className="text-[#1A1A1A]/70">En tránsito / Chofer en ruta</span>
              <span className="font-bold text-[#1A1A1A]">{inTransitOrders.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#8E2030]/10 border border-[#8E2030]/30 px-3 py-2 text-xs">
              <span className="font-semibold text-[#8E2030]">Entregados SIN facturar</span>
              <span className="font-black text-[#8E2030]">{deliveredUninvoicedOrders.length}</span>
            </div>
          </div>
        </div>

        {/* Salud de Clientes & CRM */}
        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
            <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A] flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-[#2E7D32]" />
              Salud de Clientes
            </h3>
            <button
              onClick={() => setActiveTab("customers")}
              className="font-sans text-[10px] uppercase tracking-[0.1em] font-semibold text-[#8E2030] hover:underline"
            >
              Ver los {customers.length}
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            <div className="flex items-center justify-between rounded-lg bg-[#F9F7F2] px-3 py-2 text-xs border border-[#1A1A1A]/5">
              <span className="text-[#1A1A1A]/70">Clientes activos</span>
              <span className="font-bold text-[#2E7D32]">{activeCustomers.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#C2823D]/10 border border-[#C2823D]/30 px-3 py-2 text-xs">
              <span className="font-semibold text-[#C2823D] flex items-center gap-1.5">
                <ArrowDownRight className="h-3.5 w-3.5 text-[#C2823D]" />
                Clientes con caída de consumo (&gt;20%)
              </span>
              <span className="font-black text-[#C2823D]">{riskCustomers.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-emerald-900/5 border border-emerald-700/20 px-3 py-2 text-xs">
              <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-700" />
                Clientes en crecimiento
              </span>
              <span className="font-bold text-emerald-800">{growthCustomers.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#F9F7F2] px-3 py-2 text-xs border border-[#1A1A1A]/5">
              <span className="text-[#1A1A1A]/70">En fecha estimada de recompra</span>
              <span className="font-bold text-[#8E2030]">2 hoy</span>
            </div>
          </div>
        </div>

        {/* Máquinas & Rentabilidad */}
        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
            <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A] flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-[#1A1A1A]" />
              Mantenimiento &amp; Equipos
            </h3>
            <button
              onClick={() => setActiveTab("machines")}
              className="font-sans text-[10px] uppercase tracking-[0.1em] font-semibold text-[#8E2030] hover:underline"
            >
              Ver inventario
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            <div className="flex items-center justify-between rounded-lg bg-[#F9F7F2] px-3 py-2 text-xs border border-[#1A1A1A]/5">
              <span className="text-[#1A1A1A]/70">Máquinas en comodato activas</span>
              <span className="font-bold text-[#1A1A1A]">{consignedMachines.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#8E2030]/10 border border-[#8E2030]/30 px-3 py-2 text-xs">
              <span className="font-semibold text-[#8E2030]">Requieren service / mantenimiento</span>
              <span className="font-black text-[#8E2030]">{serviceNeededMachines.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#F9F7F2] px-3 py-2 text-xs border border-[#1A1A1A]/5">
              <span className="text-[#1A1A1A]/70">En taller / reparación</span>
              <span className="font-bold text-[#C2823D]">{inRepairMachines.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-emerald-900/5 border border-emerald-700/20 px-3 py-2 text-xs">
              <span className="text-emerald-800">Recuperación promedio de inversión</span>
              <span className="font-black text-emerald-800">224% Payback OK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Sales & Kg Evolution Chart */}
        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 lg:col-span-2 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
            <div>
              <h3 className="font-serif text-sm font-bold text-[#1A1A1A]">
                Evolución de Ventas ($USD) &amp; Volumen (Kg de Café)
              </h3>
              <p className="font-sans text-[11px] text-[#1A1A1A]/50">Crecimiento mensual sostenido en tostaduría</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-sans">
              <span className="flex items-center gap-1.5 text-[#8E2030]">
                <span className="h-2 w-2 rounded-full bg-[#8E2030]"></span> Facturación USD
              </span>
              <span className="flex items-center gap-1.5 text-[#C2823D]">
                <span className="h-2 w-2 rounded-full bg-[#C2823D]"></span> Kg Tostados
              </span>
            </div>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8E2030" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8E2030" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="kgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C2823D" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#C2823D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE8DF" />
                <XAxis dataKey="month" stroke="#8C887F" fontSize={11} />
                <YAxis stroke="#8C887F" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#D8D3C8", borderRadius: "6px", fontSize: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                />
                <Area type="monotone" dataKey="salesUSD" name="Ventas USD" stroke="#8E2030" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="kg" name="Kg Café" stroke="#C2823D" strokeWidth={2} fillOpacity={1} fill="url(#kgGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Debt Aging Distribution */}
        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 shadow-2xs">
          <div className="border-b border-[#1A1A1A]/10 pb-3">
            <h3 className="font-serif text-sm font-bold text-[#1A1A1A]">
              Antigüedad de Deuda (Aging)
            </h3>
            <p className="font-sans text-[11px] text-[#1A1A1A]/50">Total en calle: ${totalReceivables.toLocaleString()}</p>
          </div>

          <div className="mt-4 h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={agingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {agingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toFixed(0)}`, "Monto"]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#D8D3C8", borderRadius: "6px", fontSize: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] mt-2 font-sans">
            {agingData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                <span className="text-[#1A1A1A]/70 truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
