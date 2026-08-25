import React, { useState, useRef } from "react";
import { Machine } from "../../types";
import { useApp } from "../../context/AppContext";
import {
  X,
  FileText,
  Upload,
  Download,
  Printer,
  Calendar,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  ExternalLink,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface ContractScanModalProps {
  machine: Machine;
  onClose: () => void;
  onOpenRenewModal?: () => void;
  onOpenRetrievalModal?: () => void;
}

export const ContractScanModal: React.FC<ContractScanModalProps> = ({
  machine,
  onClose,
  onOpenRenewModal,
  onOpenRetrievalModal,
}) => {
  const { uploadMachineContractScan, updateMachineContract } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<"viewer" | "details" | "history">("viewer");

  // Calculate days to expiration
  const expDateStr = machine.contractExpirationDate || "2026-09-15";
  const expDate = new Date(expDateStr);
  const now = new Date();
  const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const isExpired = diffDays < 0;
  const isExpiringSoon = diffDays >= 0 && diffDays <= 30;

  const handleFileUpload = (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      uploadMachineContractScan(machine.id, {
        fileName: file.name,
        scanUrl: result,
        notes: `Contrato digital subido el ${new Date().toLocaleDateString()}`,
      });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/50 p-3 sm:p-5 backdrop-blur-xs overflow-y-auto text-[#1A1A1A]">
      <div className="relative flex max-h-[94vh] w-full max-w-4xl flex-col rounded-xl border border-[#1A1A1A]/10 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 bg-[#F9F7F2] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8E2030] text-white shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
                  Contrato de Comodato / Consignación
                </h2>
                <span className="font-mono text-xs font-bold text-[#8E2030] bg-[#8E2030]/10 px-2 py-0.5 rounded border border-[#8E2030]/20">
                  {machine.contractNumber || "CT-COMODATO-2024-019"}
                </span>
              </div>
              <p className="font-sans text-xs text-[#1A1A1A]/60 mt-0.5">
                Activo: <strong className="text-[#1A1A1A]">{machine.brand} {machine.model}</strong> ({machine.code}) • Cliente: <strong className="text-[#1A1A1A]">{machine.customerName || "Sin asignar"}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border border-[#1A1A1A]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1A1A] hover:bg-[#F2EFE9] transition-colors shadow-2xs"
            >
              <Upload className="h-3.5 w-3.5 text-[#8E2030]" />
              <span>Cargar / Reemplazar Escaneo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={onClose}
              className="rounded-lg border border-[#1A1A1A]/10 bg-white p-2 text-[#1A1A1A]/50 hover:bg-[#F2EFE9] hover:text-[#1A1A1A] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Expiration Banner & Status Alert */}
        <div
          className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
            isExpired
              ? "bg-[#8E2030]/10 border-[#8E2030]/30 text-[#8E2030]"
              : isExpiringSoon
              ? "bg-[#C2823D]/10 border-[#C2823D]/30 text-[#C2823D]"
              : "bg-emerald-900/10 border-emerald-700/20 text-emerald-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isExpired ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-[#8E2030]" />
            ) : isExpiringSoon ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-[#C2823D]" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
            )}
            <div>
              <span className="font-bold">
                {isExpired
                  ? `🚨 CONTRATO VENCIDO HACE ${Math.abs(diffDays)} DÍAS`
                  : isExpiringSoon
                  ? `⚠ CONTRATO POR VENCER EN ${diffDays} DÍAS`
                  : `✓ CONTRATO VIGENTE (${diffDays} días restantes)`}
              </span>
              <span className="opacity-80 ml-2">
                (Fecha de Vencimiento: <strong>{expDateStr}</strong> • Vigencia inicial: {machine.contractStartDate || machine.installationDate || "2024-03-12"})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenRenewModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRenewModal();
                }}
                className="flex items-center gap-1 rounded bg-[#8E2030] px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-[#721926] transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Renovar Contrato</span>
              </button>
            )}
            {onOpenRetrievalModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRetrievalModal();
                }}
                className="flex items-center gap-1 rounded border border-[#1A1A1A]/30 bg-white px-3 py-1 text-xs font-bold text-[#1A1A1A] hover:bg-[#F2EFE9] transition-colors"
              >
                <span>Programar Retiro</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1A1A1A]/10 bg-[#F9F7F2] px-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab("viewer")}
            className={`flex items-center gap-2 border-b-2 py-2.5 px-3 transition-colors ${
              activeTab === "viewer"
                ? "border-[#8E2030] font-bold text-[#8E2030]"
                : "border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
            }`}
          >
            <FileCheck className="h-3.5 w-3.5" />
            <span>Documento Escaneado</span>
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`flex items-center gap-2 border-b-2 py-2.5 px-3 transition-colors ${
              activeTab === "details"
                ? "border-[#8E2030] font-bold text-[#8E2030]"
                : "border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
            }`}
          >
            <Building className="h-3.5 w-3.5" />
            <span>Cláusulas &amp; Compromisos</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 border-b-2 py-2.5 px-3 transition-colors ${
              activeTab === "history"
                ? "border-[#8E2030] font-bold text-[#8E2030]"
                : "border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Historial de Renovaciones ({machine.contractRenewalHistory?.length || 0})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#F4F1EA]/50">
          {activeTab === "viewer" && (
            <div className="space-y-4">
              {/* Document Toolbar */}
              <div className="flex items-center justify-between rounded-lg border border-[#1A1A1A]/10 bg-white p-2.5 shadow-2xs">
                <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/70">
                  <FileText className="h-4 w-4 text-[#8E2030]" />
                  <span className="font-semibold">{machine.contractFileName || "Contrato_Comodato_CafeRoma_Firmado.pdf"}</span>
                  <span className="text-[10px] text-[#1A1A1A]/40">
                    • Subido: {machine.contractUploadedAt ? new Date(machine.contractUploadedAt).toLocaleDateString() : "12/03/2024"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoomLevel((prev) => Math.max(70, prev - 10))}
                    className="p-1 rounded text-[#1A1A1A]/60 hover:bg-[#F2EFE9] hover:text-[#1A1A1A]"
                    title="Reducir zoom"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-[11px] font-mono text-[#1A1A1A]/70">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((prev) => Math.min(150, prev + 10))}
                    className="p-1 rounded text-[#1A1A1A]/60 hover:bg-[#F2EFE9] hover:text-[#1A1A1A]"
                    title="Aumentar zoom"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <div className="h-4 w-px bg-[#1A1A1A]/20 mx-1" />
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 p-1 px-2 rounded text-xs text-[#1A1A1A]/70 hover:bg-[#F2EFE9] hover:text-[#1A1A1A]"
                    title="Imprimir contrato"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

              {/* Scanned Document Canvas / Visual Paper */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative mx-auto rounded-lg border-2 bg-white p-8 shadow-md transition-all ${
                  dragActive ? "border-[#8E2030] bg-[#8E2030]/5" : "border-[#1A1A1A]/15"
                }`}
                style={{ maxWidth: `${Math.round(720 * (zoomLevel / 100))}px` }}
              >
                {/* Visual Watermark */}
                <div className="absolute right-6 top-6 rounded-md border border-[#8E2030]/40 bg-[#8E2030]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8E2030] rotate-[-5deg]">
                  COMODATO REGISTRADO
                </div>

                {/* Legal Document Mock Header */}
                <div className="border-b border-[#1A1A1A]/20 pb-4 text-center">
                  <h3 className="font-serif text-lg font-black uppercase tracking-wider text-[#1A1A1A]">
                    CONTRATO DE COMODATO Y CESIÓN DE EQUIPAMIENTO CAFETERÍA
                  </h3>
                  <p className="font-mono text-xs text-[#1A1A1A]/60 mt-1">
                    Nº IDENTIFICADOR: {machine.contractNumber || "CT-COMODATO-2024-019"}
                  </p>
                </div>

                {/* Legal Body Simulation */}
                <div className="mt-6 space-y-4 text-[11px] leading-relaxed text-[#1A1A1A]/80 font-sans text-justify">
                  <p>
                    En la Ciudad Autónoma de Buenos Aires, con fecha <strong>{machine.contractStartDate || machine.installationDate || "12 de Marzo de 2024"}</strong>, entre <strong>CHERRY TOSTADORES S.R.L.</strong> (el &quot;COMODANTE&quot;), y por la otra parte <strong>{machine.customerName || "Café Roma Specialty"}</strong>, con domicilio en <strong>{machine.locationAddress || "Gorriti 4812, Palermo Soho"}</strong> (el &quot;COMODATARIO&quot;), convienen en celebrar el presente contrato de comodato y provisión exclusiva:
                  </p>

                  <div className="rounded border border-[#1A1A1A]/10 bg-[#F9F7F2] p-3 space-y-1">
                    <p className="font-bold text-[#1A1A1A]">PRIMERA: OBJETO Y EQUIPAMIENTO ENTREGADO</p>
                    <p>
                      El COMODANTE cede en calidad de comodato gratuito al COMODATARIO el siguiente equipamiento de su propiedad exclusiva:
                    </p>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[#1A1A1A]">
                      <li><strong>Equipo:</strong> {machine.brand} {machine.model} (Código: {machine.code})</li>
                      <li><strong>Número de Serie:</strong> {machine.serialNumber}</li>
                      <li><strong>Valor Declarado de Reposición:</strong> USD ${machine.purchaseCostUSD.toLocaleString()}</li>
                      <li><strong>Filtro &amp; Accesorios:</strong> Brita Purity C300, portafiltros dobles y ciegos</li>
                    </ul>
                  </div>

                  <div className="rounded border border-[#1A1A1A]/10 bg-[#F9F7F2] p-3 space-y-1">
                    <p className="font-bold text-[#1A1A1A]">SEGUNDA: VIGENCIA Y FECHA DE VENCIMIENTO</p>
                    <p>
                      El presente contrato tendrá una vigencia pactada de <strong>{machine.contractTermMonths || 30} meses</strong>, iniciando el día <strong>{machine.contractStartDate || machine.installationDate || "12/03/2024"}</strong> y teniendo su <strong>FECHA DE VENCIMIENTO DEFINITIVO EL {expDateStr}</strong>.
                    </p>
                    <p className="text-[10px] text-[#8E2030] font-semibold">
                      * Cumplido el plazo, ambas partes deberán acordar expresamente la renovación mediante adenda o bien el COMODANTE procederá al retiro del activo previa coordinación técnica.
                    </p>
                  </div>

                  <div className="rounded border border-[#1A1A1A]/10 bg-[#F9F7F2] p-3 space-y-1">
                    <p className="font-bold text-[#1A1A1A]">TERCERA: COMPROMISO DE CONSUMO MENSUAL DE CAFÉ</p>
                    <p>
                      El COMODATARIO asume el compromiso obligatorio de comprar exclusivamente café tostado de especialidad provisto por el COMODANTE, fijando una cuota mensual mínima de <strong>{machine.minimumMonthlyKg || 60} Kg / mes</strong>.
                    </p>
                  </div>

                  {/* Signatures & Seal Box */}
                  <div className="mt-8 pt-6 border-t border-dashed border-[#1A1A1A]/20 grid grid-cols-2 gap-8 text-center text-[10px]">
                    <div className="space-y-1">
                      <div className="h-12 border-b border-[#1A1A1A]/40 flex items-end justify-center pb-1">
                        <span className="font-serif italic font-bold text-[#8E2030] text-sm">Martín Palermo</span>
                      </div>
                      <p className="font-bold text-[#1A1A1A]">Por CHERRY TOSTADORES S.R.L.</p>
                      <p className="text-[#1A1A1A]/50">Director Comercial</p>
                    </div>

                    <div className="space-y-1">
                      <div className="h-12 border-b border-[#1A1A1A]/40 flex items-end justify-center pb-1">
                        <span className="font-serif italic font-bold text-[#1A1A1A] text-sm">{machine.customerName || "Firma Titular"}</span>
                      </div>
                      <p className="font-bold text-[#1A1A1A]">Por {machine.customerName || "EL CLIENTE"}</p>
                      <p className="text-[#1A1A1A]/50">Titular / Representante Legal</p>
                    </div>
                  </div>
                </div>

                {/* Upload drag drop overlay prompt */}
                {dragActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-lg">
                    <Upload className="h-10 w-10 text-[#8E2030] animate-bounce" />
                    <p className="font-bold text-[#1A1A1A] mt-2">Suelta aquí el archivo escaneado (PDF/Imagen)</p>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg border border-[#1A1A1A]/20 bg-white px-3.5 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#F2EFE9] transition-colors shadow-2xs"
                  >
                    <Upload className="h-3.5 w-3.5 text-[#8E2030]" />
                    <span>Subir nuevo escaneo de contrato firmado</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenRenewModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenRenewModal();
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-[#8E2030] px-4 py-2 text-xs font-bold text-white hover:bg-[#721926] transition-colors shadow-xs"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Renovar o Extender Plazo</span>
                    </button>
                  )}
                  {onOpenRetrievalModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenRetrievalModal();
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-[#1A1A1A]/30 bg-white px-4 py-2 text-xs font-bold text-[#1A1A1A] hover:bg-[#F2EFE9] transition-colors shadow-2xs"
                    >
                      <span>Programar Retiro de Máquina</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 space-y-4 shadow-2xs">
                <h4 className="font-serif text-sm font-bold text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-2">
                  Términos Legales &amp; Compromisos Comerciales
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-[#F9F7F2] border border-[#1A1A1A]/5">
                    <span className="text-[#1A1A1A]/50 block">Plazo de Consignación</span>
                    <span className="font-bold text-base text-[#1A1A1A] mt-0.5 block">{machine.contractTermMonths || 30} Meses</span>
                    <span className="text-[11px] text-[#1A1A1A]/60">Desde {machine.contractStartDate || machine.installationDate || "12/03/2024"}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F9F7F2] border border-[#1A1A1A]/5">
                    <span className="text-[#1A1A1A]/50 block">Fecha Vencimiento</span>
                    <span className={`font-bold text-base mt-0.5 block ${isExpired ? "text-[#8E2030]" : isExpiringSoon ? "text-[#C2823D]" : "text-emerald-800"}`}>
                      {expDateStr}
                    </span>
                    <span className="text-[11px] font-semibold">{diffDays < 0 ? `Vencido hace ${Math.abs(diffDays)}d` : `Faltan ${diffDays} días`}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F9F7F2] border border-[#1A1A1A]/5">
                    <span className="text-[#1A1A1A]/50 block">Consumo Mínimo Pactado</span>
                    <span className="font-bold text-base text-[#8E2030] mt-0.5 block">{machine.minimumMonthlyKg || 60} Kg / mes</span>
                    <span className="text-[11px] text-[#1A1A1A]/60">Real actual: {machine.avgMonthlyKg} Kg/m</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#F9F7F2] border border-[#1A1A1A]/10 text-xs space-y-2">
                  <span className="font-bold text-[#1A1A1A] block">Notas y Cláusulas Particulares:</span>
                  <p className="text-[#1A1A1A]/70 leading-relaxed">
                    {machine.contractNotes || "Comodato exclusivo para consumo de Café Especialidad Roma Blend. Retiro sin costo si no alcanza 50Kg/mes por 2 meses consecutivos."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-[#1A1A1A]/10 bg-white p-5 shadow-2xs">
                <h4 className="font-serif text-sm font-bold text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-2 mb-3">
                  Registro de Adendas y Renovaciones de Contrato
                </h4>

                {machine.contractRenewalHistory && machine.contractRenewalHistory.length > 0 ? (
                  <div className="space-y-3">
                    {machine.contractRenewalHistory.map((rec) => (
                      <div key={rec.id} className="p-3 rounded-lg bg-[#F9F7F2] border border-[#1A1A1A]/10 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#8E2030]">Renovación por +{rec.termMonths} meses</span>
                          <span className="text-[11px] text-[#1A1A1A]/50">{rec.date}</span>
                        </div>
                        <p className="text-[#1A1A1A]/70 mt-1">
                          Vencimiento anterior: <span className="line-through">{rec.previousExpirationDate}</span> → Nuevo vencimiento: <strong className="text-[#1A1A1A]">{rec.newExpirationDate}</strong>
                        </p>
                        <p className="text-[#1A1A1A]/60 text-[11px] mt-0.5">
                          Operador: {rec.renewedBy} • {rec.notes || "Renovación conforme acordada con cliente."}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-[#1A1A1A]/50 text-xs">
                    No se han registrado renovaciones anteriores en este equipo. Contrato original vigente.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
