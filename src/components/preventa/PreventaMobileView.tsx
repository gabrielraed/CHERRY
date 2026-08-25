import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Customer } from "../../types";
import { Customer360Modal } from "../customers/Customer360Modal";
import { NewOrderModal } from "../orders/NewOrderModal";
import {
  Briefcase,
  MapPin,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Search,
  Building2,
  Sparkles,
  Phone,
  User,
  ShoppingBag,
  ExternalLink,
  X,
  Store,
  Clock,
  Check,
} from "lucide-react";

export interface RouteStop {
  id: string;
  type: "customer" | "prospect";
  customerId?: string;
  name: string;
  address: string;
  zone: string;
  contactName?: string;
  contactPhone?: string;
  scoring?: string;
  avgMonthlyKg?: number;
  overdueDebt?: number;
  consumptionChangePercent?: number;
  notes?: string;
  status: "Pendiente" | "Visitado" | "Cancelado";
  visitedAt?: string;
  visitOutcome?: string;
}

export const PreventaMobileView: React.FC = () => {
  const {
    customers,
    currentUser,
    orders,
    repeatLastCustomerOrder,
    registerCRMVisit,
    addCustomer,
  } = useApp();

  // Route stops state
  const [routeStops, setRouteStops] = useState<RouteStop[]>(() => {
    // Initial 6 priority customers for today
    return customers.slice(0, 6).map((c) => ({
      id: `stop-${c.id}`,
      type: "customer",
      customerId: c.id,
      name: c.commercialName,
      address: c.address,
      zone: c.zone,
      contactName: c.contacts?.[0]?.name,
      contactPhone: c.contacts?.[0]?.phone || c.phone,
      scoring: c.scoring,
      avgMonthlyKg: c.avgMonthlyKg,
      overdueDebt: c.overdueDebt,
      consumptionChangePercent: c.consumptionChangePercent,
      notes: c.notes,
      status: "Pendiente",
    }));
  });

  // Filter tab for stops
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "visited" | "customers" | "prospects">("all");

  // Modals state
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isAddNewPlaceModalOpen, setIsAddNewPlaceModalOpen] = useState(false);
  const [customerFor360, setCustomerFor360] = useState<Customer | null>(null);
  const [orderModalCustomerId, setOrderModalCustomerId] = useState<string | null>(null);
  const [activeVisitStop, setActiveVisitStop] = useState<RouteStop | null>(null);

  // Visit Registration Form State
  const [visitPurpose, setVisitPurpose] = useState("Toma de Pedido");
  const [visitOutcome, setVisitOutcome] = useState("Pedido Generado");
  const [visitNotes, setVisitNotes] = useState("");
  const [satisfaction, setSatisfaction] = useState<number>(5);

  // New Place / Prospect Form State
  const [newPlaceName, setNewPlaceName] = useState("");
  const [newPlaceAddress, setNewPlaceAddress] = useState("");
  const [newPlaceZone, setNewPlaceZone] = useState("Palermo");
  const [newPlaceContactName, setNewPlaceContactName] = useState("");
  const [newPlaceContactPhone, setNewPlaceContactPhone] = useState("");
  const [newPlacePotentialKg, setNewPlacePotentialKg] = useState(60);
  const [newPlaceNotes, setNewPlaceNotes] = useState("");
  const [saveAsCRMClient, setSaveAsCRMClient] = useState(true);

  // Search in Add Existing Customer Modal
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [customerScoringFilter, setCustomerScoringFilter] = useState("all");

  // Toast / feedback message
  const [isSuccessMessage, setIsSuccessMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setIsSuccessMessage(msg);
    setTimeout(() => setIsSuccessMessage(null), 4500);
  };

  // Metrics for Today's Preventa
  const todayOrders = orders.filter(
    (o) =>
      o.salesRepId === currentUser.id ||
      o.preventistaId === currentUser.id ||
      new Date(o.createdAt).toDateString() === new Date().toDateString()
  );
  const todayKg = todayOrders.reduce((sum, o) => sum + o.totalKg, 0);
  const todayAmount = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const visitedCount = routeStops.filter((s) => s.status === "Visitado").length;
  const pendingCount = routeStops.filter((s) => s.status === "Pendiente").length;

  // Add existing customer to route
  const handleAddExistingCustomer = (customer: Customer) => {
    if (routeStops.some((s) => s.customerId === customer.id)) {
      showNotification(`"${customer.commercialName}" ya está en tu ruta de hoy.`);
      return;
    }

    const newStop: RouteStop = {
      id: `stop-${customer.id}-${Date.now()}`,
      type: "customer",
      customerId: customer.id,
      name: customer.commercialName,
      address: customer.address,
      zone: customer.zone,
      contactName: customer.contacts?.[0]?.name,
      contactPhone: customer.contacts?.[0]?.phone || customer.phone,
      scoring: customer.scoring,
      avgMonthlyKg: customer.avgMonthlyKg,
      overdueDebt: customer.overdueDebt,
      consumptionChangePercent: customer.consumptionChangePercent,
      notes: customer.notes,
      status: "Pendiente",
    };

    setRouteStops((prev) => [...prev, newStop]);
    showNotification(`¡"${customer.commercialName}" agregado a la ruta de visitas!`);
    setIsAddCustomerModalOpen(false);
    setCustomerSearchTerm("");
  };

  // Add new place / prospect
  const handleAddNewPlaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName.trim() || !newPlaceAddress.trim()) {
      alert("Por favor completa al menos el nombre del local y la dirección.");
      return;
    }

    let createdCustomerId: string | undefined = undefined;

    if (saveAsCRMClient) {
      const newCust = addCustomer({
        code: "",
        commercialName: newPlaceName,
        legalName: newPlaceName,
        taxId: "En trámite",
        address: newPlaceAddress,
        city: "CABA",
        zone: newPlaceZone,
        phone: newPlaceContactPhone || "+54 11 0000-0000",
        email: "contacto@prospecto.com",
        contacts: [
          {
            id: `c-${Date.now()}`,
            name: newPlaceContactName || "Encargado / Dueño",
            role: "Encargado",
            phone: newPlaceContactPhone,
            isPrimary: true,
          },
        ],
        salesRepId: currentUser.id,
        salesRepName: currentUser.name,
        preventistaId: currentUser.id,
        preventistaName: currentUser.name,
        paymentTermDays: 15,
        creditLimit: 2000,
        priceTier: "A (Especial)",
        status: "Activo",
        segment: "Specialty Cafe",
        scoring: "Crecimiento",
        potentialKgMonth: Number(newPlacePotentialKg),
        notes: `Alta desde preventa en calle: ${newPlaceNotes}`,
      });
      if (newCust && (newCust as any).id) {
        createdCustomerId = (newCust as any).id;
      }
    }

    const newStop: RouteStop = {
      id: `prospect-${Date.now()}`,
      type: createdCustomerId ? "customer" : "prospect",
      customerId: createdCustomerId,
      name: newPlaceName,
      address: newPlaceAddress,
      zone: newPlaceZone,
      contactName: newPlaceContactName || "Contacto Local",
      contactPhone: newPlaceContactPhone,
      scoring: "Crecimiento",
      avgMonthlyKg: Number(newPlacePotentialKg),
      notes: newPlaceNotes,
      status: "Pendiente",
    };

    setRouteStops((prev) => [...prev, newStop]);
    showNotification(`¡Lugar "${newPlaceName}" agregado a la ruta de visitas de hoy!`);
    setIsAddNewPlaceModalOpen(false);

    // Reset form
    setNewPlaceName("");
    setNewPlaceAddress("");
    setNewPlaceContactName("");
    setNewPlaceContactPhone("");
    setNewPlaceNotes("");
    setNewPlacePotentialKg(60);
  };

  // Remove stop from route
  const handleRemoveStop = (stopId: string, stopName: string) => {
    if (confirm(`¿Quitar "${stopName}" de la ruta de visitas de hoy?`)) {
      setRouteStops((prev) => prev.filter((s) => s.id !== stopId));
      showNotification(`"${stopName}" removido de la ruta.`);
    }
  };

  // Move stop up in route order
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setRouteStops((prev) => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  // Move stop down in route order
  const handleMoveDown = (index: number) => {
    if (index === routeStops.length - 1) return;
    setRouteStops((prev) => {
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  // Toggle quick visit status
  const handleToggleVisited = (stop: RouteStop) => {
    const newStatus = stop.status === "Visitado" ? "Pendiente" : "Visitado";
    setRouteStops((prev) =>
      prev.map((s) =>
        s.id === stop.id
          ? {
              ...s,
              status: newStatus,
              visitedAt: newStatus === "Visitado" ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
            }
          : s
      )
    );
    showNotification(
      newStatus === "Visitado"
        ? `Visita a "${stop.name}" marcada como completada.`
        : `"${stop.name}" marcada como pendiente.`
    );
  };

  // Quick repeat order
  const handleQuickRepeatOrder = (stop: RouteStop) => {
    if (!stop.customerId) {
      alert("Para generar un pedido, este lugar debe estar registrado como cliente.");
      return;
    }
    const newOrder = repeatLastCustomerOrder(stop.customerId);
    if (newOrder) {
      registerCRMVisit({
        customerId: stop.customerId,
        customerName: stop.name,
        purpose: "Toma de Pedido (Express)",
        outcome: "Pedido Generado",
        generatedOrderId: newOrder.id,
        orderKg: newOrder.totalKg,
        orderAmount: newOrder.totalAmount,
        notes: `Pedido express generado por preventa: ${newOrder.totalKg} Kg de café.`,
      });

      // Mark stop as visited
      setRouteStops((prev) =>
        prev.map((s) =>
          s.id === stop.id
            ? {
                ...s,
                status: "Visitado",
                visitedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                visitOutcome: `Pedido #${newOrder.orderNumber} ($${newOrder.totalAmount})`,
              }
            : s
        )
      );

      showNotification(
        `¡Pedido ${newOrder.orderNumber} por $${newOrder.totalAmount.toLocaleString()} (${newOrder.totalKg} Kg) tomado exitosamente para ${stop.name}!`
      );
    }
  };

  // Open Visit Registration Modal
  const handleOpenVisitModal = (stop: RouteStop) => {
    setActiveVisitStop(stop);
    setVisitPurpose("Toma de Pedido");
    setVisitOutcome("Pedido Generado");
    setVisitNotes("");
  };

  // Submit Visit Registration
  const handleRegisterVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisitStop) return;

    registerCRMVisit({
      customerId: activeVisitStop.customerId || "prospect",
      customerName: activeVisitStop.name,
      purpose: visitPurpose as any,
      outcome: visitOutcome as any,
      customerSatisfaction: satisfaction as any,
      notes: visitNotes,
    });

    // Mark as visited in the route
    setRouteStops((prev) =>
      prev.map((s) =>
        s.id === activeVisitStop.id
          ? {
              ...s,
              status: "Visitado",
              visitedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              visitOutcome: `${visitPurpose} → ${visitOutcome}`,
            }
          : s
      )
    );

    showNotification(`Visita registrada con éxito para ${activeVisitStop.name}`);
    setActiveVisitStop(null);
    setVisitNotes("");
  };

  // Filtered Route Stops
  const filteredStops = routeStops.filter((s) => {
    if (filterTab === "pending") return s.status === "Pendiente";
    if (filterTab === "visited") return s.status === "Visitado";
    if (filterTab === "customers") return s.type === "customer";
    if (filterTab === "prospects") return s.type === "prospect";
    return true;
  });

  // Filter available customers for modal
  const availableCustomers = customers.filter((c) => {
    const matchQuery =
      c.commercialName.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      c.zone.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(customerSearchTerm.toLowerCase());

    const matchScoring =
      customerScoringFilter === "all" || c.scoring === customerScoringFilter;

    return matchQuery && matchScoring;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 text-[#1A1A1A]">
      {/* Header Banner */}
      <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1A1A1A] text-white font-serif font-black text-lg">
              🛵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl font-bold tracking-tight text-[#1A1A1A]">
                  Mi Día en Ruta <span className="italic font-normal">&amp; Preventa</span>
                </h1>
                <span className="rounded px-2 py-0.5 font-sans text-[9px] uppercase tracking-wider font-semibold bg-[#8E2030]/10 text-[#8E2030] border border-[#8E2030]/20">
                  En vivo
                </span>
              </div>
              <p className="font-sans text-xs text-[#1A1A1A]/60 mt-0.5">
                Preventista: <strong className="text-[#1A1A1A] font-semibold">{currentUser.name}</strong> • Zona CABA Centro / Norte
              </p>
            </div>
          </div>

          {/* Quick Route Management Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddCustomerModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[#1A1A1A]/15 bg-white px-3 py-2 text-xs font-semibold text-[#1A1A1A] shadow-2xs hover:bg-[#F9F7F2] active:scale-98 transition-all"
            >
              <Store className="h-3.5 w-3.5 text-[#8E2030]" />
              <span>+ Agregar Cliente</span>
            </button>

            <button
              onClick={() => setIsAddNewPlaceModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#8E2030] active:scale-98 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Nuevo Lugar / Prospecto</span>
            </button>
          </div>
        </div>

        {/* Daily Stats KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#1A1A1A]/10 font-sans">
          <div className="rounded-lg bg-[#F9F7F2] p-3 border border-[#1A1A1A]/5">
            <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider block font-semibold">Paradas de Hoy</span>
            <span className="font-serif text-xl font-bold text-[#1A1A1A] mt-0.5 block">
              {visitedCount} / {routeStops.length} <span className="text-xs font-normal text-[#1A1A1A]/50">visitadas</span>
            </span>
          </div>
          <div className="rounded-lg bg-[#F9F7F2] p-3 border border-[#1A1A1A]/5">
            <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider block font-semibold">Pedidos Tomados</span>
            <span className="font-serif text-xl font-bold text-[#1A1A1A] mt-0.5 block">{todayOrders.length}</span>
          </div>
          <div className="rounded-lg bg-[#F9F7F2] p-3 border border-[#1A1A1A]/5">
            <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider block font-semibold">Café Vendido</span>
            <span className="font-serif text-xl font-bold text-[#8E2030] mt-0.5 block">{todayKg} Kg</span>
          </div>
          <div className="rounded-lg bg-[#F9F7F2] p-3 border border-[#1A1A1A]/5">
            <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider block font-semibold">Monto Total</span>
            <span className="font-serif text-xl font-bold text-emerald-800 mt-0.5 block">${todayAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {isSuccessMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-900/10 border border-emerald-700/30 p-4 text-emerald-900 font-medium text-xs shadow-2xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
          <span>{isSuccessMessage}</span>
        </div>
      )}

      {/* Today's Route List & Filter Tabs */}
      <div className="space-y-3 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8E2030] flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#8E2030]" />
              Ruta de Visitas ({routeStops.length} Lugares)
            </h2>
            <span className="text-[11px] text-[#1A1A1A]/40">• {pendingCount} pendientes</span>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#1A1A1A]/10 text-xs shadow-2xs">
            {[
              { id: "all", label: `Todas (${routeStops.length})` },
              { id: "pending", label: `Pendientes (${pendingCount})` },
              { id: "visited", label: `Visitadas (${visitedCount})` },
              { id: "prospects", label: `Prospectos (${routeStops.filter((s) => s.type === "prospect").length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  filterTab === tab.id
                    ? "bg-[#1A1A1A] text-white font-semibold shadow-xs"
                    : "text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {filteredStops.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#1A1A1A]/20 bg-white p-8 text-center text-xs text-[#1A1A1A]/60 space-y-3 shadow-2xs">
            <p className="font-serif text-sm font-semibold text-[#1A1A1A]">No hay paradas para este filtro</p>
            <p className="text-[11px] text-[#1A1A1A]/50">
              Puedes agregar nuevos lugares de visita o seleccionar clientes actuales para armar tu recorrido.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setIsAddCustomerModalOpen(true)}
                className="rounded-lg bg-[#1A1A1A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#8E2030]"
              >
                + Agregar Cliente Actual
              </button>
              <button
                onClick={() => setIsAddNewPlaceModalOpen(true)}
                className="rounded-lg border border-[#1A1A1A]/20 px-3.5 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#F9F7F2]"
              >
                + Agregar Nuevo Lugar
              </button>
            </div>
          </div>
        )}

        {/* Stops Cards List */}
        <div className="space-y-3">
          {filteredStops.map((stop, index) => {
            const hasOverdue = (stop.overdueDebt || 0) > 0;
            const hasDrop = (stop.consumptionChangePercent || 0) < -15;
            const isVisited = stop.status === "Visitado";
            const customerObj = stop.customerId ? customers.find((c) => c.id === stop.customerId) : null;

            return (
              <div
                key={stop.id}
                className={`rounded-xl border bg-white p-4 space-y-3 shadow-2xs transition-all ${
                  isVisited
                    ? "border-emerald-700/30 bg-emerald-950/[0.02]"
                    : "border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30"
                }`}
              >
                {/* Header of Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Position and reorder controls */}
                    <div className="flex flex-col items-center gap-0.5">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                          isVisited
                            ? "bg-emerald-700 text-white"
                            : "bg-[#1A1A1A] text-white"
                        }`}
                      >
                        {isVisited ? <Check className="h-3.5 w-3.5" /> : index + 1}
                      </span>
                      <div className="flex flex-col mt-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          title="Mover arriba en el orden de visita"
                          className="p-0.5 text-[#1A1A1A]/30 hover:text-[#1A1A1A] disabled:opacity-20 disabled:hover:text-[#1A1A1A]/30"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === routeStops.length - 1}
                          title="Mover abajo en el orden de visita"
                          className="p-0.5 text-[#1A1A1A]/30 hover:text-[#1A1A1A] disabled:opacity-20 disabled:hover:text-[#1A1A1A]/30"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Place info */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm sm:text-base">
                          {stop.name}
                        </h3>
                        {stop.type === "prospect" ? (
                          <span className="rounded bg-[#8E2030]/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold text-[#8E2030] border border-[#8E2030]/20">
                            PROSPECTO NUEVO
                          </span>
                        ) : (
                          <span className="rounded bg-[#1A1A1A]/5 px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold text-[#1A1A1A]/70">
                            CLIENTE ACTIVO
                          </span>
                        )}
                        {isVisited && (
                          <span className="rounded bg-emerald-900/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold text-emerald-800 border border-emerald-700/30 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                            Visitado {stop.visitedAt ? `(${stop.visitedAt})` : ""}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#1A1A1A]/60 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#1A1A1A]/40 shrink-0" />
                        <span>
                          {stop.address} • <strong>{stop.zone}</strong>
                        </span>
                      </p>

                      {stop.contactName && (
                        <p className="text-[11px] text-[#1A1A1A]/50 flex items-center gap-1.5">
                          <User className="h-3 w-3 text-[#1A1A1A]/40" />
                          <span>
                            Contacto: {stop.contactName} {stop.contactPhone ? `(${stop.contactPhone})` : ""}
                          </span>
                        </p>
                      )}

                      {stop.visitOutcome && (
                        <p className="text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50 inline-block mt-0.5">
                          Resultado: {stop.visitOutcome}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badges & Remove Button */}
                  <div className="flex flex-col items-end gap-1.5">
                    <button
                      onClick={() => handleRemoveStop(stop.id, stop.name)}
                      className="rounded p-1 text-[#1A1A1A]/30 hover:bg-[#8E2030]/10 hover:text-[#8E2030] transition-colors"
                      title="Sacar este lugar de la ruta de hoy"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {stop.scoring && (
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          stop.scoring === "Alto Valor"
                            ? "bg-emerald-900/10 text-emerald-800 border border-emerald-700/30"
                            : stop.scoring === "Riesgo" || stop.scoring === "Riesgo Crítico"
                            ? "bg-[#8E2030]/10 text-[#8E2030] border border-[#8E2030]/30"
                            : "bg-[#1A1A1A]/5 text-[#1A1A1A]/70"
                        }`}
                      >
                        {stop.scoring}
                      </span>
                    )}
                    {stop.avgMonthlyKg && (
                      <p className="text-[10px] text-[#1A1A1A]/50 font-medium">
                        {stop.avgMonthlyKg} Kg/mes prom.
                      </p>
                    )}
                  </div>
                </div>

                {/* Warnings / Alerts for Existing Clients */}
                {(hasOverdue || hasDrop) && (
                  <div className="flex flex-wrap gap-2 text-[10px] pt-1">
                    {hasOverdue && (
                      <span className="rounded bg-[#8E2030]/10 text-[#8E2030] px-2 py-0.5 border border-[#8E2030]/20 font-semibold flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 text-[#8E2030]" />
                        Deuda vencida: ${(stop.overdueDebt || 0).toLocaleString()}
                      </span>
                    )}
                    {hasDrop && (
                      <span className="rounded bg-[#C2823D]/10 text-[#C2823D] px-2 py-0.5 border border-[#C2823D]/20 font-semibold flex items-center gap-1">
                        <TrendingDown className="h-3 w-3 text-[#C2823D]" />
                        Consumo cayó {Math.abs(stop.consumptionChangePercent || 0)}%
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1A1A1A]/10 text-xs">
                  {/* Action 1: Repetir Pedido (or Nuevo Pedido) */}
                  {stop.type === "customer" ? (
                    <button
                      onClick={() => handleQuickRepeatOrder(stop)}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3 py-2 font-semibold text-white shadow-2xs hover:bg-[#8E2030] active:scale-98 transition-all"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-white" />
                      <span>Repetir Pedido</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (stop.customerId) {
                          setOrderModalCustomerId(stop.customerId);
                        } else {
                          alert("Para crear un pedido formal, guarda este lugar como cliente en CRM.");
                        }
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3 py-2 font-semibold text-white shadow-2xs hover:bg-[#8E2030] active:scale-98 transition-all"
                    >
                      <ShoppingBag className="h-3.5 w-3.5 text-white" />
                      <span>Nuevo Pedido</span>
                    </button>
                  )}

                  {/* Action 2: Registrar Visita Detallada */}
                  <button
                    onClick={() => handleOpenVisitModal(stop)}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 font-semibold text-[#1A1A1A] hover:bg-[#F2EFE9] active:scale-98 transition-all"
                  >
                    <Briefcase className="h-3.5 w-3.5 text-[#8E2030]" />
                    <span>Registrar Visita</span>
                  </button>

                  {/* Action 3: Quick Visit Toggle */}
                  <button
                    onClick={() => handleToggleVisited(stop)}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 font-medium transition-all ${
                      isVisited
                        ? "border-emerald-700/30 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        : "border-[#1A1A1A]/15 bg-white text-[#1A1A1A]/70 hover:bg-[#F9F7F2]"
                    }`}
                  >
                    <CheckCircle2 className={`h-3.5 w-3.5 ${isVisited ? "text-emerald-700" : "text-[#1A1A1A]/40"}`} />
                    <span>{isVisited ? "Visitada ✓" : "Marcar Visitada"}</span>
                  </button>

                  {/* Action 4: Ficha 360 */}
                  {customerObj ? (
                    <button
                      onClick={() => setCustomerFor360(customerObj)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-[#1A1A1A]/15 bg-white px-3 py-2 font-medium text-[#1A1A1A]/80 hover:bg-[#F9F7F2] active:scale-98 transition-all"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-[#1A1A1A]/40" />
                      <span>Ficha 360°</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRemoveStop(stop.id, stop.name)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-[#8E2030]/20 bg-white px-3 py-2 font-medium text-[#8E2030] hover:bg-[#8E2030]/5 active:scale-98 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Quitar de Ruta</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: AGREGAR CLIENTE EXISTENTE A LA RUTA */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4 backdrop-blur-xs text-[#1A1A1A]">
          <div className="w-full max-w-2xl rounded-xl border border-[#1A1A1A]/10 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 bg-[#F9F7F2] px-5 py-4">
              <div>
                <span className="font-sans text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8E2030]">
                  Directorio de Cafeterías
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                  Seleccionar Cliente Actual para la Ruta de Visitas
                </h3>
              </div>
              <button
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="rounded-lg p-1.5 text-[#1A1A1A]/40 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search & Filter bar */}
            <div className="p-4 border-b border-[#1A1A1A]/10 bg-[#F9F7F2]/50 space-y-3 font-sans text-xs">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#1A1A1A]/40" />
                <input
                  type="text"
                  autoFocus
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  placeholder="Buscar por cafetería, código, zona (ej: Palermo, Recoleta)..."
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-white pl-9 pr-3 py-2 text-xs text-[#1A1A1A] outline-none shadow-2xs"
                />
              </div>

              {/* Scoring filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <span className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-wider font-semibold mr-1">Filtrar:</span>
                {[
                  { id: "all", label: "Todos los Clientes" },
                  { id: "Riesgo", label: "⚠️ En Riesgo" },
                  { id: "Crecimiento", label: "📈 Crecimiento" },
                  { id: "Alto Valor", label: "⭐ Alto Valor" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCustomerScoringFilter(f.id)}
                    className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                      customerScoringFilter === f.id
                        ? "bg-[#1A1A1A] text-white font-semibold"
                        : "bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar text-xs font-sans">
              {availableCustomers.length === 0 ? (
                <div className="py-8 text-center text-[#1A1A1A]/50">
                  <p className="font-serif">No se encontraron clientes con esos términos.</p>
                </div>
              ) : (
                availableCustomers.map((cust) => {
                  const isAlreadyInRoute = routeStops.some((s) => s.customerId === cust.id);

                  return (
                    <div
                      key={cust.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                        isAlreadyInRoute
                          ? "border-emerald-700/20 bg-emerald-950/[0.02]"
                          : "border-[#1A1A1A]/10 bg-white hover:border-[#1A1A1A]/30 hover:bg-[#F9F7F2]/50 shadow-2xs"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-[#1A1A1A]">
                            {cust.commercialName}
                          </span>
                          <span className="font-mono text-[10px] text-[#1A1A1A]/50">
                            ({cust.code})
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              cust.scoring === "Alto Valor"
                                ? "bg-emerald-900/10 text-emerald-800"
                                : cust.scoring === "Riesgo"
                                ? "bg-[#8E2030]/10 text-[#8E2030]"
                                : "bg-[#1A1A1A]/5 text-[#1A1A1A]/70"
                            }`}
                          >
                            {cust.scoring}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#1A1A1A]/60 flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-[#1A1A1A]/40" />
                          <span>
                            {cust.address} • <strong>{cust.zone}</strong>
                          </span>
                        </p>

                        <p className="text-[10px] text-[#1A1A1A]/50">
                          Consumo prom: <strong>{cust.avgMonthlyKg} Kg/mes</strong> • Saldo cta: ${cust.currentAccountBalance.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isAlreadyInRoute ? (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                            <Check className="h-3.5 w-3.5" />
                            En la Ruta
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddExistingCustomer(cust)}
                            className="flex items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#8E2030] active:scale-98 transition-all"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>+ Agregar a Ruta</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AGREGAR NUEVO LUGAR / PROSPECTO */}
      {isAddNewPlaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4 backdrop-blur-xs text-[#1A1A1A]">
          <div className="w-full max-w-lg rounded-xl border border-[#1A1A1A]/10 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 bg-[#F9F7F2] px-5 py-4">
              <div>
                <span className="font-sans text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8E2030]">
                  Nueva Parada de Prospección
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                  Agregar Nuevo Lugar / Cafetería
                </h3>
              </div>
              <button
                onClick={() => setIsAddNewPlaceModalOpen(false)}
                className="rounded-lg p-1.5 text-[#1A1A1A]/40 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewPlaceSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar font-sans text-xs flex-1">
              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider font-semibold mb-1">
                  Nombre del Local / Cafetería *
                </label>
                <input
                  type="text"
                  required
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  placeholder="Ej: Blend & Co Specialty Coffee"
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider font-semibold mb-1">
                    Dirección Completa *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPlaceAddress}
                    onChange={(e) => setNewPlaceAddress(e.target.value)}
                    placeholder="Ej: Thames 1824"
                    className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider font-semibold mb-1">
                    Zona / Barrio
                  </label>
                  <input
                    type="text"
                    value={newPlaceZone}
                    onChange={(e) => setNewPlaceZone(e.target.value)}
                    placeholder="Ej: Palermo Soho, Belgrano, Recoleta..."
                    className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider font-semibold mb-1">
                    Contacto / Barista / Dueño
                  </label>
                  <input
                    type="text"
                    value={newPlaceContactName}
                    onChange={(e) => setNewPlaceContactName(e.target.value)}
                    placeholder="Ej: Matías (Barista)"
                    className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider font-semibold mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={newPlaceContactPhone}
                    onChange={(e) => setNewPlaceContactPhone(e.target.value)}
                    placeholder="+54 911 5555-1234"
                    className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider font-semibold mb-1">
                  Potencial Estimado (Kg/mes)
                </label>
                <input
                  type="number"
                  value={newPlacePotentialKg}
                  onChange={(e) => setNewPlacePotentialKg(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider font-semibold mb-1">
                  Notas de Prospección / Oportunidad
                </label>
                <textarea
                  rows={2}
                  value={newPlaceNotes}
                  onChange={(e) => setNewPlaceNotes(e.target.value)}
                  placeholder="Cafetería nueva, tienen máquina Sanremo de 2 grupos, les interesa probar perfil tueste medio..."
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                />
              </div>

              {/* Checkbox to also save in CRM */}
              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#1A1A1A]/10 bg-[#F9F7F2] cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAsCRMClient}
                  onChange={(e) => setSaveAsCRMClient(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#1A1A1A]/20 text-[#8E2030] focus:ring-[#8E2030]"
                />
                <div>
                  <span className="font-semibold text-[#1A1A1A] text-xs block">
                    Registrar también en la base general de Clientes / CRM
                  </span>
                  <span className="text-[11px] text-[#1A1A1A]/60 block mt-0.5">
                    Crea automáticamente la ficha de cliente para poder emitir pedidos, remitos y seguimiento comercial.
                  </span>
                </div>
              </label>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1A1A1A]/10">
                <button
                  type="button"
                  onClick={() => setIsAddNewPlaceModalOpen(false)}
                  className="rounded-lg border border-[#1A1A1A]/15 bg-white px-4 py-2 text-xs font-semibold text-[#1A1A1A]/70 hover:bg-[#F2EFE9]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1A1A1A] px-5 py-2 text-xs font-semibold text-white hover:bg-[#8E2030] shadow-2xs active:scale-98 transition-all"
                >
                  + Agregar a la Ruta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTRAR VISITA DETALLADA */}
      {activeVisitStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4 backdrop-blur-xs text-[#1A1A1A]">
          <div className="w-full max-w-md rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <div>
                <span className="font-sans text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8E2030]">
                  Check-in en Calle
                </span>
                <h3 className="font-serif font-bold text-[#1A1A1A] text-base">Registrar Visita Comercial</h3>
                <p className="font-sans text-xs text-[#1A1A1A]/70 font-semibold">{activeVisitStop.name}</p>
              </div>
              <button
                onClick={() => setActiveVisitStop(null)}
                className="text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterVisitSubmit} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1 font-semibold">
                  Motivo de la Visita
                </label>
                <select
                  value={visitPurpose}
                  onChange={(e) => setVisitPurpose(e.target.value)}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] p-2 text-[#1A1A1A] outline-none"
                >
                  <option value="Toma de Pedido">Toma de Pedido</option>
                  <option value="Venta / Prospección">Venta / Prospección</option>
                  <option value="Degustación de Origen">Degustación de Origen / Muestra</option>
                  <option value="Fidelización">Fidelización / Relación Comercial</option>
                  <option value="Cobranza">Cobranza / Gestión de Saldo</option>
                  <option value="Service / Chequeo Máquina">Service / Chequeo Máquina</option>
                  <option value="Reclamo / Calidad">Reclamo / Calidad de Tueste</option>
                </select>
              </div>

              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1 font-semibold">
                  Resultado de la Visita
                </label>
                <select
                  value={visitOutcome}
                  onChange={(e) => setVisitOutcome(e.target.value)}
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] p-2 text-[#1A1A1A] outline-none"
                >
                  <option value="Pedido Generado">Pedido Generado</option>
                  <option value="Compromiso de Compra">Compromiso de Compra</option>
                  <option value="Sin Novedades">Sin Novedades (Stock Lleno)</option>
                  <option value="Seguimiento Requerido">Seguimiento Requerido</option>
                  <option value="Service Requerido">Service Requerido para Máquina</option>
                </select>
              </div>

              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1 font-semibold">
                  Satisfacción del Cliente (1-5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSatisfaction(star)}
                      className={`h-8 w-8 rounded-lg font-bold text-xs transition-all ${
                        satisfaction >= star
                          ? "bg-[#1A1A1A] text-white shadow-2xs"
                          : "bg-[#F9F7F2] text-[#1A1A1A]/40 border border-[#1A1A1A]/10"
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#1A1A1A]/70 text-[10px] uppercase tracking-wider mb-1 font-semibold">
                  Notas / Observaciones del Barista o Dueño *
                </label>
                <textarea
                  rows={3}
                  required
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  placeholder="Detalle de la conversación, comentarios sobre el blend, molienda o fecha estimada del próximo pedido..."
                  className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] p-2 text-[#1A1A1A] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1A1A1A]/10">
                <button
                  type="button"
                  onClick={() => setActiveVisitStop(null)}
                  className="rounded-lg border border-[#1A1A1A]/15 bg-white px-3.5 py-1.5 text-xs text-[#1A1A1A]/70 hover:bg-[#F2EFE9]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1A1A1A] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#8E2030] shadow-2xs"
                >
                  Guardar Visita &amp; Completar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CUSTOMER 360 PROFILE */}
      {customerFor360 && (
        <Customer360Modal
          customer={customerFor360}
          onClose={() => setCustomerFor360(null)}
        />
      )}

      {/* MODAL 5: NEW ORDER MODAL */}
      {orderModalCustomerId && (
        <NewOrderModal
          initialCustomerId={orderModalCustomerId}
          onClose={() => setOrderModalCustomerId(null)}
        />
      )}
    </div>
  );
};

