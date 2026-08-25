import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Customer, CustomerSegment, CustomerStatus } from "../../types";
import { X, MapPin, Building2, UserCheck } from "lucide-react";
import { GoogleMapLocationPicker } from "../common/GoogleMapLocationPicker";

interface CustomerFormModalProps {
  customerToEdit?: Customer | null;
  onClose: () => void;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ customerToEdit, onClose }) => {
  const { addCustomer, updateCustomer, currentUser } = useApp();

  const [commercialName, setCommercialName] = useState(customerToEdit?.commercialName || "");
  const [legalName, setLegalName] = useState(customerToEdit?.legalName || "");
  const [taxId, setTaxId] = useState(customerToEdit?.taxId || "");
  const [address, setAddress] = useState(customerToEdit?.address || "");
  const [city, setCity] = useState(customerToEdit?.city || "CABA");
  const [zone, setZone] = useState(customerToEdit?.zone || "Palermo");
  const [lat, setLat] = useState<number | undefined>(customerToEdit?.lat ?? -34.5885);
  const [lng, setLng] = useState<number | undefined>(customerToEdit?.lng ?? -58.4289);
  const [status, setStatus] = useState<CustomerStatus>(customerToEdit?.status || "Activo");
  const [phone, setPhone] = useState(customerToEdit?.phone || "");
  const [email, setEmail] = useState(customerToEdit?.email || "");
  const [segment, setSegment] = useState<CustomerSegment>(customerToEdit?.segment || "Specialty Cafe");
  const [priceTier, setPriceTier] = useState<any>(customerToEdit?.priceTier || "A (Especial)");
  const [paymentTermDays, setPaymentTermDays] = useState(customerToEdit?.paymentTermDays ?? 15);
  const [creditLimit, setCreditLimit] = useState(customerToEdit?.creditLimit ?? 3000);
  const [potentialKgMonth, setPotentialKgMonth] = useState(customerToEdit?.potentialKgMonth ?? 100);
  const [notes, setNotes] = useState(customerToEdit?.notes || "");

  // Primary Contact
  const [contactName, setContactName] = useState(customerToEdit?.contacts?.[0]?.name || "");
  const [contactRole, setContactRole] = useState(customerToEdit?.contacts?.[0]?.role || "Dueño / Encargado");
  const [contactPhone, setContactPhone] = useState(customerToEdit?.contacts?.[0]?.phone || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commercialName || !taxId) {
      alert("Por favor completa el Nombre Comercial y CUIT.");
      return;
    }

    const contacts = [
      {
        id: "c1",
        name: contactName || "Contacto Principal",
        role: contactRole,
        phone: contactPhone || phone,
        email: email,
        isPrimary: true,
      },
    ];

    if (customerToEdit) {
      updateCustomer(customerToEdit.id, {
        commercialName,
        legalName: legalName || commercialName,
        taxId,
        address,
        city,
        zone,
        lat,
        lng,
        status,
        phone,
        email,
        segment,
        priceTier,
        paymentTermDays: Number(paymentTermDays),
        creditLimit: Number(creditLimit),
        potentialKgMonth: Number(potentialKgMonth),
        notes,
        contacts,
      });
    } else {
      addCustomer({
        code: "",
        commercialName,
        legalName: legalName || commercialName,
        taxId,
        address,
        city,
        zone,
        lat,
        lng,
        phone,
        email,
        contacts,
        salesRepId: currentUser.id,
        salesRepName: currentUser.name,
        preventistaId: "usr-preventa",
        preventistaName: "Facundo Rossi",
        paymentTermDays: Number(paymentTermDays),
        creditLimit: Number(creditLimit),
        priceTier,
        status,
        segment,
        scoring: status === "Prospecto" ? "Crecimiento" : "Alto Valor",
        potentialKgMonth: Number(potentialKgMonth),
        notes,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4 backdrop-blur-xs overflow-y-auto text-[#1A1A1A]">
      <div className="relative w-full max-w-2xl rounded-xl border border-[#1A1A1A]/10 bg-white shadow-2xl overflow-hidden my-6">
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 bg-[#F9F7F2] px-6 py-4">
          <div>
            <span className="font-sans text-[9px] uppercase tracking-[0.25em] font-semibold text-[#8E2030]">
              CRM &amp; Clientes / Prospectos
            </span>
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
              {customerToEdit ? `Editar Registro: ${customerToEdit.commercialName}` : "Alta de Cliente / Prospecto"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#1A1A1A]/50 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto custom-scrollbar text-xs font-sans">
          {/* Status / Prospect Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border border-[#1A1A1A]/10 bg-[#FAF8F5]">
            <div>
              <span className="block font-semibold text-[#1A1A1A] uppercase tracking-wider text-[10px]">
                Estado del Registro
              </span>
              <span className="text-[10px] text-[#1A1A1A]/60">
                Determina si es un cliente activo o prospecto para visitas
              </span>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setStatus("Activo")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  status === "Activo"
                    ? "bg-[#1A1A1A] text-white shadow-xs"
                    : "bg-white border border-[#1A1A1A]/15 text-[#1A1A1A]/70 hover:bg-[#F2EFE9]"
                }`}
              >
                🟢 Cliente Activo
              </button>
              <button
                type="button"
                onClick={() => setStatus("Prospecto")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  status === "Prospecto"
                    ? "bg-[#C2823D] text-white shadow-xs"
                    : "bg-white border border-[#1A1A1A]/15 text-[#1A1A1A]/70 hover:bg-[#F2EFE9]"
                }`}
              >
                🟡 Prospecto / Lead
              </button>
              <button
                type="button"
                onClick={() => setStatus("Inactivo")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  status === "Inactivo"
                    ? "bg-[#8E2030] text-white shadow-xs"
                    : "bg-white border border-[#1A1A1A]/15 text-[#1A1A1A]/70 hover:bg-[#F2EFE9]"
                }`}
              >
                ⚪ Inactivo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Nombre Comercial *</label>
              <input
                type="text"
                required
                value={commercialName}
                onChange={(e) => setCommercialName(e.target.value)}
                placeholder="Café Roma Specialty"
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] focus:border-[#1A1A1A] outline-none"
              />
            </div>
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Razón Social</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Café Roma S.A."
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] focus:border-[#1A1A1A] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">CUIT / Tax ID *</label>
              <input
                type="text"
                required
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="30-71112233-4"
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
              />
            </div>
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Segmento</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as any)}
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
              >
                <option value="Specialty Cafe">Specialty Cafe</option>
                <option value="Restaurant / Gastronomía">Restaurant / Gastronomía</option>
                <option value="Hotel">Hotel</option>
                <option value="Oficina / Corporativo">Oficina / Corporativo</option>
                <option value="Distribuidor">Distribuidor</option>
                <option value="Franquicia">Franquicia</option>
              </select>
            </div>
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Zona Geográfica</label>
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="Palermo / Zona Norte"
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
              />
            </div>
          </div>

          {/* Location & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Dirección Completa</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Gorriti 4812, Palermo"
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
              />
            </div>
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Teléfono Principal</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 11 4833-2211"
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
              />
            </div>
          </div>

          {/* Google Maps Interactive Location Picker */}
          <GoogleMapLocationPicker
            lat={lat}
            lng={lng}
            address={address}
            onChange={({ lat: newLat, lng: newLng, address: newAddr }) => {
              setLat(newLat);
              setLng(newLng);
              if (newAddr && !address) {
                setAddress(newAddr);
              }
            }}
            title="Posicionamiento Geográfico en Google Maps"
            helperText="Fija las coordenadas exactas para visualizar en el mapa y optimizar hojas de ruta de visita."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Email Pedidos / Facturación</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pedidos@caferoma.com"
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
              />
            </div>
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Contacto Principal (Nombre)</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Camila Varela"
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
              />
            </div>
          </div>

          {/* Commercial Conditions */}
          <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] p-4 space-y-3">
            <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#8E2030]">
              Condiciones de Crédito &amp; Precios
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[#1A1A1A]/60 text-[10px] uppercase tracking-wider mb-1">Plazo Pago (Días)</label>
                <input
                  type="number"
                  value={paymentTermDays}
                  onChange={(e) => setPaymentTermDays(Number(e.target.value))}
                  className="w-full rounded-md border border-[#1A1A1A]/15 bg-white px-2.5 py-1.5 text-[#1A1A1A] outline-none"
                />
              </div>
              <div>
                <label className="block text-[#1A1A1A]/60 text-[10px] uppercase tracking-wider mb-1">Límite Crédito ($)</label>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(Number(e.target.value))}
                  className="w-full rounded-md border border-[#1A1A1A]/15 bg-white px-2.5 py-1.5 text-[#1A1A1A] outline-none"
                />
              </div>
              <div>
                <label className="block text-[#1A1A1A]/60 text-[10px] uppercase tracking-wider mb-1">Lista Precios</label>
                <select
                  value={priceTier}
                  onChange={(e) => setPriceTier(e.target.value)}
                  className="w-full rounded-md border border-[#1A1A1A]/15 bg-white px-2.5 py-1.5 text-[#1A1A1A] outline-none"
                >
                  <option value="A (Especial)">Tier A (Especial)</option>
                  <option value="B (Estándar)">Tier B (Estándar)</option>
                  <option value="C (Mayorista)">Tier C (Mayorista)</option>
                </select>
              </div>
              <div>
                <label className="block text-[#1A1A1A]/60 text-[10px] uppercase tracking-wider mb-1">Potencial (Kg/m)</label>
                <input
                  type="number"
                  value={potentialKgMonth}
                  onChange={(e) => setPotentialKgMonth(Number(e.target.value))}
                  className="w-full rounded-md border border-[#1A1A1A]/15 bg-white px-2.5 py-1.5 text-[#1A1A1A] outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Observaciones / Notas Internas</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preferencias de tueste, días de entrega preferidos..."
              className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
            />
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
              {customerToEdit ? "Guardar Cambios" : (status === "Prospecto" ? "Crear Prospecto" : "Crear Cliente")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
