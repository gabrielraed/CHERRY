export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN_EMPRESA"
  | "GERENTE"
  | "VENTAS"
  | "PREVENTISTA"
  | "PRODUCCION"
  | "LOGISTICA"
  | "ADMINISTRACION"
  | "SERVICIO_TECNICO"
  | "CLIENTE";

export interface Organization {
  id: string;
  name: string;
  legalName: string;
  taxId: string; // CUIT
  address: string;
  phone: string;
  email: string;
  logo?: string;
  currency: "USD" | "ARS" | "EUR";
  timeZone: string;
  settings: {
    autoInvoiceOnDelivery: boolean;
    consumptionDropAlertThresholdPercent: number; // e.g. 20%
    reorderLeadDays: number; // e.g. 14
    defaultPaymentTermDays: number;
    vatRate: number; // e.g. 21%
  };
}

export interface User {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  assignedCustomerId?: string; // For CLIENTE role
  zone?: string;
}

export type CustomerSegment = "Specialty Cafe" | "Restaurant / Gastronomía" | "Hotel" | "Oficina / Corporativo" | "Distribuidor" | "Franquicia";
export type CustomerStatus = "Activo" | "Inactivo" | "Prospecto" | "Bloqueado";
export type CustomerScoring = "Alto Valor" | "Crecimiento" | "Riesgo" | "Riesgo Crítico" | "Inactivo";

export interface CustomerContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface Customer {
  id: string;
  orgId: string;
  code: string; // e.g. CLI-101
  legalName: string;
  commercialName: string;
  taxId: string; // CUIT
  address: string;
  city: string;
  zone: string;
  lat?: number;
  lng?: number;
  phone: string;
  email: string;
  contacts: CustomerContact[];
  salesRepId: string;
  salesRepName: string;
  preventistaId: string;
  preventistaName: string;
  paymentTermDays: number; // 0 for Cash, 7, 15, 30, 45, 60
  creditLimit: number;
  priceTier: "A (Especial)" | "B (Estándar)" | "C (Mayorista)";
  status: CustomerStatus;
  segment: CustomerSegment;
  scoring: CustomerScoring;
  potentialKgMonth: number;
  notes: string;
  createdAt: string;

  // Computed metrics
  avgMonthlyKg: number;
  avgLast3MonthsKg: number;
  avgLast6MonthsKg: number;
  avgLast12MonthsKg: number;
  consumptionChangePercent: number; // vs 6m avg (+15%, -28%)
  averagePurchaseFrequencyDays: number; // e.g. 14 days
  lastOrderDate?: string;
  estimatedNextOrderDate?: string; // calculated
  currentAccountBalance: number; // positive = customer owes money
  overdueDebt: number;
  assignedMachineIds: string[];
}

export type OrderPriority = "Baja" | "Normal" | "Alta" | "Urgente";
export type GrindType = "Grano Entero" | "Espresso" | "Filtro / V60" | "Prensa Francesa" | "Cold Brew";

export type ProductCategory =
  | "Café en Grano (Blend)"
  | "Café en Grano (Origen)"
  | "Café Molido"
  | "Cápsulas"
  | "Café Verde"
  | "Máquinas Espresso"
  | "Molinos / Grinders"
  | "Accesorios & Filtros"
  | "Repuestos";

export interface Product {
  id: string;
  orgId: string;
  sku: string;
  name: string;
  category: ProductCategory;
  description: string;
  unit: "Kg" | "Bolsa 250g" | "Bolsa 1Kg" | "Caja x10" | "Unidad";
  weightKg: number;
  priceA: number;
  priceB: number;
  priceC: number;
  cost: number;
  stock: number;
  minStockAlert: number;
  active: boolean;
  roastProfile?: "Claro / Filtro" | "Medio / Omnitostado" | "Oscuro / Espresso";
  origin?: string; // e.g. Colombia Huila, Etiopía Yirgacheffe, Brasil Cerrado
  altitude?: string;
  process?: "Lavado" | "Natural" | "Honey" | "Anaeróbico" | "Natural / Lavado";
}

export type OrderStatus =
  | "Borrador"
  | "Recibido"
  | "Confirmado"
  | "En producción"
  | "Preparado"
  | "Parcialmente despachado"
  | "Despachado"
  | "En tránsito"
  | "Entregado"
  | "Facturado"
  | "Cobrado"
  | "Cancelado";

