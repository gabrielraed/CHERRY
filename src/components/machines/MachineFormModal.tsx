import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { MachineModality, MachineStatus } from "../../types";
import { X, Upload, FileText, Calendar, Coffee, MapPin } from "lucide-react";
import { GoogleMapLocationPicker } from "../common/GoogleMapLocationPicker";

interface MachineFormModalProps {
  onClose: () => void;
}

export const MachineFormModal: React.FC<MachineFormModalProps> = ({ onClose }) => {
  const { addMachine, customers } = useApp();

  const [brand, setBrand] = useState("La Marzocco");
  const [model, setModel] = useState("Linea PB 2G");
  const [code, setCode] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [type, setType] = useState("Espresso 2 Grupos");
  const [capacity, setCapacity] = useState("Dual boiler 2 grupos");
  const [purchaseCostUSD, setPurchaseCostUSD] = useState(8500);
  const [modality, setModality] = useState<MachineModality>("Comodato / Consignación");
  const [status, setStatus] = useState<MachineStatus>("Operativa");
  const [selectedCustomerId, setSelectedCustomerIdState] = useState(customers[0]?.id || "");
  
  // Geographical location
  const initialCustomer = customers.find((c) => c.id === (customers[0]?.id || ""));
  const [locationAddress, setLocationAddress] = useState(initialCustomer?.address || "Gorriti 4812, Palermo");
  const [lat, setLat] = useState<number | undefined>(initialCustomer?.lat ?? -34.5885);
  const [lng, setLng] = useState<number | undefined>(initialCustomer?.lng ?? -58.4289);

  // Consignment Contract parameters
  const [contractNumber, setContractNumber] = useState(`CT-COMODATO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [contractStartDate, setContractStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [contractTermMonths, setContractTermMonths] = useState(24);
  const [contractExpirationDate, setContractExpirationDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 24);
    return d.toISOString().split("T")[0];
  });
  const [minimumMonthlyKg, setMinimumMonthlyKg] = useState(60);
  const [contractFileName, setContractFileName] = useState("");
  const [contractScanUrl, setContractScanUrl] = useState("");

  const [nextServiceDate, setNextServiceDate] = useState(
    new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0]
  );

  // Sync customer location when customer changes
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerIdState(customerId);
    const cust = customers.find((c) => c.id === customerId);
    if (cust) {
      if (cust.address) setLocationAddress(cust.address);
      if (cust.lat !== undefined) setLat(cust.lat);
      if (cust.lng !== undefined) setLng(cust.lng);
    }
  };

  const handleTermMonthsChange = (months: number) => {
    setContractTermMonths(months);
    const start = new Date(contractStartDate || new Date());
    start.setMonth(start.getMonth() + months);
    setContractExpirationDate(start.toISOString().split("T")[0]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setContractFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setContractScanUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find((c) => c.id === selectedCustomerId);

    addMachine({
      brand,
      model,
      code: code || undefined,
      serialNumber: serialNumber || `SN-${Date.now().toString().slice(-6)}`,
      type,
      capacity,
      purchaseCostUSD: Number(purchaseCostUSD),
      currentValueUSD: Number(purchaseCostUSD),
      modality,
      status,
      customerId: modality === "Comodato / Consignación" || modality === "Vendida" ? customer?.id : undefined,
      customerName: modality === "Comodato / Consignación" || modality === "Vendida" ? customer?.commercialName : undefined,
      locationAddress: locationAddress || customer?.address,
      lat: lat ?? customer?.lat,
      lng: lng ?? customer?.lng,
      installationDate: modality === "Comodato / Consignación" ? contractStartDate : undefined,
      contractNumber: modality === "Comodato / Consignación" ? contractNumber : undefined,
      contractStartDate: modality === "Comodato / Consignación" ? contractStartDate : undefined,
      contractExpirationDate: modality === "Comodato / Consignación" ? contractExpirationDate : undefined,
      contractTermMonths: modality === "Comodato / Consignación" ? contractTermMonths : undefined,
      contractStatus: modality === "Comodato / Consignación" ? "Vigente" : undefined,
      minimumMonthlyKg: modality === "Comodato / Consignación" ? minimumMonthlyKg : undefined,
      contractFileName: contractFileName || (modality === "Comodato / Consignación" ? `Contrato_Comodato_${brand}_${model}.pdf` : undefined),
      contractScanUrl: contractScanUrl || undefined,
      contractUploadedAt: modality === "Comodato / Consignación" ? new Date().toISOString() : undefined,
      nextServiceDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4 backdrop-blur-xs overflow-y-auto text-[#1A1A1A]">
      <div className="relative w-full max-w-2xl rounded-xl border border-[#1A1A1A]/10 bg-white shadow-2xl overflow-hidden my-6">
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 bg-[#F9F7F2] px-6 py-4">
          <div>
            <span className="font-sans text-[9px] uppercase tracking-[0.25em] font-semibold text-[#8E2030]">
              Parque de Maquinaria &amp; Geoposicionamiento
            </span>
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Alta de Nueva Máquina / Molino</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#1A1A1A]/50 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto custom-scrollbar text-xs font-sans">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Marca *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="La Marzocco / Nuova Simonelli / Mahlkönig"
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] focus:border-[#1A1A1A] outline-none"
              />
            </div>
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Modelo *</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Linea PB / Aurelia / EK43"
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] focus:border-[#1A1A1A] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Código de Activo</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Autogenerado (Ej: M-00512)"
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
              />
            </div>
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Número de Serie (S/N)</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="LM-2025-PB-994"
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Modalidad de Explotación *</label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value as any)}
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] font-semibold outline-none"
              >
                <option value="Comodato / Consignación">☕ Comodato / Consignación</option>
                <option value="Vendida">💼 Vendida</option>
                <option value="Depósito / Disponible">🏢 Depósito / Disponible</option>
                <option value="En Reparación">🔧 En Reparación / Taller</option>
              </select>
            </div>
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Costo de Compra (USD)</label>
              <input
                type="number"
                value={purchaseCostUSD}
                onChange={(e) => setPurchaseCostUSD(Number(e.target.value))}
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
              />
            </div>
          </div>

          {/* Customer Assignment (for Comodato / Consignación or Vendida) */}
          {(modality === "Comodato / Consignación" || modality === "Vendida") && (
            <div className="rounded-xl border border-[#8E2030]/20 bg-[#F9F7F2] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#8E2030]" />
                  <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#8E2030]">
                    {modality === "Comodato / Consignación" ? "Contrato de Consignación & Asignación" : "Asignación de Venta & Cliente"}
                  </h4>
                </div>
              </div>

              <div>
                <label className="block text-[#1A1A1A]/60 text-[10px] uppercase tracking-wider mb-1">Cliente Receptor / Comprador</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full rounded-md border border-[#1A1A1A]/15 bg-white px-2.5 py-1.5 text-[#1A1A1A] font-medium outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.commercialName} — {c.address} ({c.zone}) [{c.status}]
                    </option>
                  ))}
                </select>
              </div>

              {modality === "Comodato / Consignación" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#1A1A1A]/60 text-[10px] uppercase tracking-wider mb-1">Nº Contrato</label>
                      <input
                        type="text"
                        value={contractNumber}
                        onChange={(e) => setContractNumber(e.target.value)}
                        className="w-full rounded-md border border-[#1A1A1A]/15 bg-white px-2.5 py-1.5 text-[#1A1A1A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1A1A1A]/60 text-[10px] uppercase tracking-wider mb-1">Plazo de Comodato</label>
                      <select
                        value={contractTermMonths}
                        onChange={(e) => handleTermMonthsChange(Number(e.target.value))}
                        className="w-full rounded-md border border-[#1A1A1A]/15 bg-white px-2.5 py-1.5 text-[#1A1A1A] outline-none"
                      >
                        <option value={12}>12 Meses (1 año)</option>
                        <option value={24}>24 Meses (2 años)</option>
                        <option value={36}>36 Meses (3 años)</option>
                        <option value={48}>48 Meses (4 años)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#1A1A1A]/60 text-[10px] uppercase tracking-wider mb-1">Fecha de Inicio / Firma</label>
                      <input
                        type="date"
                        value={contractStartDate}
                        onChange={(e) => setContractStartDate(e.target.value)}
                        className="w-full rounded-md border border-[#1A1A1A]/15 bg-white px-2.5 py-1.5 text-[#1A1A1A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1A1A1A]/60 text-[10px] uppercase tracking-wider mb-1">Fecha de Vencimiento</label>
                      <input
                        type="date"
                        value={contractExpirationDate}
                        onChange={(e) => setContractExpirationDate(e.target.value)}
                        className="w-full rounded-md border border-[#1A1A1A]/15 bg-white px-2.5 py-1.5 text-[#1A1A1A] font-bold text-[#8E2030] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#1A1A1A]/60 text-[10px] uppercase tracking-wider mb-1">Compromiso Café (Kg/m)</label>
                      <input
                        type="number"
                        min="1"
                        value={minimumMonthlyKg}
                        onChange={(e) => setMinimumMonthlyKg(Number(e.target.value))}
                        className="w-full rounded-md border border-[#1A1A1A]/15 bg-white px-2.5 py-1.5 text-[#1A1A1A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1A1A1A]/60 text-[10px] uppercase tracking-wider mb-1">Cargar Contrato Escaneado</label>
                      <label className="flex items-center justify-center gap-1.5 rounded-md border border-dashed border-[#1A1A1A]/20 bg-white px-2.5 py-1.5 text-xs text-[#1A1A1A]/70 cursor-pointer hover:bg-[#F2EFE9] transition-colors truncate">
                        <Upload className="h-3.5 w-3.5 text-[#8E2030]" />
                        <span className="truncate">{contractFileName || "Subir PDF / Escaneo"}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Geographical Location & Google Maps Picker */}
          <div>
            <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Dirección de Instalación / Emplazamiento
            </label>
            <input
              type="text"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="Ej: Gorriti 4812, Palermo Soho / Planta Central"
              className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none mb-3"
            />

            <GoogleMapLocationPicker
              lat={lat}
              lng={lng}
              address={locationAddress}
              onChange={({ lat: newLat, lng: newLng, address: newAddr }) => {
                setLat(newLat);
                setLng(newLng);
                if (newAddr && !locationAddress) {
                  setLocationAddress(newAddr);
                }
              }}
              title="Posición Geográfica de la Máquina en Google Maps"
              helperText="Permite ubicar esta máquina en el mapa satelital para planificar mantenimientos y rutas de visita técnica."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Tipo de Máquina</label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
              />
            </div>
            <div>
              <label className="block text-[#1A1A1A]/70 font-semibold mb-1 uppercase tracking-wider text-[10px]">Próximo Service Estimado</label>
              <input
                type="date"
                value={nextServiceDate}
                onChange={(e) => setNextServiceDate(e.target.value)}
                className="w-full rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-3 py-2 text-[#1A1A1A] outline-none"
              />
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
              Dar de Alta Máquina
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
