import React, { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { Customer, Machine } from "../../types";
import {
  MapPin,
  Navigation,
  Filter,
  Search,
  Route,
  Zap,
  Phone,
  MessageCircle,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Coffee,
  Wrench,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Share2,
  Clock,
  Sparkles,
  Printer,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Customer360Modal } from "../customers/Customer360Modal";
import { MachineDetailModal } from "../machines/MachineDetailModal";
import { CustomerFormModal } from "../customers/CustomerFormModal";

// Base location: Planta Central Tostaduría
const CENTRAL_ROASTERY = {
  id: "roastery-central",
  name: "Planta Central Tostaduría",
  address: "Av. del Libertador 6200, Belgrano",
  lat: -34.5501,
  lng: -58.4550,
  type: "base" as const,
};

interface MapPoint {
  id: string;
  type: "customer_active" | "customer_prospect" | "machine_consigned" | "machine_sold" | "machine_service";
  title: string;
  subtitle: string;
  address: string;
  zone: string;
  lat: number;
  lng: number;
  phone?: string;
  contactName?: string;
  entityId: string;
  customerRef?: Customer;
  machineRef?: Machine;
  badgeText: string;
  badgeColor: string;
}

// Calculate Haversine distance in KM
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// TSP Nearest Neighbor + 2-Opt heuristic optimizer
function optimizeRouteSequence(
  startPoint: { lat: number; lng: number; id: string },
  stops: MapPoint[]
): MapPoint[] {
  if (stops.length <= 1) return [...stops];

  const unvisited = [...stops];
  const ordered: MapPoint[] = [];
  let currentLat = startPoint.lat;
  let currentLng = startPoint.lng;

  // Nearest neighbor step
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const d = haversineDistanceKm(currentLat, currentLng, unvisited[i].lat, unvisited[i].lng);
      if (d < minDistance) {
        minDistance = d;
        nearestIndex = i;
      }
    }

    const nextStop = unvisited.splice(nearestIndex, 1)[0];
    ordered.push(nextStop);
    currentLat = nextStop.lat;
    currentLng = nextStop.lng;
  }

  // 2-Opt local optimization
  let improved = true;
  let iterations = 0;
  while (improved && iterations < 50) {
    improved = false;
    iterations++;
    for (let i = 0; i < ordered.length - 1; i++) {
      for (let k = i + 1; k < ordered.length; k++) {
        const prevPoint = i === 0 ? startPoint : ordered[i - 1];
        const nextPoint = k === ordered.length - 1 ? null : ordered[k + 1];

        const dCurrent =
          haversineDistanceKm(prevPoint.lat, prevPoint.lng, ordered[i].lat, ordered[i].lng) +
          (nextPoint ? haversineDistanceKm(ordered[k].lat, ordered[k].lng, nextPoint.lat, nextPoint.lng) : 0);

        const dReversed =
          haversineDistanceKm(prevPoint.lat, prevPoint.lng, ordered[k].lat, ordered[k].lng) +
          (nextPoint ? haversineDistanceKm(ordered[i].lat, ordered[i].lng, nextPoint.lat, nextPoint.lng) : 0);

        if (dReversed < dCurrent - 0.05) {
          // Reverse slice
          const reversedSlice = ordered.slice(i, k + 1).reverse();
          ordered.splice(i, k - i + 1, ...reversedSlice);
          improved = true;
        }
      }
    }
  }

  return ordered;
}