export type DeliveryModality =
  | "Entrega Directa"
  | "Delivery / Operador"
  | "Reparto Propio"
  | "Retiro en Planta"
  | "Retiro en Tostaduría"
  | "Encomienda / Expreso"
  | "Moto Express";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku?: string;
  grind?: GrindType;
  quantity: number;
  unitWeightKg?: number;
  totalKg: number;
  unitPrice: number;
  subtotal: number;
  cost?: number;
}

export interface Order {
  id: string;
  orgId: string;
  orderNumber: string; // e.g. PED-2026-0042
  customerId: string;
  customerName: string;
  customerTaxId: string;
  customerAddress: string;
  customerZone: string;
  createdAt: string;
  promisedDate: string;
  salesRepId: string;
  salesRepName: string;
  preventistaId?: string;
  preventistaName?: string;
  items: OrderItem[];
  totalKg: number;
  subtotal: number;
  discount: number;
  taxAmount: number;
  totalAmount: number;
  priority: "Baja" | "Normal" | "Alta" | "Urgente";
  deliveryModality: DeliveryModality;
  status: OrderStatus;
  notes?: string;
  isDeliveredUninvoiced?: boolean;
  invoiceId?: string;
  deliveryId?: string;
  deliveryDate?: string;
  deliveredBy?: string;
  deliveredTo?: string;
  signatureUrl?: string;
}

export type MachineModality =
  | "Comodato / Consignación"
  | "Vendida"
  | "Depósito / Disponible"
  | "Reservada"
  | "En Reparación"
  | "Baja";

export type MachineStatus =
  | "Operativa"
  | "Requiere Mantenimiento"
  | "En Service"
  | "Detenida / Fuera de servicio";

export interface MachineMovement {
  id: string;
  date: string;
  type: "Compra" | "Instalación" | "Traslado" | "Service Preventivo" | "Reparación" | "Cambio de Piezas" | "Retiro" | "Venta" | "Renovación Contrato" | "Retiro Programado";
  description: string;
  customerId?: string;
  customerName?: string;
  technicianName?: string;
  cost?: number;
}

export interface ContractRenewalRecord {
  id: string;
  date: string;
  previousExpirationDate: string;
  newExpirationDate: string;
  renewedBy: string;
  termMonths: number;
  minimumMonthlyKg?: number;
  contractFileName?: string;
  notes?: string;
}

export interface Machine {
  id: string;
  orgId: string;
  code: string; // e.g. M-00231
  brand: string; // e.g. La Marzocco, Sanremo, Nuova Simonelli, Mahlkönig
  model: string; // e.g. Linea PB 2G, Cafe Racer, Aurelia Wave, EK43
  serialNumber: string;
  type: "Espresso 2 Grupos" | "Espresso 3 Grupos" | "Espresso 1 Grupo" | "Superautomática" | "Molino On-Demand" | "Filtro Batch Brewer";
  capacity: string;
  purchaseDate: string;
  purchaseCostUSD: number;
  currentValueUSD: number;
  modality: MachineModality;
  status: MachineStatus;
  customerId?: string;
  customerName?: string;
  locationAddress?: string;
  lat?: number;
  lng?: number;
  installationDate?: string;
  contractNumber?: string;
  
  // Consignment / Comodato Contract & Expiration Tracking
  contractStartDate?: string;
  contractExpirationDate?: string;
  contractTermMonths?: number;
  minimumMonthlyKg?: number;
  contractScanUrl?: string; // base64 or document preview
  contractFileName?: string;
  contractUploadedAt?: string;
  contractStatus?: "Vigente" | "Por Vencer" | "Vencido" | "Renovado" | "Retiro Programado";
  contractNotes?: string;
  contractRenewalHistory?: ContractRenewalRecord[];
  
  // Scheduled Retrieval
  retrievalScheduledDate?: string;
  retrievalDriverName?: string;
  retrievalReason?: string;
  retrievalNotes?: string;

  warrantyUntil?: string;
  nextServiceDate: string;
  responsibleTechId?: string;
  responsibleTechName?: string;
  movements: MachineMovement[];

  // Strategic Profitability & Coffee Generation Metrics
  installedAgeMonths?: number;
  totalKgSinceInstall: number;
  kgLast12Months: number;
  kgLast3Months: number;
  avgMonthlyKg: number;
  accumulatedCoffeeMarginUSD: number;
  recoveryPercent: number; // (Margin / Cost) * 100
  paybackMonths: number;
  isProfitable: boolean;
}

