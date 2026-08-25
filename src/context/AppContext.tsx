import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  Organization,
  User,
  UserRole,
  Customer,
  Product,
  Order,
  Machine,
  ProductionOrder,
  DeliveryRoute,
  Invoice,
  CurrentAccountMovement,
  CollectionFollowUp,
  ServiceTicket,
  CRMVisit,
  AlertItem,
  AuditLog,
  OrderStatus,
  GreenCoffeeReceipt,
  StockMovement,
  StockMovementType,
  BlendComponent,
} from "../types";
import {
  initialOrganizations,
  initialUsers,
  initialCustomers,
  initialProducts,
  initialOrders,
  initialMachines,
  initialInvoices,
  initialAccountMovements,
  initialProductionOrders,
  initialDeliveryRoutes,
  initialServiceTickets,
  initialCRMVisits,
  initialAlerts,
  initialGreenCoffeeReceipts,
  initialStockMovements,
} from "../data/mockData";

interface AppContextType {
  // Multi-tenant & User
  organizations: Organization[];
  currentOrg: Organization;
  setCurrentOrgId: (id: string) => void;
  currentUser: User;
  setCurrentUserId: (id: string) => void;
  users: User[];

  // Core Data
  customers: Customer[];
  products: Product[];
  orders: Order[];
  machines: Machine[];
  invoices: Invoice[];
  accountMovements: CurrentAccountMovement[];
  productionOrders: ProductionOrder[];
  deliveryRoutes: DeliveryRoute[];
  serviceTickets: ServiceTicket[];
  crmVisits: CRMVisit[];
  collectionLogs: CollectionFollowUp[];
  alerts: AlertItem[];
  auditLogs: AuditLog[];
  greenCoffeeReceipts: GreenCoffeeReceipt[];
  stockMovements: StockMovement[];

