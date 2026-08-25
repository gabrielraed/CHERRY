import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { OrderItem, OrderPriority, DeliveryModality, GrindType } from "../../types";
import { X, Plus, Trash2 } from "lucide-react";

interface NewOrderModalProps {
  initialCustomerId?: string;
  onClose: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ initialCustomerId, onClose }) => {
  const { customers, products, createOrder, currentOrg } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState(
    initialCustomerId || customers[0]?.id || ""
  );
  const [priority, setPriority] = useState<OrderPriority>("Normal");
  const [deliveryModality, setDeliveryModality] = useState<DeliveryModality>("Reparto Propio");
  const [promisedDate, setPromisedDate] = useState(
    new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<OrderItem[]>([
    {
      id: "it-1",
      productId: products[0]?.id || "",
      productName: products[0]?.name || "",
      grind: "Grano Entero",
      quantity: 10,
      unitPrice: products[0]?.priceA || 22,
      totalKg: 10,
      subtotal: (products[0]?.priceA || 22) * 10,
    },
  ]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleAddItem = () => {
    const defaultProduct = products[0];
    setItems([
      ...items,
      {
        id: `it-${Date.now()}`,
        productId: defaultProduct?.id || "",
        productName: defaultProduct?.name || "",
        grind: "Grano Entero",
        quantity: 5,
        unitPrice: defaultProduct?.priceA || 22,
        totalKg: 5,
        subtotal: (defaultProduct?.priceA || 22) * 5,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };

    if (field === "productId") {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        current.productName = prod.name;
        current.unitPrice = prod.priceA;
        current.totalKg = current.quantity * prod.weightKg;
        current.subtotal = current.quantity * prod.priceA;
      }
    } else if (field === "quantity") {
      const qty = Number(value);
      const prod = products.find((p) => p.id === current.productId);
      const weightPerUnit = prod ? prod.weightKg : 1;
      current.quantity = qty;
      current.totalKg = qty * weightPerUnit;
      current.subtotal = qty * current.unitPrice;
    } else if (field === "unitPrice") {
      const price = Number(value);
      current.unitPrice = price;
      current.subtotal = current.quantity * price;
    }

    updated[index] = current;
    setItems(updated);
  };

  const totalKg = items.reduce((sum, it) => sum + it.totalKg, 0);
  const subtotal = items.reduce((sum, it) => sum + it.subtotal, 0);
  const taxAmount = subtotal * (currentOrg.settings.vatRate / 100);
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert("Por favor selecciona un cliente.");
      return;
    }

    createOrder({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.commercialName,
      customerTaxId: selectedCustomer.taxId,
      customerAddress: selectedCustomer.address,
      customerZone: selectedCustomer.zone,
      items,
      totalKg,
      subtotal,
      taxAmount,
      totalAmount,
      priority,
      deliveryModality,
      promisedDate,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4 backdrop-blur-xs overflow-y-auto text-[#1A1A1A]">
      <div className="relative w-full max-w-3xl rounded-xl border border-[#1A1A1A]/10 bg-white shadow-2xl overflow-hidden my-6">
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 bg-[#F9F7F2] px-6 py-4">
          <div>
            <span className="font-sans text-[9px] uppercase tracking-[0.25em] font-semibold text-[#8E2030]">
              Nueva Orden Comercial
            </span>
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Ingresar Pedido de Café</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#1A1A1A]/50 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar text-xs font-sans">
          {/* Customer Selection & Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Cliente *</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] focus:border-[#1A1A1A] outline-none"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.commercialName} ({c.zone} - {c.segment})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Fecha Prometida de Entrega</label>
              <input
                type="date"
                value={promisedDate}
                onChange={(e) => setPromisedDate(e.target.value)}
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] focus:border-[#1A1A1A] outline-none"
              />
            </div>
          </div>

          {selectedCustomer && (
            <div className="rounded-lg bg-[#F9F7F2] p-3.5 border border-[#1A1A1A]/10 flex items-center justify-between text-[11px]">
              <div>
                <span className="text-[#1A1A1A]/50">Entrega en:</span>{" "}
                <span className="text-[#1A1A1A] font-semibold">{selectedCustomer.address} ({selectedCustomer.zone})</span>
              </div>
              <div>
                <span className="text-[#1A1A1A]/50">Condición de pago:</span>{" "}
                <span className="text-[#8E2030] font-bold">{selectedCustomer.paymentTermDays} días</span>
              </div>
            </div>
          )}

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2">
              <h4 className="font-serif text-sm font-bold text-[#1A1A1A]">
                Ítems del Pedido ({items.length})
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#8E2030] hover:text-[#6E131F] uppercase tracking-wider"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Agregar Producto</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((it, idx) => (
                <div
                  key={it.id}
                  className="grid grid-cols-12 gap-2.5 items-center rounded-lg border border-[#1A1A1A]/10 bg-[#F9F7F2] p-3 shadow-2xs"
                >
                  <div className="col-span-12 sm:col-span-4">
                    <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/50 block mb-0.5 sm:hidden">Producto</label>
                    <select
                      value={it.productId}
                      onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                      className="w-full rounded-md border border-[#1A1A1A]/15 bg-white px-2.5 py-1.5 text-[#1A1A1A] outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/50 block mb-0.5 sm:hidden">Molienda</label>
                    <select
                      value={it.grind}
                      onChange={(e) => handleItemChange(idx, "grind", e.target.value as GrindType)}
                      className="w-full rounded-md border border-[#1A1A1A]/15 bg-white px-2.5 py-1.5 text-[#1A1A1A] outline-none"
                    >
                      <option value="Grano Entero">Grano Entero</option>
                      <option value="Espresso">Espresso</option>
                      <option value="Filtro / V60">Filtro / V60</option>
                      <option value="Prensa Francesa">Prensa Francesa</option>
                      <option value="Cold Brew">Cold Brew</option>
                    </select>
                  </div>

                  <div className="col-span-3 sm:col-span-2">
                    <label className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/50 block mb-0.5 sm:hidden">Cant (Un)</label>
                    <input
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      className="w-full rounded-md border border-[#1A1A1A]/15 bg-white px-2 py-1.5 text-[#1A1A1A] text-center outline-none"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-2 text-right">
                    <span className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/50 block sm:hidden">Subtotal</span>
                    <span className="font-serif font-bold text-sm text-[#1A1A1A]">${it.subtotal.toFixed(0)}</span>
                    <span className="block text-[10px] text-[#1A1A1A]/50">{it.totalKg} Kg</span>
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-[#1A1A1A]/40 hover:text-[#8E2030] p-1 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#1A1A1A]/10">
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Modalidad de Envío</label>
              <select
                value={deliveryModality}
                onChange={(e) => setDeliveryModality(e.target.value as any)}
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
              >
                <option value="Reparto Propio">Reparto Propio (Furgón Cherry Tost)</option>
                <option value="Retiro en Tostaduría">Retiro en Tostaduría</option>
                <option value="Encomienda / Expreso">Encomienda / Expreso</option>
                <option value="Moto Express">Moto Express</option>
              </select>
            </div>

            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
              >
                <option value="Normal">Normal</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Notas de Entrega / Preparación</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Entregar antes de las 11 hs por apertura de local"
              className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
            />
          </div>

          {/* Financial Totals */}
          <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-4 space-y-1.5 text-xs">
            <div className="flex justify-between text-[#1A1A1A]/60">
              <span>Volumen Total de Café:</span>
              <span className="font-bold text-[#8E2030]">{totalKg} Kg</span>
            </div>
            <div className="flex justify-between text-[#1A1A1A]/60">
              <span>Subtotal Neto:</span>
              <span className="font-semibold text-[#1A1A1A]">${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#1A1A1A]/60">
              <span>IVA ({currentOrg.settings.vatRate}%):</span>
              <span className="font-semibold text-[#1A1A1A]">${taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#1A1A1A] pt-2 border-t border-[#1A1A1A]/10">
              <span className="font-serif">Total Pedido:</span>
              <span className="font-serif text-lg font-black text-[#1A1A1A]">${totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#1A1A1A]/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#1A1A1A]/15 bg-white px-4 py-2 text-[#1A1A1A]/70 hover:bg-[#F2EFE9] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#1A1A1A] px-5 py-2 font-semibold text-white shadow-xs hover:bg-[#8E2030] transition-colors"
            >
              Confirmar e Ingresar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