export interface GreenCoffeeReceipt {
  id: string;
  orgId: string;
  receiptNumber: string; // e.g. REM-VERDE-4892
  lotNumber: string; // e.g. LOT-GV-260818-01
  date: string;
  supplier: string; // e.g. "Dufour Specialty Coffee Imports", "Volcafe Specialty"
  originCountry: string; // e.g. "Colombia", "Brasil", "Etiopía", "Guatemala"
  region: string; // e.g. "Huila San Agustín", "Cerrado Mineiro", "Yirgacheffe"
  farmOrProducer?: string; // e.g. "Finca El Paraíso", "Fazenda Santa Inês"
  variety: string; // e.g. "Caturra / Castillo", "Bourbon Amarillo", "Heirloom"
  process: "Lavado" | "Natural" | "Honey" | "Anaeróbico" | "Natural / Lavado";
  altitudeMeters?: number; // e.g. 1750
  bagCount: number; // e.g. 10 sacos
  kgPerBag: number; // e.g. 60 kg
  totalGreenKg: number; // e.g. 600 kg
  availableKg: number; // remaining green kg in stock
  costPerKgUSD: number; // e.g. 5.80
  warehouseLocation: string; // e.g. "Silo Verde 01", "Depósito CABA - Pallet 4"
  humidityPercent?: number; // e.g. 11.2%
  moisturePercent?: number;
  screenSize?: string; // e.g. "17/18 Supremo"
  sensoryNotes?: string;
  scaScore?: number; // e.g. 86.5
  status: "En Stock" | "Agotado" | "En Cuarentena";
  registeredBy: string;
  notes?: string;
}

export interface BlendComponent {
  greenLotId: string;
  greenLotNumber: string;
  origin: string; // e.g. "Brasil Cerrado Natural (Fazenda Rainha)"
  percentage: number; // e.g. 70%
  greenKg: number; // e.g. 42 kg
}

export interface ProductionOrder {
  id: string;
  orgId: string;
  code: string; // e.g. PROD-891
  batchNumber: string; // e.g. LOT-TOST-260818-01
  productId: string;
  productName: string;
  isBlend?: boolean;
  blendComponents?: BlendComponent[];
  greenCoffeeOrigin: string;
  greenLotNumber?: string; // For single origin
  greenCoffeeKg: number; // Total green coffee loaded in roaster
  roastedCoffeeTargetKg: number;
  actualRoastedKg?: number;
  lossPercent?: number; // Merma % real (typically 14-18%)
  expectedLossPercent?: number; // Merma esperada % (e.g. 15.5%)
  roastProfile: string;
  roasterMachine: string; // e.g. Giesen W15A, Probat UG22
  roasterOperator: string;
  status: "Planificada" | "En Tueste" | "En Reposo / Desgasificado" | "Envasado" | "Completado";
  date: string;
  roastTimeSeconds?: number;
  dropTempCelsius?: number;
  chargeTempCelsius?: number;
  dtrPercent?: number; // Development Time Ratio %
  degasDaysRecommended?: number; // e.g. 7 - 14 days
  bestBeforeDays?: number; // e.g. 90 days
  notes?: string;
  qrCodeData?: string;
}

export type StockMovementType =
  | "ENTRADA_REMITO_VERDE"
  | "CONSUMO_TUESTE"
  | "PRODUCCION_TOSTADO"
  | "SALIDA_REMITO_DESPACHO"
  | "AJUSTE_INVENTARIO_POSITIVO"
  | "AJUSTE_INVENTARIO_NEGATIVO"
  | "MERMA_EXTRAORDINARIA"
  | "MUESTRA_CATA";

export interface StockMovement {
  id: string;
  orgId: string;
  date: string;
  time: string;
  itemType: "CAFE_VERDE" | "CAFE_TOSTADO";
  itemId: string; // Green Lot ID or Product ID
  itemName: string;
  lotNumber?: string;
  type: StockMovementType;
  quantityKg: number;
  previousStockKg: number;
  newStockKg: number;
  referenceDocument?: string; // Remito number, Order number, Production Batch code
  reason?: string;
  authorizedBy: string;
  userRole: UserRole;
  notes?: string;
}