  // Navigation & View control
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  selectedMachineId: string | null;
  setSelectedMachineId: (id: string | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;

  // Actions & Operations
  addCustomer: (customer: Omit<Customer, "id" | "orgId" | "createdAt" | "avgMonthlyKg" | "avgLast3MonthsKg" | "avgLast6MonthsKg" | "avgLast12MonthsKg" | "consumptionChangePercent" | "averagePurchaseFrequencyDays" | "currentAccountBalance" | "overdueDebt" | "assignedMachineIds">) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;

  createOrder: (orderData: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, extraData?: Partial<Order>) => void;
  repeatLastCustomerOrder: (customerId: string) => Order | null;
  dispatchOrderRemito: (orderId: string, remitoNumber?: string) => void;

  addMachine: (machineData: Partial<Machine>) => void;
  updateMachine: (id: string, updates: Partial<Machine>) => void;
  addMachineMovement: (machineId: string, movement: { type: any; description: string; cost?: number; customerId?: string; customerName?: string; technicianName?: string }) => void;
  updateMachineContract: (machineId: string, updates: Partial<Machine>) => void;
  renewMachineContract: (machineId: string, renewal: { newExpirationDate: string; addMonths: number; minimumMonthlyKg?: number; notes?: string; contractFileName?: string; contractScanUrl?: string }) => void;
  scheduleMachineRetrieval: (machineId: string, retrieval: { scheduledDate: string; driverName: string; reason: string; notes?: string }) => void;
  uploadMachineContractScan: (machineId: string, fileData: { fileName: string; scanUrl: string; notes?: string }) => void;

  createInvoiceForOrder: (orderId: string) => Invoice | null;
  createManualInvoice: (invoiceData: Partial<Invoice>) => Invoice;
  registerPayment: (paymentData: { customerId: string; amount: number; reference: string; method: string; invoiceId?: string; notes?: string }) => void;

  // Green Coffee & Production
  addGreenCoffeeReceipt: (receiptData: Partial<GreenCoffeeReceipt>) => GreenCoffeeReceipt;
  addProductionBatch: (batch: Partial<ProductionOrder>) => ProductionOrder;
  completeProductionBatch: (batchId: string, actualKg: number, notes?: string) => void;

  // Stock Adjustment (Authorized)
  adjustStock: (adjustmentData: {
    itemType: "CAFE_VERDE" | "CAFE_TOSTADO";
    itemId: string;
    adjustmentKg: number;
    reason: string;
    notes?: string;
    supervisorAuthCode?: string;
  }) => { success: boolean; message: string };

  createServiceTicket: (ticketData: Partial<ServiceTicket>) => ServiceTicket;
  updateServiceTicket: (id: string, updates: Partial<ServiceTicket>) => void;

  registerCRMVisit: (visitData: Partial<CRMVisit>) => CRMVisit;
  recordCollectionFollowUp: (followUp: Partial<CollectionFollowUp>) => void;
  dismissAlert: (alertId: string) => void;
  resetToDemoData: () => void;

  // AI query helper
  queryCherryAI: (prompt: string, history?: { sender: string; text: string }[]) => Promise<string>;
}

const STORAGE_KEY = "cherry_tost_saas_state_v3";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or defaults
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_orgs`);
    return saved ? JSON.parse(saved) : initialOrganizations;
  });

  const [currentOrgId, setCurrentOrgIdState] = useState<string>("org-demo");

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUserId, setCurrentUserIdState] = useState<string>("usr-admin");

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [machines, setMachines] = useState<Machine[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_machines`);
    return saved ? JSON.parse(saved) : initialMachines;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [accountMovements, setAccountMovements] = useState<CurrentAccountMovement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_movements`);
    return saved ? JSON.parse(saved) : initialAccountMovements;
  });

  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_production`);
    return saved ? JSON.parse(saved) : initialProductionOrders;
  });

  const [greenCoffeeReceipts, setGreenCoffeeReceipts] = useState<GreenCoffeeReceipt[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_green_coffee`);
    return saved ? JSON.parse(saved) : initialGreenCoffeeReceipts;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_stock_movements`);
    return saved ? JSON.parse(saved) : initialStockMovements;
  });

  const [deliveryRoutes, setDeliveryRoutes] = useState<DeliveryRoute[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_routes`);
    return saved ? JSON.parse(saved) : initialDeliveryRoutes;
  });

  const [serviceTickets, setServiceTickets] = useState<ServiceTicket[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tickets`);
    return saved ? JSON.parse(saved) : initialServiceTickets;
  });

  const [crmVisits, setCrmVisits] = useState<CRMVisit[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_visits`);
    return saved ? JSON.parse(saved) : initialCRMVisits;
  });

  const [collectionLogs, setCollectionLogs] = useState<CollectionFollowUp[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_alerts`);
    return saved ? JSON.parse(saved) : initialAlerts;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "log-init",
      orgId: "org-demo",
      timestamp: new Date().toISOString(),
      userId: "usr-admin",
      userName: "Martín Palermo",
      userRole: "ADMIN_EMPRESA",
      action: "INICIO_SESION",
      entity: "ORGANIZACION",
      entityId: "org-demo",
      newValue: "Sesión iniciada en CHERRY TOST DEMO",
    },
  ]);

  // View state
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
      localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
      localStorage.setItem(`${STORAGE_KEY}_machines`, JSON.stringify(machines));
      localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
      localStorage.setItem(`${STORAGE_KEY}_movements`, JSON.stringify(accountMovements));
      localStorage.setItem(`${STORAGE_KEY}_production`, JSON.stringify(productionOrders));
      localStorage.setItem(`${STORAGE_KEY}_green_coffee`, JSON.stringify(greenCoffeeReceipts));
      localStorage.setItem(`${STORAGE_KEY}_stock_movements`, JSON.stringify(stockMovements));
      localStorage.setItem(`${STORAGE_KEY}_routes`, JSON.stringify(deliveryRoutes));
      localStorage.setItem(`${STORAGE_KEY}_tickets`, JSON.stringify(serviceTickets));
      localStorage.setItem(`${STORAGE_KEY}_visits`, JSON.stringify(crmVisits));
      localStorage.setItem(`${STORAGE_KEY}_alerts`, JSON.stringify(alerts));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }, [customers, products, orders, machines, invoices, accountMovements, productionOrders, greenCoffeeReceipts, stockMovements, deliveryRoutes, serviceTickets, crmVisits, alerts]);

  // Derived current org and user
  const currentOrg = organizations.find((o) => o.id === currentOrgId) || organizations[0];
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const logAudit = (action: string, entity: string, entityId: string, newValue?: string, previousValue?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      orgId: currentOrg.id,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entity,
      entityId,
      previousValue,
      newValue,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 100)]);
  };

  const setCurrentOrgId = (id: string) => {
    setCurrentOrgIdState(id);
    logAudit("CAMBIO_ORGANIZACION", "ORGANIZACION", id, `Cambio a org ${id}`);
  };

  const setCurrentUserId = (id: string) => {
    setCurrentUserIdState(id);
    const targetUser = users.find((u) => u.id === id);
    if (targetUser?.role === "PREVENTISTA") {
      setActiveTab("preventa");
    } else if (targetUser?.role === "CLIENTE") {
      setActiveTab("portal");
    }
    logAudit("CAMBIO_USUARIO", "USUARIO", id, `Cambio a usuario ${targetUser?.name} (${targetUser?.role})`);
  };

  // Actions
  const addCustomer = (customerData: any) => {
    const newId = `cli-${Date.now()}`;
    const code = `CLI-${customers.length + 101}`;
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      orgId: currentOrg.id,
      code,
      createdAt: new Date().toISOString().split("T")[0],
      avgMonthlyKg: 0,
      avgLast3MonthsKg: 0,
      avgLast6MonthsKg: 0,
      avgLast12MonthsKg: 0,
      consumptionChangePercent: 0,
      averagePurchaseFrequencyDays: 14,
      currentAccountBalance: 0,
      overdueDebt: 0,
      assignedMachineIds: [],
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    logAudit("CREAR_CLIENTE", "CLIENTE", newId, `Creado cliente ${newCustomer.commercialName}`);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    logAudit("ACTUALIZAR_CLIENTE", "CLIENTE", id, JSON.stringify(updates));
  };

  const createOrder = (orderData: Partial<Order>): Order => {
    const orderNum = `PED-2026-${String(orders.length + 813).padStart(4, "0")}`;
    const newOrder: Order = {
      id: `ped-${Date.now()}`,
      orgId: currentOrg.id,
      orderNumber: orderNum,
      customerId: orderData.customerId || "",
      customerName: orderData.customerName || "",
      customerTaxId: orderData.customerTaxId || "",
      customerAddress: orderData.customerAddress || "",
      customerZone: orderData.customerZone || "",
      createdAt: new Date().toISOString(),
      promisedDate: orderData.promisedDate || new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
      salesRepId: currentUser.id,
      salesRepName: currentUser.name,
      preventistaId: currentUser.role === "PREVENTISTA" ? currentUser.id : undefined,
      preventistaName: currentUser.role === "PREVENTISTA" ? currentUser.name : undefined,
      items: orderData.items || [],
      totalKg: orderData.totalKg || 0,
      subtotal: orderData.subtotal || 0,
      discount: orderData.discount || 0,
      taxAmount: orderData.taxAmount || (orderData.subtotal || 0) * (currentOrg.settings.vatRate / 100),
      totalAmount: orderData.totalAmount || 0,
      priority: orderData.priority || "Normal",
      deliveryModality: orderData.deliveryModality || "Reparto Propio",
      status: orderData.status || "Recibido",
      notes: orderData.notes || "",
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Check stock impact & reduce product stock
    if (newOrder.items.length > 0) {
      setProducts((prev) =>
        prev.map((p) => {
          const item = newOrder.items.find((it) => it.productId === p.id);
          if (item) {
            const newStock = Math.max(0, p.stock - item.quantity);
            // If stock goes below minStockAlert, generate Alert
            if (newStock <= p.minStockAlert) {
              const newAlert: AlertItem = {
                id: `alt-stock-${Date.now()}`,
                orgId: currentOrg.id,
                severity: "ATENCION",
                category: "Producción",
                title: `Stock bajo en ${p.name}`,
                description: `Quedan ${newStock} ${p.unit} en stock. Demanda pendiente por pedidos.`,
                entityId: p.id,
                entityType: "product",
                actionLabel: "Planificar Tueste",
                actionTarget: "production",
                createdAt: new Date().toISOString(),
              };
              setAlerts((alertsPrev) => [newAlert, ...alertsPrev]);
            }
            return { ...p, stock: newStock };
          }
          return p;
        })
      );
    }

    logAudit("CREAR_PEDIDO", "PEDIDO", newOrder.id, `Pedido ${newOrder.orderNumber} por $${newOrder.totalAmount} (${newOrder.totalKg} Kg)`);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, extraData: Partial<Order> = {}) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated: Order = {
            ...o,
            status: newStatus,
            ...extraData,
          };

          // If transitioning to "Entregado", trigger delivery consequences
          if (newStatus === "Entregado") {
            updated.isDeliveredUninvoiced = true;
            updated.deliveryDate = updated.deliveryDate || new Date().toISOString();
            updated.deliveredBy = updated.deliveredBy || currentUser.name;

            // Generate Critical Alert: Delivered Not Invoiced
            const deliverAlert: AlertItem = {
              id: `alt-deliv-${Date.now()}`,
              orgId: currentOrg.id,
              severity: "CRITICO",
              category: "Facturación",
              title: `Pedido ${updated.orderNumber} entregado SIN facturar`,
              description: `El pedido de ${updated.customerName} (${updated.totalKg} Kg / $${updated.totalAmount}) fue entregado y requiere emisión de factura.`,
              entityId: updated.id,
              entityType: "order",
              actionLabel: "Emitir Factura",
              actionTarget: "billing",
              createdAt: new Date().toISOString(),
            };
            setAlerts((prevAlerts) => [deliverAlert, ...prevAlerts]);
          }

          // If transitioning to "Facturado", remove unbilled flag
          if (newStatus === "Facturado") {
            updated.isDeliveredUninvoiced = false;
          }

          return updated;
        }
        return o;
      })
    );

    logAudit("CAMBIO_ESTADO_PEDIDO", "PEDIDO", orderId, `Estado cambiado a ${newStatus}`);
  };

  const repeatLastCustomerOrder = (customerId: string): Order | null => {
    const customerOrders = orders.filter((o) => o.customerId === customerId);
    if (customerOrders.length === 0) return null;
    const lastOrder = customerOrders[0];
    return createOrder({
      customerId: lastOrder.customerId,
      customerName: lastOrder.customerName,
      customerTaxId: lastOrder.customerTaxId,
      customerAddress: lastOrder.customerAddress,
      customerZone: lastOrder.customerZone,
      items: lastOrder.items.map((it) => ({ ...it, id: `it-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` })),
      totalKg: lastOrder.totalKg,
      subtotal: lastOrder.subtotal,
      discount: lastOrder.discount,
      taxAmount: lastOrder.taxAmount,
      totalAmount: lastOrder.totalAmount,
      priority: "Normal",
      deliveryModality: lastOrder.deliveryModality,
      status: "Recibido",
      notes: "Pedido repetido de forma automática.",
    });
  };

  const addMachine = (machineData: Partial<Machine>) => {
    const newId = `maq-${Date.now()}`;
    const newCode = `M-00${machines.length + 510}`;
    const newMachine: Machine = {
      id: newId,
      orgId: currentOrg.id,
      code: machineData.code || newCode,
      brand: machineData.brand || "La Marzocco",
      model: machineData.model || "Linea PB 2G",
      serialNumber: machineData.serialNumber || `SN-${Date.now()}`,
      type: machineData.type || "Espresso 2 Grupos",
      capacity: machineData.capacity || "Dual boiler 2 grupos",
      purchaseDate: machineData.purchaseDate || new Date().toISOString().split("T")[0],
      purchaseCostUSD: machineData.purchaseCostUSD || 8000,
      currentValueUSD: machineData.currentValueUSD || 8000,
      modality: machineData.modality || "Depósito / Disponible",
      status: machineData.status || "Operativa",
      customerId: machineData.customerId,
      customerName: machineData.customerName,
      locationAddress: machineData.locationAddress,
      lat: machineData.lat,
      lng: machineData.lng,
      installationDate: machineData.installationDate,
      contractNumber: machineData.contractNumber,
      warrantyUntil: machineData.warrantyUntil,
      nextServiceDate: machineData.nextServiceDate || new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0],
      responsibleTechId: "usr-tech",
      responsibleTechName: "Diego Barreto",
      movements: [
        {
          id: `mv-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          type: "Compra",
          description: "Ingreso al inventario de máquinas.",
          cost: machineData.purchaseCostUSD || 8000,
        },
      ],
      totalKgSinceInstall: 0,
      kgLast12Months: 0,
      kgLast3Months: 0,
      avgMonthlyKg: 0,
      accumulatedCoffeeMarginUSD: 0,
      recoveryPercent: 0,
      paybackMonths: 0,
      isProfitable: false,
    };

    setMachines((prev) => [newMachine, ...prev]);
    logAudit("CREAR_MAQUINA", "MAQUINA", newId, `Registrada máquina ${newMachine.brand} ${newMachine.model} (${newMachine.code})`);
  };

  const updateMachine = (id: string, updates: Partial<Machine>) => {
    setMachines((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    logAudit("ACTUALIZAR_MAQUINA", "MAQUINA", id, JSON.stringify(updates));
  };

  const addMachineMovement = (machineId: string, movement: any) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === machineId) {
          const newMovement = {
            id: `mv-${Date.now()}`,
            date: new Date().toISOString().split("T")[0],
            ...movement,
          };
          return {
            ...m,
            customerId: movement.customerId !== undefined ? movement.customerId : m.customerId,
            customerName: movement.customerName !== undefined ? movement.customerName : m.customerName,
            movements: [newMovement, ...m.movements],
          };
        }
        return m;
      })
    );
    logAudit("MOVIMIENTO_MAQUINA", "MAQUINA", machineId, `${movement.type}: ${movement.description}`);
  };

  const updateMachineContract = (machineId: string, updates: Partial<Machine>) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === machineId) {
          const updated = { ...m, ...updates };
          return updated;
        }
        return m;
      })
    );
    logAudit("ACTUALIZAR_CONTRATO_MAQUINA", "MAQUINA", machineId, `Actualización de contrato comodato`);
  };

  const renewMachineContract = (
    machineId: string,
    renewal: {
      newExpirationDate: string;
      addMonths: number;
      minimumMonthlyKg?: number;
      notes?: string;
      contractFileName?: string;
      contractScanUrl?: string;
    }
  ) => {
    const targetMachine = machines.find((m) => m.id === machineId);
    if (!targetMachine) return;

    const prevExp = targetMachine.contractExpirationDate || new Date().toISOString().split("T")[0];
    const newRecord = {
      id: `ren-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      previousExpirationDate: prevExp,
      newExpirationDate: renewal.newExpirationDate,
      renewedBy: currentUser.name,
      termMonths: renewal.addMonths,
      minimumMonthlyKg: renewal.minimumMonthlyKg || targetMachine.minimumMonthlyKg,
      contractFileName: renewal.contractFileName || targetMachine.contractFileName,
      notes: renewal.notes,
    };

    const newMove = {
      id: `mv-ren-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: "Renovación Contrato" as const,
      description: `Renovación de consignación por ${renewal.addMonths} meses (Nuevo vencimiento: ${renewal.newExpirationDate}). Compromiso: ${renewal.minimumMonthlyKg || targetMachine.minimumMonthlyKg || 50} Kg/mes. ${renewal.notes || ""}`,
      customerId: targetMachine.customerId,
      customerName: targetMachine.customerName,
      technicianName: currentUser.name,
    };

    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === machineId) {
          return {
            ...m,
            contractExpirationDate: renewal.newExpirationDate,
            contractTermMonths: (m.contractTermMonths || 0) + renewal.addMonths,
            minimumMonthlyKg: renewal.minimumMonthlyKg !== undefined ? renewal.minimumMonthlyKg : m.minimumMonthlyKg,
            contractStatus: "Renovado" as const,
            contractFileName: renewal.contractFileName || m.contractFileName,
            contractScanUrl: renewal.contractScanUrl || m.contractScanUrl,
            contractUploadedAt: renewal.contractFileName ? new Date().toISOString() : m.contractUploadedAt,
            contractRenewalHistory: [newRecord, ...(m.contractRenewalHistory || [])],
            movements: [newMove, ...m.movements],
          };
        }
        return m;
      })
    );

    logAudit("RENOVAR_CONTRATO_MAQUINA", "MAQUINA", machineId, `Contrato renovado hasta ${renewal.newExpirationDate} (+${renewal.addMonths} meses)`);
  };

  const scheduleMachineRetrieval = (
    machineId: string,
    retrieval: {
      scheduledDate: string;
      driverName: string;
      reason: string;
      notes?: string;
    }
  ) => {
    const targetMachine = machines.find((m) => m.id === machineId);
    if (!targetMachine) return;

    const newMove = {
      id: `mv-ret-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: "Retiro Programado" as const,
      description: `Retiro programado para el ${retrieval.scheduledDate} a cargo de ${retrieval.driverName}. Motivo: ${retrieval.reason}. ${retrieval.notes || ""}`,
      customerId: targetMachine.customerId,
      customerName: targetMachine.customerName,
      technicianName: retrieval.driverName,
    };

    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === machineId) {
          return {
            ...m,
            contractStatus: "Retiro Programado" as const,
            retrievalScheduledDate: retrieval.scheduledDate,
            retrievalDriverName: retrieval.driverName,
            retrievalReason: retrieval.reason,
            retrievalNotes: retrieval.notes,
            movements: [newMove, ...m.movements],
          };
        }
        return m;
      })
    );

    // Create an alert for logistics
    const retAlert: AlertItem = {
      id: `alt-ret-${Date.now()}`,
      orgId: currentOrg.id,
      severity: "ATENCION",
      category: "Máquinas",
      title: `Retiro de máquina ${targetMachine.code} programado`,
      description: `Retiro de ${targetMachine.brand} ${targetMachine.model} en ${targetMachine.customerName} programado para el ${retrieval.scheduledDate} (${retrieval.reason}).`,
      entityId: targetMachine.id,
      entityType: "machine",
      actionLabel: "Ver Máquina",
      actionTarget: "machines",
      createdAt: new Date().toISOString(),
    };
    setAlerts((prev) => [retAlert, ...prev]);

    logAudit("PROGRAMAR_RETIRO_MAQUINA", "MAQUINA", machineId, `Retiro programado para ${retrieval.scheduledDate} (${retrieval.reason})`);
  };

  const uploadMachineContractScan = (
    machineId: string,
    fileData: { fileName: string; scanUrl: string; notes?: string }
  ) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === machineId) {
          return {
            ...m,
            contractFileName: fileData.fileName,
            contractScanUrl: fileData.scanUrl,
            contractUploadedAt: new Date().toISOString(),
            contractNotes: fileData.notes || m.contractNotes,
          };
        }
        return m;
      })
    );

    logAudit("SUBIR_ESCANEADO_CONTRATO", "MAQUINA", machineId, `Documento escaneado adjuntado: ${fileData.fileName}`);
  };

  const createInvoiceForOrder = (orderId: string): Invoice | null => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    const invNum = `FC-A-0001-${String(invoices.length + 4913).padStart(8, "0")}`;
    const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0];

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      orgId: currentOrg.id,
      invoiceNumber: invNum,
      type: "Factura A",
      date: new Date().toISOString().split("T")[0],
      dueDate,
      orderId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      customerTaxId: order.customerTaxId,
      subtotal: order.subtotal,
      vatAmount: order.taxAmount,
      totalAmount: order.totalAmount,
      status: "Emitida",
      paidAmount: 0,
      balanceDue: order.totalAmount,
      items: order.items.map((it) => ({
        description: `${it.productName} (${it.quantity} un / ${it.totalKg} Kg)`,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.subtotal,
      })),
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Update order to Facturado
    updateOrderStatus(orderId, "Facturado", { invoiceId: newInvoice.id, isDeliveredUninvoiced: false });

    // Update Current Account (Cuenta Corriente)
    const customer = customers.find((c) => c.id === order.customerId);
    const newBalance = (customer?.currentAccountBalance || 0) + newInvoice.totalAmount;

    const newMovement: CurrentAccountMovement = {
      id: `mov-${Date.now()}`,
      orgId: currentOrg.id,
      customerId: order.customerId,
      customerName: order.customerName,
      date: newInvoice.date,
      dueDate: newInvoice.dueDate,
      type: "Factura",
      referenceNumber: newInvoice.invoiceNumber,
      debit: newInvoice.totalAmount,
      credit: 0,
      balance: newBalance,
      status: "Al día",
    };

    setAccountMovements((prev) => [newMovement, ...prev]);

    // Update customer balance
    setCustomers((prev) =>
      prev.map((c) => (c.id === order.customerId ? { ...c, currentAccountBalance: newBalance } : c))
    );

    // Remove any "Delivered uninvoiced" alert for this order
    setAlerts((prev) => prev.filter((a) => a.entityId !== orderId));

    logAudit("EMITIR_FACTURA", "FACTURA", newInvoice.id, `Factura ${newInvoice.invoiceNumber} por $${newInvoice.totalAmount}`);
    return newInvoice;
  };

  const createManualInvoice = (invoiceData: Partial<Invoice>): Invoice => {
    const invNum = `FC-A-0001-${String(invoices.length + 4913).padStart(8, "0")}`;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      orgId: currentOrg.id,
      invoiceNumber: invNum,
      type: invoiceData.type || "Factura A",
      date: invoiceData.date || new Date().toISOString().split("T")[0],
      dueDate: invoiceData.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
      customerId: invoiceData.customerId || "",
      customerName: invoiceData.customerName || "",
      customerTaxId: invoiceData.customerTaxId || "",
      subtotal: invoiceData.subtotal || 0,
      vatAmount: invoiceData.vatAmount || 0,
      totalAmount: invoiceData.totalAmount || 0,
      status: "Emitida",
      paidAmount: 0,
      balanceDue: invoiceData.totalAmount || 0,
      items: invoiceData.items || [],
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    const customer = customers.find((c) => c.id === newInvoice.customerId);
    const newBalance = (customer?.currentAccountBalance || 0) + newInvoice.totalAmount;

    const newMovement: CurrentAccountMovement = {
      id: `mov-${Date.now()}`,
      orgId: currentOrg.id,
      customerId: newInvoice.customerId,
      customerName: newInvoice.customerName,
      date: newInvoice.date,
      dueDate: newInvoice.dueDate,
      type: "Factura",
      referenceNumber: newInvoice.invoiceNumber,
      debit: newInvoice.totalAmount,
      credit: 0,
      balance: newBalance,
      status: "Al día",
    };

    setAccountMovements((prev) => [newMovement, ...prev]);
    setCustomers((prev) =>
      prev.map((c) => (c.id === newInvoice.customerId ? { ...c, currentAccountBalance: newBalance } : c))
    );

    logAudit("EMITIR_FACTURA_MANUAL", "FACTURA", newInvoice.id, `Factura ${newInvoice.invoiceNumber}`);
    return newInvoice;
  };

  const registerPayment = (paymentData: { customerId: string; amount: number; reference: string; method: string; invoiceId?: string; notes?: string }) => {
    const customer = customers.find((c) => c.id === paymentData.customerId);
    const newBalance = Math.max(0, (customer?.currentAccountBalance || 0) - paymentData.amount);
    const newOverdue = Math.max(0, (customer?.overdueDebt || 0) - paymentData.amount);

    const newMovement: CurrentAccountMovement = {
      id: `mov-${Date.now()}`,
      orgId: currentOrg.id,
      customerId: paymentData.customerId,
      customerName: customer?.commercialName || "Cliente",
      date: new Date().toISOString().split("T")[0],
      type: "Pago",
      referenceNumber: paymentData.reference || `REC-2026-${Date.now().toString().slice(-4)}`,
      debit: 0,
      credit: paymentData.amount,
      balance: newBalance,
      status: "Cancelado",
      paymentMethod: paymentData.method as any,
    };

    setAccountMovements((prev) => [newMovement, ...prev]);

    // Update customer balances
    setCustomers((prev) =>
      prev.map((c) => (c.id === paymentData.customerId ? { ...c, currentAccountBalance: newBalance, overdueDebt: newOverdue } : c))
    );

    // If linked to specific invoice, update invoice paid amount
    if (paymentData.invoiceId) {
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === paymentData.invoiceId) {
            const newPaid = inv.paidAmount + paymentData.amount;
            const newDue = Math.max(0, inv.totalAmount - newPaid);
            return {
              ...inv,
              paidAmount: newPaid,
              balanceDue: newDue,
              status: newDue === 0 ? "Cobrada Total" : "Cobrada Parcial",
            };
          }
          return inv;
        })
      );
    }

    logAudit("REGISTRAR_PAGO", "COBRANZA", paymentData.customerId, `Cobro de $${paymentData.amount} mediante ${paymentData.method}`);
  };

  const addProductionBatch = (batch: Partial<ProductionOrder>): ProductionOrder => {
    const lotNumber = batch.batchNumber || `LOT-TOST-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${String(productionOrders.length + 1).padStart(2, "0")}`;
    const code = batch.code || `PROD-${productionOrders.length + 895}`;

    const newBatch: ProductionOrder = {
      id: `prod-ord-${Date.now()}`,
      orgId: currentOrg.id,
      code,
      batchNumber: lotNumber,
      productId: batch.productId || "",
      productName: batch.productName || "Café Tostado Especial",
      isBlend: batch.isBlend || false,
      blendComponents: batch.blendComponents || [],
      greenCoffeeOrigin: batch.greenCoffeeOrigin || "Origen Especial",
      greenLotNumber: batch.greenLotNumber,
      greenCoffeeKg: batch.greenCoffeeKg || 60,
      roastedCoffeeTargetKg: batch.roastedCoffeeTargetKg || (batch.greenCoffeeKg ? Math.round(batch.greenCoffeeKg * 0.84) : 50),
      expectedLossPercent: batch.expectedLossPercent || 16.0,
      roastProfile: batch.roastProfile || "Espresso Medio-Oscuro (DTR 20%)",
      roasterMachine: batch.roasterMachine || "Giesen W15A Roaster",
      roasterOperator: currentUser.name,
      status: batch.status || "Planificada",
      date: batch.date || new Date().toISOString().split("T")[0],
      notes: batch.notes || "",
      degasDaysRecommended: batch.degasDaysRecommended || 7,
      bestBeforeDays: batch.bestBeforeDays || 90,
      qrCodeData: JSON.stringify({
        lot: lotNumber,
        product: batch.productName,
        roastDate: batch.date || new Date().toISOString().split("T")[0],
        origin: batch.greenCoffeeOrigin,
        profile: batch.roastProfile,
      }),
    };

    setProductionOrders((prev) => [newBatch, ...prev]);
    logAudit("CREAR_ORDEN_TUESTE", "PRODUCCION", newBatch.id, `Orden ${newBatch.code} / Lote ${newBatch.batchNumber} (${newBatch.greenCoffeeKg} Kg verde)`);
    return newBatch;
  };

  const completeProductionBatch = (batchId: string, actualKg: number, notes?: string) => {
    const batch = productionOrders.find((b) => b.id === batchId);
    if (!batch) return;

    const loss = Number((((batch.greenCoffeeKg - actualKg) / batch.greenCoffeeKg) * 100).toFixed(1));
    const nowTime = new Date().toLocaleTimeString().slice(0, 5);
    const nowDate = new Date().toISOString().split("T")[0];

    // 1. Update batch status
    setProductionOrders((prev) =>
      prev.map((b) => {
        if (b.id === batchId) {
          return {
            ...b,
            status: "Completado",
            actualRoastedKg: actualKg,
            lossPercent: loss,
            notes: notes ? `${b.notes ? b.notes + ' - ' : ''}${notes}` : b.notes,
          };
        }
        return b;
      })
    );

    // 2. Deduct green coffee stock from green lots
    if (batch.isBlend && batch.blendComponents && batch.blendComponents.length > 0) {
      batch.blendComponents.forEach((comp) => {
        setGreenCoffeeReceipts((prev) =>
          prev.map((lot) => {
            if (lot.id === comp.greenLotId || lot.lotNumber === comp.greenLotNumber) {
              const newAvailable = Math.max(0, lot.availableKg - comp.greenKg);
              return { ...lot, availableKg: newAvailable, status: newAvailable === 0 ? "Agotado" : "En Stock" };
            }
            return lot;
          })
        );

        const prevLot = greenCoffeeReceipts.find((l) => l.id === comp.greenLotId || l.lotNumber === comp.greenLotNumber);
        const prevStock = prevLot ? prevLot.availableKg : comp.greenKg;
        const movGreen: StockMovement = {
          id: `mov-stk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          orgId: currentOrg.id,
          date: nowDate,
          time: nowTime,
          itemType: "CAFE_VERDE",
          itemId: comp.greenLotId,
          itemName: comp.origin || "Café Verde (Blend)",
          lotNumber: comp.greenLotNumber,
          type: "CONSUMO_TUESTE",
          quantityKg: -comp.greenKg,
          previousStockKg: prevStock,
          newStockKg: Math.max(0, prevStock - comp.greenKg),
          referenceDocument: `${batch.code} (${batch.batchNumber})`,
          reason: `Consumo para blend ${batch.productName} (${comp.percentage}%)`,
          authorizedBy: currentUser.name,
          userRole: currentUser.role,
        };
        setStockMovements((prev) => [movGreen, ...prev]);
      });
    } else {
      const greenLot = greenCoffeeReceipts.find(
        (l) => l.lotNumber === batch.greenLotNumber || l.id === batch.greenLotNumber || l.region.includes(batch.greenCoffeeOrigin)
      ) || greenCoffeeReceipts[0];

      if (greenLot) {
        const consumedKg = batch.greenCoffeeKg;
        const prevAvailable = greenLot.availableKg;
        const newAvailable = Math.max(0, prevAvailable - consumedKg);

        setGreenCoffeeReceipts((prev) =>
          prev.map((l) =>
            l.id === greenLot.id ? { ...l, availableKg: newAvailable, status: newAvailable === 0 ? "Agotado" : "En Stock" } : l
          )
        );

        const movGreen: StockMovement = {
          id: `mov-stk-${Date.now()}`,
          orgId: currentOrg.id,
          date: nowDate,
          time: nowTime,
          itemType: "CAFE_VERDE",
          itemId: greenLot.id,
          itemName: `${greenLot.originCountry} ${greenLot.region}`,
          lotNumber: greenLot.lotNumber,
          type: "CONSUMO_TUESTE",
          quantityKg: -consumedKg,
          previousStockKg: prevAvailable,
          newStockKg: newAvailable,
          referenceDocument: `${batch.code} (${batch.batchNumber})`,
          reason: `Carga a tostadora ${batch.roasterMachine}`,
          authorizedBy: currentUser.name,
          userRole: currentUser.role,
        };
        setStockMovements((prev) => [movGreen, ...prev]);
      }
    }

    // 3. Increase roasted coffee product stock
    const targetProduct = products.find((p) => p.id === batch.productId || p.name.toLowerCase() === batch.productName.toLowerCase());
    const prevProdStock = targetProduct ? targetProduct.stock : 0;
    const newProdStock = prevProdStock + actualKg;

    if (targetProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === targetProduct.id ? { ...p, stock: newProdStock } : p))
      );
    }

    // 4. Record stock movement for roasted coffee production
    const movRoasted: StockMovement = {
      id: `mov-stk-tost-${Date.now()}`,
      orgId: currentOrg.id,
      date: nowDate,
      time: nowTime,
      itemType: "CAFE_TOSTADO",
      itemId: targetProduct?.id || batch.productId,
      itemName: batch.productName,
      lotNumber: batch.batchNumber,
      type: "PRODUCCION_TOSTADO",
      quantityKg: actualKg,
      previousStockKg: prevProdStock,
      newStockKg: newProdStock,
      referenceDocument: batch.code,
      reason: `Tueste completado. Merma real: ${loss}%`,
      authorizedBy: currentUser.name,
      userRole: currentUser.role,
      notes: `Verde cargado: ${batch.greenCoffeeKg} Kg -> Tostado obtenido: ${actualKg} Kg`,
    };
    setStockMovements((prev) => [movRoasted, ...prev]);

    logAudit("COMPLETAR_TUESTE", "PRODUCCION", batchId, `Tueste ${batch.batchNumber}: ${actualKg} Kg (${loss}% merma)`);
  };

  const addGreenCoffeeReceipt = (receiptData: Partial<GreenCoffeeReceipt>): GreenCoffeeReceipt => {
    const lotNum = receiptData.lotNumber || `LOT-GV-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${String(greenCoffeeReceipts.length + 1).padStart(2, "0")}`;
    const remNum = receiptData.receiptNumber || `REM-VERDE-${String(greenCoffeeReceipts.length + 4895)}`;
    const totalKg = (receiptData.bagCount || 1) * (receiptData.kgPerBag || 60);

    const newReceipt: GreenCoffeeReceipt = {
      id: `rec-verde-${Date.now()}`,
      orgId: currentOrg.id,
      receiptNumber: remNum,
      lotNumber: lotNum,
      date: receiptData.date || new Date().toISOString().split("T")[0],
      supplier: receiptData.supplier || "Importador Directo",
      originCountry: receiptData.originCountry || "Colombia",
      region: receiptData.region || "Huila",
      farmOrProducer: receiptData.farmOrProducer || "",
      variety: receiptData.variety || "Caturra / Castillo",
      process: receiptData.process || "Lavado",
      altitudeMeters: receiptData.altitudeMeters || 1600,
      bagCount: receiptData.bagCount || 10,
      kgPerBag: receiptData.kgPerBag || 60,
      totalGreenKg: receiptData.totalGreenKg || totalKg,
      availableKg: receiptData.availableKg !== undefined ? receiptData.availableKg : (receiptData.totalGreenKg || totalKg),
      costPerKgUSD: receiptData.costPerKgUSD || 6.5,
      warehouseLocation: receiptData.warehouseLocation || "Silo Verde 01 - CABA",
      humidityPercent: receiptData.humidityPercent || 11.0,
      screenSize: receiptData.screenSize || "17/18 Supremo",
      sensoryNotes: receiptData.sensoryNotes || "",
      scaScore: receiptData.scaScore || 85.0,
      status: "En Stock",
      registeredBy: currentUser.name,
      notes: receiptData.notes || "",
    };

    setGreenCoffeeReceipts((prev) => [newReceipt, ...prev]);

    // Record Stock Movement
    const newMovement: StockMovement = {
      id: `mov-stk-${Date.now()}`,
      orgId: currentOrg.id,
      date: newReceipt.date,
      time: new Date().toLocaleTimeString().slice(0, 5),
      itemType: "CAFE_VERDE",
      itemId: newReceipt.id,
      itemName: `${newReceipt.originCountry} ${newReceipt.region} (${newReceipt.farmOrProducer || newReceipt.supplier})`,
      lotNumber: newReceipt.lotNumber,
      type: "ENTRADA_REMITO_VERDE",
      quantityKg: newReceipt.totalGreenKg,
      previousStockKg: 0,
      newStockKg: newReceipt.totalGreenKg,
      referenceDocument: newReceipt.receiptNumber,
      reason: `Recepción de Café Verde - Remito ${newReceipt.receiptNumber}`,
      authorizedBy: currentUser.name,
      userRole: currentUser.role,
      notes: `${newReceipt.bagCount} sacos de ${newReceipt.kgPerBag} Kg (${newReceipt.process}, ${newReceipt.variety})`,
    };
    setStockMovements((prev) => [newMovement, ...prev]);

    logAudit("RECEPCION_CAFE_VERDE", "STOCK_VERDE", newReceipt.id, `Remito ${newReceipt.receiptNumber} - Lote ${newReceipt.lotNumber} (${newReceipt.totalGreenKg} Kg)`);
    return newReceipt;
  };

  const dispatchOrderRemito = (orderId: string, remitoNumber?: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const remNum = remitoNumber || `REM-DESP-${String(orders.length + 5120)}`;
    const nowDate = new Date().toISOString().split("T")[0];
    const nowTime = new Date().toLocaleTimeString().slice(0, 5);

    // Deduct stock for each product in the order
    order.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId || p.name === item.productName);
      if (prod) {
        const deductedKg = item.totalKg || (item.quantity * (prod.weightKg || 1));
        const prevStock = prod.stock;
        const newStock = Math.max(0, prevStock - deductedKg);

        setProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, stock: newStock } : p))
        );

        // Record stock movement
        const movOut: StockMovement = {
          id: `mov-stk-out-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          orgId: currentOrg.id,
          date: nowDate,
          time: nowTime,
          itemType: "CAFE_TOSTADO",
          itemId: prod.id,
          itemName: prod.name,
          type: "SALIDA_REMITO_DESPACHO",
          quantityKg: -deductedKg,
          previousStockKg: prevStock,
          newStockKg: newStock,
          referenceDocument: `${remNum} (Pedido ${order.orderNumber})`,
          reason: `Despacho a cliente: ${order.customerName}`,
          authorizedBy: currentUser.name,
          userRole: currentUser.role,
        };
        setStockMovements((prev) => [movOut, ...prev]);
      }
    });

    // Update order status
    updateOrderStatus(orderId, "Despachado", { deliveryDate: nowDate, notes: `${order.notes ? order.notes + ' - ' : ''}Despachado bajo Remito ${remNum}` });
    logAudit("DESPACHO_REMITO", "LOGISTICA", orderId, `Despacho de pedido ${order.orderNumber} con Remito ${remNum}`);
  };

  const adjustStock = (adjustmentData: {
    itemType: "CAFE_VERDE" | "CAFE_TOSTADO";
    itemId: string;
    adjustmentKg: number;
    reason: string;
    notes?: string;
    supervisorAuthCode?: string;
  }): { success: boolean; message: string } => {
    const isAuthorizedRole = ["ADMIN_EMPRESA", "SUPER_ADMIN", "GERENTE", "PRODUCCION"].includes(currentUser.role);
    const hasValidSupervisorCode = adjustmentData.supervisorAuthCode === "CHERRY2026" || adjustmentData.supervisorAuthCode === "1234";

    if (!isAuthorizedRole && !hasValidSupervisorCode) {
      return {
        success: false,
        message: "No autorizado. El ajuste de stock requiere perfil Directivo/Jefe de Planta o PIN de autorización de supervisor.",
      };
    }

    const nowDate = new Date().toISOString().split("T")[0];
    const nowTime = new Date().toLocaleTimeString().slice(0, 5);
    const isPositive = adjustmentData.adjustmentKg > 0;
    const movType: StockMovementType = isPositive ? "AJUSTE_INVENTARIO_POSITIVO" : "AJUSTE_INVENTARIO_NEGATIVO";

    if (adjustmentData.itemType === "CAFE_VERDE") {
      const greenLot = greenCoffeeReceipts.find((l) => l.id === adjustmentData.itemId);
      if (!greenLot) return { success: false, message: "Lote de café verde no encontrado." };

      const prevStock = greenLot.availableKg;
      const newStock = Math.max(0, prevStock + adjustmentData.adjustmentKg);

      setGreenCoffeeReceipts((prev) =>
        prev.map((l) => (l.id === greenLot.id ? { ...l, availableKg: newStock, status: newStock === 0 ? "Agotado" : "En Stock" } : l))
      );

      const mov: StockMovement = {
        id: `mov-adj-${Date.now()}`,
        orgId: currentOrg.id,
        date: nowDate,
        time: nowTime,
        itemType: "CAFE_VERDE",
        itemId: greenLot.id,
        itemName: `${greenLot.originCountry} ${greenLot.region}`,
        lotNumber: greenLot.lotNumber,
        type: movType,
        quantityKg: adjustmentData.adjustmentKg,
        previousStockKg: prevStock,
        newStockKg: newStock,
        reason: adjustmentData.reason,
        authorizedBy: currentUser.name,
        userRole: currentUser.role,
        notes: adjustmentData.notes || `Ajuste manual autorizado por ${currentUser.name}`,
      };
      setStockMovements((prev) => [mov, ...prev]);
      logAudit("AJUSTE_STOCK_VERDE", "STOCK_VERDE", greenLot.id, `Ajuste de ${adjustmentData.adjustmentKg} Kg en ${greenLot.lotNumber}. Motivo: ${adjustmentData.reason}`);

      return {
        success: true,
        message: `Ajuste de ${adjustmentData.adjustmentKg > 0 ? '+' : ''}${adjustmentData.adjustmentKg} Kg aplicado correctamente a lote verde ${greenLot.lotNumber}. Nuevo stock: ${newStock} Kg.`,
      };
    } else {
      const prod = products.find((p) => p.id === adjustmentData.itemId);
      if (!prod) return { success: false, message: "Producto no encontrado." };

      const prevStock = prod.stock;
      const newStock = Math.max(0, prevStock + adjustmentData.adjustmentKg);

      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, stock: newStock } : p))
      );

      const mov: StockMovement = {
        id: `mov-adj-${Date.now()}`,
        orgId: currentOrg.id,
        date: nowDate,
        time: nowTime,
        itemType: "CAFE_TOSTADO",
        itemId: prod.id,
        itemName: prod.name,
        type: movType,
        quantityKg: adjustmentData.adjustmentKg,
        previousStockKg: prevStock,
        newStockKg: newStock,
        reason: adjustmentData.reason,
        authorizedBy: currentUser.name,
        userRole: currentUser.role,
        notes: adjustmentData.notes || `Ajuste manual autorizado por ${currentUser.name}`,
      };
      setStockMovements((prev) => [mov, ...prev]);
      logAudit("AJUSTE_STOCK_TOSTADO", "STOCK_TOSTADO", prod.id, `Ajuste de ${adjustmentData.adjustmentKg} Kg en ${prod.name}. Motivo: ${adjustmentData.reason}`);

      return {
        success: true,
        message: `Ajuste de ${adjustmentData.adjustmentKg > 0 ? '+' : ''}${adjustmentData.adjustmentKg} Kg aplicado correctamente al producto ${prod.name}. Nuevo stock: ${newStock} Kg.`,
      };
    }
  };

  const createServiceTicket = (ticketData: Partial<ServiceTicket>): ServiceTicket => {
    const newTicket: ServiceTicket = {
      id: `tck-${Date.now()}`,
      orgId: currentOrg.id,
      ticketNumber: `TCK-${serviceTickets.length + 1050}`,
      customerId: ticketData.customerId || "",
      customerName: ticketData.customerName || "",
      customerPhone: ticketData.customerPhone || "",
      machineId: ticketData.machineId || "",
      machineCode: ticketData.machineCode || "",
      machineModel: ticketData.machineModel || "",
      createdAt: new Date().toISOString(),
      priority: ticketData.priority || "Media",
      reportedProblem: ticketData.reportedProblem || "",
      description: ticketData.description || "",
      status: "Abierto",
      laborCostUSD: 0,
      totalCostUSD: 0,
      underWarranty: ticketData.underWarranty ?? true,
    };

    setServiceTickets((prev) => [newTicket, ...prev]);

    // Update machine status
    if (newTicket.machineId) {
      updateMachine(newTicket.machineId, { status: "En Service" });
    }

    logAudit("CREAR_TICKET_SERVICE", "SERVICE", newTicket.id, `Ticket ${newTicket.ticketNumber} para ${newTicket.machineModel}`);
    return newTicket;
  };

  const updateServiceTicket = (id: string, updates: Partial<ServiceTicket>) => {
    setServiceTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    logAudit("ACTUALIZAR_TICKET_SERVICE", "SERVICE", id, JSON.stringify(updates));
  };

  const registerCRMVisit = (visitData: Partial<CRMVisit>): CRMVisit => {
    const newVisit: CRMVisit = {
      id: `vis-${Date.now()}`,
      orgId: currentOrg.id,
      date: visitData.date || new Date().toISOString().split("T")[0],
      time: visitData.time || new Date().toLocaleTimeString().slice(0, 5),
      customerId: visitData.customerId || "",
      customerName: visitData.customerName || "",
      preventistaId: currentUser.id,
      preventistaName: currentUser.name,
      purpose: visitData.purpose || "Toma de Pedido",
      outcome: visitData.outcome || "Pedido Generado",
      generatedOrderId: visitData.generatedOrderId,
      orderAmount: visitData.orderAmount,
      orderKg: visitData.orderKg,
      customerSatisfaction: visitData.customerSatisfaction || 5,
      notes: visitData.notes || "",
      nextAction: visitData.nextAction,
      nextActionDate: visitData.nextActionDate,
    };

    setCrmVisits((prev) => [newVisit, ...prev]);
    logAudit("REGISTRAR_VISITA", "CRM", newVisit.id, `Visita a ${newVisit.customerName} (${newVisit.purpose})`);
    return newVisit;
  };

  const recordCollectionFollowUp = (followUp: Partial<CollectionFollowUp>) => {
    const newLog: CollectionFollowUp = {
      id: `col-${Date.now()}`,
      orgId: currentOrg.id,
      customerId: followUp.customerId || "",
      customerName: followUp.customerName || "",
      date: new Date().toISOString().split("T")[0],
      agentName: currentUser.name,
      channel: followUp.channel || "WhatsApp",
      overdueAmount: followUp.overdueAmount || 0,
      result: followUp.result || "Promesa de Pago",
      promisedPaymentDate: followUp.promisedPaymentDate,
      notes: followUp.notes || "",
    };

    setCollectionLogs((prev) => [newLog, ...prev]);
    logAudit("GESTION_COBRANZA", "COBRANZAS", followUp.customerId || "", `${followUp.channel}: ${followUp.result}`);
  };

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const resetToDemoData = () => {
    setCustomers(initialCustomers);
    setProducts(initialProducts);
    setOrders(initialOrders);
    setMachines(initialMachines);
    setInvoices(initialInvoices);
    setAccountMovements(initialAccountMovements);
    setProductionOrders(initialProductionOrders);
    setGreenCoffeeReceipts(initialGreenCoffeeReceipts);
    setStockMovements(initialStockMovements);
    setDeliveryRoutes(initialDeliveryRoutes);
    setServiceTickets(initialServiceTickets);
    setCrmVisits(initialCRMVisits);
    setAlerts(initialAlerts);
    localStorage.clear();
    logAudit("RESET_DEMO_DATA", "SISTEMA", "all", "Base de datos restaurada a demo original");
  };

  const queryCherryAI = async (prompt: string, history?: { sender: string; text: string }[]): Promise<string> => {
    try {
      const businessContext = {
        organization: currentOrg.name,
        currency: currentOrg.currency,
        customersCount: customers.length,
        activeCustomersCount: customers.filter((c) => c.status === "Activo").length,
        riskCustomers: customers
          .filter((c) => c.scoring === "Riesgo" || c.scoring === "Riesgo Crítico")
          .map((c) => ({
            name: c.commercialName,
            scoring: c.scoring,
            consumptionDrop: `${c.consumptionChangePercent}%`,
            overdueDebt: c.overdueDebt,
          })),
        overdueOrders: orders
          .filter((o) => o.status !== "Entregado" && o.status !== "Facturado" && o.status !== "Cobrado" && new Date(o.promisedDate) < new Date())
          .map((o) => ({
            orderNumber: o.orderNumber,
            customer: o.customerName,
            promisedDate: o.promisedDate,
            totalKg: o.totalKg,
            status: o.status,
          })),
        deliveredUnbilledOrders: orders
          .filter((o) => o.isDeliveredUninvoiced)
          .map((o) => ({
            orderNumber: o.orderNumber,
            customer: o.customerName,
            totalAmount: o.totalAmount,
            deliveredDate: o.deliveryDate,
          })),
        machinesOverview: {
          total: machines.length,
          consignedCount: machines.filter((m) => m.modality === "Comodato / Consignación").length,
          inServiceCount: machines.filter((m) => m.status === "En Service" || m.status === "Requiere Mantenimiento").length,
          unprofitableMachines: machines
            .filter((m) => m.modality === "Comodato / Consignación" && m.recoveryPercent < 100 && (m.installedAgeMonths || 0) > 12)
            .map((m) => ({
              code: m.code,
              model: m.model,
              customer: m.customerName,
              recoveryPercent: `${m.recoveryPercent}%`,
              ageMonths: m.installedAgeMonths,
            })),
        },
        financials: {
          totalReceivables: customers.reduce((sum, c) => sum + c.currentAccountBalance, 0),
          totalOverdueDebt: customers.reduce((sum, c) => sum + c.overdueDebt, 0),
        },
      };

      const response = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, businessContext, history }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      return data.reply || "No se obtuvo respuesta del asistente.";
    } catch (err: any) {
      console.error("AI Query failed, running local heuristic analysis:", err);
      // Local fallback with real calculations
      return `**Análisis Operativo CHERRY AI (Local):**
- **Clientes en Riesgo:** ${customers.filter((c) => c.scoring === "Riesgo" || c.scoring === "Riesgo Crítico").map((c) => `${c.commercialName} (${c.consumptionChangePercent}%)`).join(", ")}
- **Pedidos Atrasados:** ${orders.filter((o) => o.status !== "Entregado" && o.status !== "Facturado" && o.status !== "Cobrado" && new Date(o.promisedDate) < new Date()).length} pedidos
- **Entregados sin facturar:** ${orders.filter((o) => o.isDeliveredUninvoiced).length} pedidos por facturar
- **Deuda Total Vencida:** $${customers.reduce((sum, c) => sum + c.overdueDebt, 0).toLocaleString()}`;
    }
  };

  return (
    <AppContext.Provider
      value={{
        organizations,
        currentOrg,
        setCurrentOrgId,
        currentUser,
        setCurrentUserId,
        users,
        customers,
        products,
        orders,
        machines,
        invoices,
        accountMovements,
        productionOrders,
        greenCoffeeReceipts,
        stockMovements,
        deliveryRoutes,
        serviceTickets,
        crmVisits,
        collectionLogs,
        alerts,
        auditLogs,
        activeTab,
        setActiveTab,
        selectedCustomerId,
        setSelectedCustomerId,
        selectedMachineId,
        setSelectedMachineId,
        isSearchOpen,
        setIsSearchOpen,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        addCustomer,
        updateCustomer,
        createOrder,
        updateOrderStatus,
        repeatLastCustomerOrder,
        dispatchOrderRemito,
        addMachine,
        updateMachine,
        addMachineMovement,
        updateMachineContract,
        renewMachineContract,
        scheduleMachineRetrieval,
        uploadMachineContractScan,
        createInvoiceForOrder,
        createManualInvoice,
        registerPayment,
        addGreenCoffeeReceipt,
        addProductionBatch,
        completeProductionBatch,
        adjustStock,
        createServiceTicket,
        updateServiceTicket,
        registerCRMVisit,
        recordCollectionFollowUp,
        dismissAlert,
        resetToDemoData,
        queryCherryAI,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