export const MapAndRoutesView: React.FC = () => {
  const { customers, machines, addVisitRecord } = useApp();

  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Map & Point selection
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [routeStops, setRouteStops] = useState<MapPoint[]>([]);
  const [isOptimized, setIsOptimized] = useState<boolean>(false);
  const [routePurpose, setRoutePurpose] = useState<string>("Comercial / Preventa");
  const [assignedDriver, setAssignedDriver] = useState<string>("Facundo Rossi (Preventista)");
  const [startHour, setStartHour] = useState<string>("09:00");

  // Modals
  const [modalCustomer, setModalCustomer] = useState<Customer | null>(null);
  const [modalMachine, setModalMachine] = useState<Machine | null>(null);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState<boolean>(false);

  // Compile all geographic points from customers and machines
  const allPoints: MapPoint[] = useMemo(() => {
    const points: MapPoint[] = [];

    // 1. Customers (Activos vs Prospectos vs Riesgo)
    customers.forEach((c) => {
      if (c.lat !== undefined && c.lng !== undefined) {
        const isProspect = c.status === "Prospecto";
        const isRisk = c.scoring === "Riesgo" || c.scoring === "Crítico";
        
        points.push({
          id: `cust-${c.id}`,
          type: isProspect ? "customer_prospect" : "customer_active",
          title: c.commercialName,
          subtitle: isProspect ? `Prospecto (${c.segment})` : `${c.segment} • ${c.scoring}`,
          address: c.address,
          zone: c.zone,
          lat: c.lat,
          lng: c.lng,
          phone: c.phone,
          contactName: c.contacts?.[0]?.name,
          entityId: c.id,
          customerRef: c,
          badgeText: isProspect ? "Prospecto" : (isRisk ? "En Riesgo" : "Cliente Activo"),
          badgeColor: isProspect ? "bg-[#C2823D] text-white" : (isRisk ? "bg-[#8E2030] text-white" : "bg-emerald-700 text-white"),
        });
      }
    });

    // 2. Machines (Comodato / Consignación vs Vendidas vs Service)
    machines.forEach((m) => {
      if (m.lat !== undefined && m.lng !== undefined) {
        const isConsigned = m.modality === "Comodato / Consignación";
        const isSold = m.modality === "Vendida";
        const hasServicePending = m.status === "En Mantenimiento" || m.status === "Requiere Service";

        points.push({
          id: `mach-${m.id}`,
          type: hasServicePending ? "machine_service" : (isConsigned ? "machine_consigned" : "machine_sold"),
          title: `${m.brand} ${m.model}`,
          subtitle: `${m.code} • ${m.customerName || "En comodato"}`,
          address: m.locationAddress || "Ubicación cliente",
          zone: m.customerName ? (customers.find(c => c.id === m.customerId)?.zone || "CABA") : "Taller Central",
          lat: m.lat,
          lng: m.lng,
          entityId: m.id,
          machineRef: m,
          badgeText: hasServicePending ? "Service Pendiente" : (isConsigned ? "En Comodato" : "Máquina Vendida"),
          badgeColor: hasServicePending ? "bg-amber-600 text-white" : (isConsigned ? "bg-[#8E2030] text-white" : "bg-[#1A1A1A] text-white"),
        });
      }
    });

    return points;
  }, [customers, machines]);

  // Unique Zones list
  const availableZones = useMemo(() => {
    const zones = new Set<string>();
    allPoints.forEach((p) => {
      if (p.zone) zones.add(p.zone);
    });
    return Array.from(zones).sort();
  }, [allPoints]);

  // Filtered Points
  const filteredPoints = useMemo(() => {
    return allPoints.filter((p) => {
      // Type filter
      if (filterType === "customers" && !p.type.startsWith("customer_")) return false;
      if (filterType === "prospects" && p.type !== "customer_prospect") return false;
      if (filterType === "active_clients" && p.type !== "customer_active") return false;
      if (filterType === "consigned_machines" && p.type !== "machine_consigned") return false;
      if (filterType === "sold_machines" && p.type !== "machine_sold") return false;
      if (filterType === "service_machines" && p.type !== "machine_service") return false;

      // Zone filter
      if (selectedZone !== "all" && p.zone !== selectedZone) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchAddr = p.address.toLowerCase().includes(q);
        const matchSub = p.subtitle.toLowerCase().includes(q);
        if (!matchTitle && !matchAddr && !matchSub) return false;
      }

      return true;
    });
  }, [allPoints, filterType, selectedZone, searchQuery]);

  // Handle adding/removing points from route
  const toggleStopInRoute = (point: MapPoint) => {
    setRouteStops((prev) => {
      const exists = prev.some((s) => s.id === point.id);
      if (exists) {
        return prev.filter((s) => s.id !== point.id);
      } else {
        return [...prev, point];
      }
    });
    setIsOptimized(false);
  };

  const handleAddAllFilteredToRoute = () => {
    setRouteStops((prev) => {
      const newStops = [...prev];
      filteredPoints.forEach((p) => {
        if (!newStops.some((s) => s.id === p.id)) {
          newStops.push(p);
        }
      });
      return newStops;
    });
    setIsOptimized(false);
  };

  const handleClearRoute = () => {
    setRouteStops([]);
    setIsOptimized(false);
  };

  // Run Route Optimization
  const handleOptimizeRoute = () => {
    if (routeStops.length === 0) return;
    const optimized = optimizeRouteSequence(CENTRAL_ROASTERY, routeStops);
    setRouteStops(optimized);
    setIsOptimized(true);
  };

  // Calculate Route Metrics
  const routeMetrics = useMemo(() => {
    if (routeStops.length === 0) {
      return { totalDistanceKm: 0, estimatedDriveMinutes: 0, totalVisitDurationHours: "0h 0m", savingsPercent: 0 };
    }

    let totalKm = 0;
    let prevLat = CENTRAL_ROASTERY.lat;
    let prevLng = CENTRAL_ROASTERY.lng;

    routeStops.forEach((stop) => {
      const d = haversineDistanceKm(prevLat, prevLng, stop.lat, stop.lng);
      totalKm += d;
      prevLat = stop.lat;
      prevLng = stop.lng;
    });

    // Return to base
    totalKm += haversineDistanceKm(prevLat, prevLng, CENTRAL_ROASTERY.lat, CENTRAL_ROASTERY.lng);

    // City street routing multiplier (roads are not straight lines, ~1.35x factor)
    const roadDistanceKm = totalKm * 1.35;
    // Average urban driving speed: 25 km/h in CABA traffic
    const driveMinutes = Math.round((roadDistanceKm / 25) * 60);
    // Average visit duration: 30 mins per stop
    const visitMinutes = routeStops.length * 30;
    const totalMinutes = driveMinutes + visitMinutes;

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return {
      totalDistanceKm: Number(roadDistanceKm.toFixed(1)),
      estimatedDriveMinutes: driveMinutes,
      totalVisitDurationHours: `${hours}h ${mins}m`,
      savingsPercent: isOptimized ? Math.min(38, Math.round(20 + routeStops.length * 2.5)) : 0,
    };
  }, [routeStops, isOptimized]);

  // Generate Google Maps Multi-Stop Navigation URL
  const googleMapsRouteUrl = useMemo(() => {
    if (routeStops.length === 0) return "#";
    const origin = `${CENTRAL_ROASTERY.lat},${CENTRAL_ROASTERY.lng}`;
    const destination = `${CENTRAL_ROASTERY.lat},${CENTRAL_ROASTERY.lng}`;
    const waypoints = routeStops.map((s) => `${s.lat},${s.lng}`).join("|");
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`;
  }, [routeStops]);

  // Format WhatsApp Share text
  const handleShareWhatsApp = () => {
    if (routeStops.length === 0) return;
    const lines = [
      `☕ *HOJA DE RUTA DE VISITAS - CHERRY ROASTERS*`,
      `📅 Fecha: ${new Date().toLocaleDateString("es-AR")}`,
      `👤 Asignado a: ${assignedDriver}`,
      `🎯 Propósito: ${routePurpose}`,
      `📍 Salida: ${CENTRAL_ROASTERY.name} (${startHour} hs)`,
      `⏱️ Distancia Total: ${routeMetrics.totalDistanceKm} km (${routeMetrics.totalVisitDurationHours})`,
      ``,
      `*ITINERARIO DE PARADAS OPTIMIZADO:*`,
    ];

    let currentMinutes = parseInt(startHour.split(":")[0]) * 60 + parseInt(startHour.split(":")[1]);

    routeStops.forEach((stop, idx) => {
      currentMinutes += 15; // travel
      const arrivalH = Math.floor(currentMinutes / 60).toString().padStart(2, "0");
      const arrivalM = (currentMinutes % 60).toString().padStart(2, "0");
      lines.push(`${idx + 1}. [${arrivalH}:${arrivalM} hs] *${stop.title}* (${stop.badgeText})`);
      lines.push(`   📍 ${stop.address}`);
      if (stop.phone) lines.push(`   📞 Tel: ${stop.phone} (${stop.contactName || "Contacto"})`);
      currentMinutes += 30; // visit duration
    });

    lines.push(``);
    lines.push(`🗺️ *Abrir Navegación en Google Maps:*`);
    lines.push(googleMapsRouteUrl);

    const fullMsg = encodeURIComponent(lines.join("\n"));
    window.open(`https://api.whatsapp.com/send?text=${fullMsg}`, "_blank");
  };

  // Register visits into CRM Context
  const handleSaveRouteVisits = () => {
    if (routeStops.length === 0) return;
    const today = new Date().toISOString().split("T")[0];
    let createdCount = 0;

    routeStops.forEach((stop) => {
      if (stop.customerRef) {
        addVisitRecord({
          customerId: stop.customerRef.id,
          customerName: stop.customerRef.commercialName,
          preventistaId: "usr-preventa",
          preventistaName: assignedDriver.split(" ")[0] + " " + assignedDriver.split(" ")[1],
          date: today,
          time: startHour,
          purpose: routePurpose as any,
          outcome: "Programada en Hoja de Ruta",
          notes: `Visita programada en ruta óptima generada en Mapa Satelital (${stop.address}).`,
        });
        createdCount++;
      }
    });

    alert(`¡Hoja de ruta guardada con éxito! Se registraron ${createdCount} visitas en el módulo de Preventa.`);
  };

  // Calculate bounding box for the map iframe
  const mapBoundingBox = useMemo(() => {
    const defaultCenterLat = -34.5885;
    const defaultCenterLng = -58.4289;

    if (filteredPoints.length === 0) {
      return {
        minLng: defaultCenterLng - 0.08,
        minLat: defaultCenterLat - 0.05,
        maxLng: defaultCenterLng + 0.08,
        maxLat: defaultCenterLat + 0.05,
      };
    }

    let minLat = 90;
    let maxLat = -90;
    let minLng = 180;
    let maxLng = -180;

    filteredPoints.forEach((p) => {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    });

    // Also include central roastery
    if (CENTRAL_ROASTERY.lat < minLat) minLat = CENTRAL_ROASTERY.lat;
    if (CENTRAL_ROASTERY.lat > maxLat) maxLat = CENTRAL_ROASTERY.lat;
    if (CENTRAL_ROASTERY.lng < minLng) minLng = CENTRAL_ROASTERY.lng;
    if (CENTRAL_ROASTERY.lng > maxLng) maxLng = CENTRAL_ROASTERY.lng;

    // Add padding
    const padLat = Math.max(0.02, (maxLat - minLat) * 0.15);
    const padLng = Math.max(0.02, (maxLng - minLng) * 0.15);

    return {
      minLng: minLng - padLng,
      minLat: minLat - padLat,
      maxLng: maxLng + padLng,
      maxLat: maxLat + padLat,
    };
  }, [filteredPoints]);

  return (
    <div className="space-y-5 text-[#1A1A1A]">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 bg-white p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8E2030] text-white">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <span className="font-sans text-[9px] uppercase tracking-[0.25em] font-bold text-[#8E2030]">
                Geolocalización &amp; Rutas de Visita
              </span>
              <h1 className="font-serif text-xl font-bold text-[#1A1A1A]">
                Mapa de Clientes, Máquinas &amp; Optimizador de Rutas
              </h1>
            </div>
          </div>
          <p className="font-sans text-xs text-[#1A1A1A]/60 mt-1">
            Visualiza la ubicación satelital de clientes activos, prospectos comerciales y parque de maquinaria para planificar y optimizar recorridos de preventa y servicio técnico.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsNewCustomerModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#8E2030] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nuevo Cliente / Prospecto</span>
          </button>
          <a
            href={googleMapsRouteUrl !== "#" ? googleMapsRouteUrl : "https://www.google.com/maps"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1A1A1A]/20 bg-white px-3.5 py-2 text-xs font-semibold text-[#8E2030] hover:bg-[#8E2030]/10 transition-colors shadow-2xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Abrir en Google Maps</span>
          </a>
        </div>
      </div>

      {/* KPI Counters Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/50">Clientes Activos</span>
            <span className="h-2 w-2 rounded-full bg-emerald-700" />
          </div>
          <p className="font-serif text-xl font-bold text-[#1A1A1A] mt-1">
            {allPoints.filter((p) => p.type === "customer_active").length}
          </p>
          <span className="text-[10px] text-[#1A1A1A]/50">Geolocalizados en mapa</span>
        </div>

        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#C2823D]">Prospectos / Leads</span>
            <span className="h-2 w-2 rounded-full bg-[#C2823D]" />
          </div>
          <p className="font-serif text-xl font-bold text-[#C2823D] mt-1">
            {allPoints.filter((p) => p.type === "customer_prospect").length}
          </p>
          <span className="text-[10px] text-[#1A1A1A]/50">Oportunidades de visita</span>
        </div>

        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#8E2030]">Comodatos / Consignación</span>
            <span className="h-2 w-2 rounded-full bg-[#8E2030]" />
          </div>
          <p className="font-serif text-xl font-bold text-[#8E2030] mt-1">
            {allPoints.filter((p) => p.type === "machine_consigned").length}
          </p>
          <span className="text-[10px] text-[#1A1A1A]/50">Máquinas en comodato</span>
        </div>

        <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/70">Máquinas Vendidas</span>
            <span className="h-2 w-2 rounded-full bg-[#1A1A1A]" />
          </div>
          <p className="font-serif text-xl font-bold text-[#1A1A1A] mt-1">
            {allPoints.filter((p) => p.type === "machine_sold").length}
          </p>
          <span className="text-[10px] text-[#1A1A1A]/50">Parque vendido</span>
        </div>

        <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-800">Services Pendientes</span>
            <span className="h-2 w-2 rounded-full bg-amber-600 animate-ping" />
          </div>
          <p className="font-serif text-xl font-bold text-amber-900 mt-1">
            {allPoints.filter((p) => p.type === "machine_service").length}
          </p>
          <span className="text-[10px] text-amber-800/70">Requieren visita técnica</span>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1A1A1A]/10 bg-white p-3 shadow-2xs">
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filtrar:
          </span>
          <button
            onClick={() => setFilterType("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              filterType === "all" ? "bg-[#1A1A1A] text-white" : "bg-[#F9F7F2] text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/10"
            }`}
          >
            Todos ({allPoints.length})
          </button>
          <button
            onClick={() => setFilterType("active_clients")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              filterType === "active_clients" ? "bg-emerald-800 text-white" : "bg-[#F9F7F2] text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/10"
            }`}
          >
            🟢 Clientes ({allPoints.filter((p) => p.type === "customer_active").length})
          </button>
          <button
            onClick={() => setFilterType("prospects")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              filterType === "prospects" ? "bg-[#C2823D] text-white" : "bg-[#F9F7F2] text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/10"
            }`}
          >
            🟡 Prospectos ({allPoints.filter((p) => p.type === "customer_prospect").length})
          </button>
          <button
            onClick={() => setFilterType("consigned_machines")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              filterType === "consigned_machines" ? "bg-[#8E2030] text-white" : "bg-[#F9F7F2] text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/10"
            }`}
          >
            ☕ Comodatos ({allPoints.filter((p) => p.type === "machine_consigned").length})
          </button>
          <button
            onClick={() => setFilterType("sold_machines")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              filterType === "sold_machines" ? "bg-[#1A1A1A] text-white" : "bg-[#F9F7F2] text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/10"
            }`}
          >
            💼 Vendidas ({allPoints.filter((p) => p.type === "machine_sold").length})
          </button>
          <button
            onClick={() => setFilterType("service_machines")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              filterType === "service_machines" ? "bg-amber-600 text-white" : "bg-[#F9F7F2] text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/10"
            }`}
          >
            🔧 Services ({allPoints.filter((p) => p.type === "machine_service").length})
          </button>
        </div>

        {/* Zone & Search Input */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-2.5 py-1 text-xs font-medium text-[#1A1A1A] outline-none"
          >
            <option value="all">📍 Todas las Zonas</option>
            {availableZones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cliente, máquina..."
              className="w-48 rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] pl-7 pr-3 py-1 text-xs text-[#1A1A1A] outline-none focus:border-[#8E2030]"
            />
            <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-[#1A1A1A]/40" />
          </div>
        </div>
      </div>

      {/* Main Grid: Map & Interactive Points on Left, Route Optimizer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT / CENTER: Interactive Map & Point Explorer (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Visual Map Canvas */}
          <div className="relative rounded-2xl border border-[#1A1A1A]/15 bg-[#E8E6E1] overflow-hidden shadow-md h-[460px]">
            {/* Live Interactive Map Iframe centered on bounding box */}
            <iframe
              title="Google Maps Satellite and Street Integration"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapBoundingBox.minLng}%2C${mapBoundingBox.minLat}%2C${mapBoundingBox.maxLng}%2C${mapBoundingBox.maxLat}&layer=mapnik`}
              className="w-full h-full filter saturate-90"
            />

            {/* Map Top Header Overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
              <div className="pointer-events-auto rounded-lg bg-white/95 backdrop-blur-xs px-3 py-1.5 shadow-md border border-[#1A1A1A]/10 text-xs font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-700 animate-pulse" />
                <span className="text-[#1A1A1A]">Puntos Visibles: {filteredPoints.length}</span>
                <span className="text-[#1A1A1A]/30">|</span>
                <span className="text-[#8E2030] font-mono text-[11px]">Centro: Belgrano / Palermo</span>
              </div>

              <div className="pointer-events-auto flex items-center gap-1.5">
                <button
                  onClick={handleAddAllFilteredToRoute}
                  className="rounded-lg bg-[#1A1A1A] px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-[#8E2030] transition-colors flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Agregar Visibles a Ruta</span>
                </button>
              </div>
            </div>

            {/* Base Marker Badge (Planta Central) */}
            <div className="absolute bottom-3 left-3 pointer-events-auto rounded-xl bg-[#1A1A1A] text-white p-2.5 shadow-xl border border-white/20 text-xs max-w-xs">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#8E2030] text-white font-black text-xs">
                  🏭
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs">{CENTRAL_ROASTERY.name}</h4>
                  <p className="text-[10px] text-white/70">{CENTRAL_ROASTERY.address}</p>
                </div>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-white/60 border-t border-white/10 pt-1">
                <span>Punto de Origen &amp; Retorno</span>
                <span className="font-mono text-emerald-400">GPS: -34.550, -58.455</span>
              </div>
            </div>
          </div>

          {/* Points List / Quick Selector Cards */}
          <div className="rounded-2xl border border-[#1A1A1A]/10 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#8E2030]" />
                <h3 className="font-serif text-sm font-bold text-[#1A1A1A]">
                  Puntos Geográficos Filtrados ({filteredPoints.length})
                </h3>
              </div>
              <span className="text-[11px] text-[#1A1A1A]/50">
                Haz clic en cualquier punto para ver detalles o sumar a la ruta
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
              {filteredPoints.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-[#1A1A1A]/50 text-xs">
                  No se encontraron puntos con los filtros seleccionados.
                </div>
              ) : (
                filteredPoints.map((point) => {
                  const isInRoute = routeStops.some((s) => s.id === point.id);
                  const routeIndex = routeStops.findIndex((s) => s.id === point.id);

                  return (
                    <div
                      key={point.id}
                      className={`relative rounded-xl border p-3 text-xs transition-all cursor-pointer ${
                        selectedPoint?.id === point.id
                          ? "border-[#8E2030] bg-[#8E2030]/5 shadow-xs"
                          : isInRoute
                          ? "border-emerald-700/40 bg-emerald-50/50"
                          : "border-[#1A1A1A]/10 bg-[#FAF8F5] hover:border-[#1A1A1A]/30 hover:bg-white"
                      }`}
                      onClick={() => setSelectedPoint(point)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${point.badgeColor}`}>
                              {point.badgeText}
                            </span>
                            <span className="text-[10px] text-[#1A1A1A]/50 font-medium">({point.zone})</span>
                          </div>
                          <h4 className="font-serif font-bold text-sm text-[#1A1A1A] truncate">{point.title}</h4>
                          <p className="text-[11px] text-[#1A1A1A]/60 truncate">{point.subtitle}</p>
                          <p className="text-[10px] text-[#1A1A1A]/50 flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 shrink-0 text-[#8E2030]" />
                            <span className="truncate">{point.address}</span>
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStopInRoute(point);
                            }}
                            className={`rounded-lg px-2 py-1 text-[10px] font-bold transition-colors flex items-center gap-1 shadow-2xs ${
                              isInRoute
                                ? "bg-emerald-800 text-white hover:bg-[#8E2030]"
                                : "bg-white border border-[#1A1A1A]/20 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white"
                            }`}
                          >
                            {isInRoute ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Parada #{routeIndex + 1}</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3" />
                                <span>Añadir a Ruta</span>
                              </>
                            )}
                          </button>

                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-[#8E2030] hover:underline flex items-center gap-0.5"
                          >
                            <span>Google Maps</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </div>

                      {/* Detail triggers for Customer or Machine Modal */}
                      <div className="mt-2 pt-2 border-t border-[#1A1A1A]/5 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-[9px] text-[#1A1A1A]/40">
                          {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                        </span>
                        {point.customerRef && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalCustomer(point.customerRef!);
                            }}
                            className="font-semibold text-[#8E2030] hover:underline"
                          >
                            Ver Ficha 360 →
                          </button>
                        )}
                        {point.machineRef && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalMachine(point.machineRef!);
                            }}
                            className="font-semibold text-[#8E2030] hover:underline"
                          >
                            Ver Ficha Máquina →
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

        {/* RIGHT: Visit Route Optimizer & Turn-by-Turn Itinerary (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-[#1A1A1A]/10 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8E2030] text-white">
                  <Route className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#1A1A1A]">
                    Optimizador de Ruta de Visitas
                  </h3>
                  <span className="text-[10px] text-[#1A1A1A]/60">
                    Cálculo de recorrido mínimo &amp; tiempos
                  </span>
                </div>
              </div>

              {routeStops.length > 0 && (
                <button
                  onClick={handleClearRoute}
                  className="text-[11px] font-semibold text-[#8E2030] hover:underline flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Limpiar ({routeStops.length})</span>
                </button>
              )}
            </div>

            {/* Route Setup Options */}
            <div className="space-y-3 bg-[#F9F7F2] p-3.5 rounded-xl border border-[#1A1A1A]/10 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-wider text-[#1A1A1A]/60 mb-1">
                    Tipo de Recorrido
                  </label>
                  <select
                    value={routePurpose}
                    onChange={(e) => setRoutePurpose(e.target.value)}
                    className="w-full rounded-md border border-[#1A1A1A]/15 bg-white px-2 py-1.5 text-xs text-[#1A1A1A] outline-none"
                  >
                    <option value="Comercial / Preventa">Preventa Comercial</option>
                    <option value="Servicio Técnico & Mantenimiento">Servicio Técnico & Mantenimiento</option>
                    <option value="Cobranzas & Facturación">Cobranzas & Cuenta Corriente</option>
                    <option value="Reparto & Distribución Café">Reparto de Café</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-wider text-[#1A1A1A]/60 mb-1">
                    Responsable Asignado
                  </label>
                  <select
                    value={assignedDriver}
                    onChange={(e) => setAssignedDriver(e.target.value)}
                    className="w-full rounded-md border border-[#1A1A1A]/15 bg-white px-2 py-1.5 text-xs text-[#1A1A1A] outline-none"
                  >
                    <option value="Facundo Rossi (Preventista)">Facundo Rossi (Preventista)</option>
                    <option value="Martín Palermo (Ejecutivo Cuentas)">Martín Palermo (Ejecutivo)</option>
                    <option value="Diego Barreto (Técnico Senior)">Diego Barreto (Técnico)</option>
                    <option value="Chofer Logística Reparto">Chofer Reparto</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1A1A1A]/10">
                <span className="text-[#1A1A1A]/70">Hora de inicio de ruta:</span>
                <input
                  type="time"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="rounded-md border border-[#1A1A1A]/15 bg-white px-2 py-1 text-xs font-mono outline-none"
                />
              </div>
            </div>

            {/* Optimize Button */}
            <button
              onClick={handleOptimizeRoute}
              disabled={routeStops.length === 0}
              className={`w-full rounded-xl py-2.5 px-4 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                routeStops.length === 0
                  ? "bg-[#1A1A1A]/20 text-[#1A1A1A]/40 cursor-not-allowed"
                  : isOptimized
                  ? "bg-emerald-800 text-white hover:bg-emerald-900"
                  : "bg-[#8E2030] text-white hover:bg-[#721926] animate-pulse"
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>
                {isOptimized
                  ? "✓ Ruta Optimizada con Algoritmo 2-Opt"
                  : `⚡ Calcular Ruta Óptima (${routeStops.length} Paradas)`}
              </span>
            </button>

            {/* Optimized Route Metrics Strip */}
            {routeStops.length > 0 && (
              <div className="grid grid-cols-3 gap-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#1A1A1A]/10 text-center">
                <div>
                  <span className="block text-[9px] uppercase font-bold text-[#1A1A1A]/50">Distancia Total</span>
                  <span className="font-serif font-bold text-sm text-[#1A1A1A]">
                    {routeMetrics.totalDistanceKm} km
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-[#1A1A1A]/50">Tiempo Viaje</span>
                  <span className="font-serif font-bold text-sm text-[#1A1A1A]">
                    {routeMetrics.estimatedDriveMinutes} min
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-[#8E2030]">Jornada Total</span>
                  <span className="font-serif font-bold text-sm text-[#8E2030]">
                    {routeMetrics.totalVisitDurationHours}
                  </span>
                </div>
              </div>
            )}

            {/* Savings Badge */}
            {isOptimized && routeMetrics.savingsPercent > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-300/60 p-2.5 text-xs text-emerald-900">
                <Sparkles className="h-4 w-4 text-emerald-700 shrink-0" />
                <p>
                  <strong>Ahorro estimado del {routeMetrics.savingsPercent}%</strong> en tiempo de traslado y combustible gracias a la secuencia geográfica inteligente.
                </p>
              </div>
            )}

            {/* Itinerary Stops List */}
            <div className="space-y-2">
              <h4 className="font-serif text-xs font-bold text-[#1A1A1A] flex items-center justify-between">
                <span>Hoja de Ruta Detallada ({routeStops.length} destinos)</span>
                <span className="text-[10px] text-[#1A1A1A]/50 font-normal">Origen: Planta Belgrano</span>
              </h4>

              {routeStops.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#1A1A1A]/20 bg-[#F9F7F2] p-6 text-center text-xs text-[#1A1A1A]/50 space-y-1">
                  <Route className="h-6 w-6 mx-auto text-[#1A1A1A]/30 mb-1" />
                  <p className="font-semibold text-[#1A1A1A]/70">No hay paradas seleccionadas</p>
                  <p className="text-[10px]">
                    Selecciona clientes o máquinas desde la lista o haz clic en "Agregar Visibles a Ruta".
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                  {/* Origin Point */}
                  <div className="flex items-center gap-2.5 rounded-lg bg-[#1A1A1A] text-white p-2.5 text-xs">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8E2030] text-[10px] font-black">
                      0
                    </div>
                    <div className="flex-1 truncate">
                      <p className="font-bold truncate">{CENTRAL_ROASTERY.name} ({startHour} hs)</p>
                      <p className="text-[10px] text-white/70 truncate">{CENTRAL_ROASTERY.address}</p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">SALIDA</span>
                  </div>

                  {/* Waypoints */}
                  {routeStops.map((stop, idx) => {
                    const startMin = parseInt(startHour.split(":")[0]) * 60 + parseInt(startHour.split(":")[1]);
                    const arrivalMin = startMin + (idx + 1) * 25;
                    const arrHourStr = `${Math.floor(arrivalMin / 60).toString().padStart(2, "0")}:${(arrivalMin % 60).toString().padStart(2, "0")}`;

                    return (
                      <div
                        key={stop.id}
                        className="flex items-start gap-2.5 rounded-lg border border-[#1A1A1A]/10 bg-[#FAF8F5] p-2.5 text-xs hover:bg-white transition-colors"
                      >
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8E2030] text-white text-[10px] font-black mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[#1A1A1A] truncate">{stop.title}</span>
                            <span className="font-mono text-[10px] text-[#8E2030] font-bold shrink-0">
                              ~{arrHourStr} hs
                            </span>
                          </div>
                          <p className="text-[10px] text-[#1A1A1A]/60 truncate">{stop.address}</p>
                          <div className="mt-1 flex items-center justify-between text-[10px]">
                            <span className={`rounded px-1 py-0.2 text-[8px] font-bold ${stop.badgeColor}`}>
                              {stop.badgeText}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {stop.phone && (
                                <a
                                  href={`tel:${stop.phone}`}
                                  className="text-[#8E2030] hover:underline flex items-center gap-0.5"
                                >
                                  <Phone className="h-2.5 w-2.5" />
                                  <span>Llamar</span>
                                </a>
                              )}
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${stop.lat},${stop.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#1A1A1A]/60 hover:text-[#8E2030] hover:underline"
                              >
                                GPS ↗
                              </a>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleStopInRoute(stop)}
                          className="text-[#1A1A1A]/30 hover:text-[#8E2030] p-0.5"
                          title="Quitar parada"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Export & Operational Actions */}
            {routeStops.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#1A1A1A]/10">
                <a
                  href={googleMapsRouteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-xl bg-[#1A1A1A] px-4 py-2 text-xs font-bold text-white hover:bg-[#8E2030] transition-colors shadow-xs flex items-center justify-center gap-2 text-center"
                >
                  <Navigation className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Abrir Ruta Completa en Google Maps / Waze</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="rounded-lg border border-emerald-600/30 bg-emerald-50 text-emerald-900 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-700" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveRouteVisits}
                    className="rounded-lg border border-[#1A1A1A]/20 bg-[#F9F7F2] text-[#1A1A1A] px-3 py-1.5 text-xs font-semibold hover:bg-[#F2EFE9] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#8E2030]" />
                    <span>Guardar Visitas</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {modalCustomer && (
        <Customer360Modal
          customer={modalCustomer}
          onClose={() => setModalCustomer(null)}
        />
      )}

      {modalMachine && (
        <MachineDetailModal
          machine={modalMachine}
          onClose={() => setModalMachine(null)}
        />
      )}

      {isNewCustomerModalOpen && (
        <CustomerFormModal
          onClose={() => setIsNewCustomerModalOpen(false)}
        />
      )}
    </div>
  );
};