export interface DeliveryRoute {
  id: string;
  orgId: string;
  code: string; // e.g. RUTA-NORTE-01
  date: string;
  vehicle: string; // e.g. Furgón Sprinter (AA123BB)
  driverId: string;
  driverName: string;
  status: "Planificada" | "En Camino" | "Completada";
  totalKg: number;
  totalOrdersCount: number;
  estimatedKm: number;
  estimatedHours: number;
  stops: {
    orderId: string;
    customerId: string;
    customerName: string;
    address: string;
    kg: number;
    amount: number;
    priority: "Baja" | "Normal" | "Alta" | "Urgente";
    timeWindow: string;
    status: "Pendiente" | "En Camino" | "Entregado" | "Rechazado";
    deliveredAt?: string;
    notes?: string;
  }[];
}

export interface Invoice {
  id: string;
  orgId: string;
  invoiceNumber: string; // e.g. FC-A-0001-00004912
  type: "Factura A" | "Factura B" | "Nota de Crédito" | "Nota de Débito";
  date: string;
  dueDate: string;
  orderId?: string;
  customerId: string;
  customerName: string;
  customerTaxId: string;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  status: "Emitida" | "Cobrada Parcial" | "Cobrada Total" | "Anulada";
  paidAmount: number;
  balanceDue: number;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

export interface CurrentAccountMovement {
  id: string;
  orgId: string;
  customerId: string;
  customerName: string;
  date: string;
  dueDate?: string;
  type: "Factura" | "Pago" | "Nota de Crédito" | "Nota de Débito" | "Ajuste";
  referenceNumber: string;
  debit: number; // Increases debt
  credit: number; // Reduces debt
  balance: number; // Resulting balance
  status: "Vencido" | "Al día" | "Cancelado";
  daysOverdue?: number;
  paymentMethod?: "Transferencia Bancaria" | "Cheque 30d" | "Efectivo" | "Mercado Pago" | "Depósito";
}

export interface CollectionFollowUp {
  id: string;
  orgId: string;
  customerId: string;
  customerName: string;
  date: string;
  agentName: string;
  channel: "WhatsApp" | "Llamada Telefónica" | "Email" | "Visita Presencial";
  overdueAmount: number;
  result: "Promesa de Pago" | "Reclamo de Factura" | "Sin Respuesta" | "Pago Realizado";
  promisedPaymentDate?: string;
  notes: string;
}

export interface ServiceTicket {
  id: string;
  orgId: string;
  ticketNumber: string; // e.g. TCK-1049
  customerId: string;
  customerName: string;
  customerPhone: string;
  machineId: string;
  machineCode: string;
  machineModel: string;
  createdAt: string;
  priority: "Baja" | "Media" | "Alta" | "Crítica (Parada de Máquina)";
  reportedProblem: string;
  description: string;
  status:
    | "Abierto"
    | "Asignado"
    | "En Diagnóstico"
    | "Esperando Repuesto"
    | "En Reparación"
    | "Resuelto"
    | "Cerrado";
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  usedSpareParts?: {
    partName: string;
    quantity: number;
    cost: number;
  }[];
  laborCostUSD: number;
  totalCostUSD: number;
  underWarranty: boolean;
  resolutionNotes?: string;
  resolvedAt?: string;
}

export interface CRMVisit {
  id: string;
  orgId: string;
  date: string;
  time: string;
  customerId: string;
  customerName: string;
  preventistaId: string;
  preventistaName: string;
  purpose:
    | "Toma de Pedido"
    | "Venta / Prospección"
    | "Fidelización"
    | "Reclamo / Calidad"
    | "Service / Chequeo Máquina"
    | "Cobranza"
    | "Degustación de Origen"
    | "Seguimiento General";
  outcome: "Pedido Generado" | "Compromiso de Compra" | "Service Requerido" | "Seguimiento Requerido" | "Sin Novedades";
  generatedOrderId?: string;
  orderAmount?: number;
  orderKg?: number;
  customerSatisfaction?: 1 | 2 | 3 | 4 | 5;
  notes: string;
  photoUrl?: string;
  gpsLocation?: string;
  nextAction?: string;
  nextActionDate?: string;
}

export interface AlertItem {
  id: string;
  orgId: string;
  severity: "CRITICO" | "ATENCION" | "SEGUIMIENTO" | "OPORTUNIDAD";
  category: "Pedidos" | "Cobranzas" | "Clientes" | "Máquinas" | "Producción" | "Facturación" | "Logística";
  title: string;
  description: string;
  entityId?: string;
  entityType?: "customer" | "order" | "machine" | "invoice" | "product";
  actionLabel?: string;
  actionTarget?: string;
  createdAt: string;
  isRead?: boolean;
}

export interface AuditLog {
  id: string;
  orgId: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  previousValue?: string;
  newValue?: string;
}
