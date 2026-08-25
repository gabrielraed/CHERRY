import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar } from "./components/layout/Sidebar";
import { ExecutiveDashboard } from "./components/dashboard/ExecutiveDashboard";
import { CustomersView } from "./components/customers/CustomersView";
import { MachinesView } from "./components/machines/MachinesView";
import { OrdersView } from "./components/orders/OrdersView";
import { PreventaMobileView } from "./components/preventa/PreventaMobileView";
import { ProductionView } from "./components/production/ProductionView";
import { LogisticsView } from "./components/logistics/LogisticsView";
import { BillingView } from "./components/billing/BillingView";
import { CurrentAccountView } from "./components/current-account/CurrentAccountView";
import { CollectionsView } from "./components/collections/CollectionsView";
import { ServiceView } from "./components/service/ServiceView";
import { CustomerPortalView } from "./components/portal/CustomerPortalView";
import { MapAndRoutesView } from "./components/maps/MapAndRoutesView";
import { CherryAICopilotModal } from "./components/ai/CherryAICopilotModal";
import { GlobalSearchModal } from "./components/layout/GlobalSearchModal";

const MainContent: React.FC = () => {
  const {
    activeTab,
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    isSearchOpen,
    setIsSearchOpen,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsSearchOpen]);

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] font-sans antialiased selection:bg-[#8E2030] selection:text-white flex flex-col">
      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {activeTab === "dashboard" && <ExecutiveDashboard />}
          {activeTab === "geomap" && <MapAndRoutesView />}
          {activeTab === "preventa" && <PreventaMobileView />}
          {activeTab === "orders" && <OrdersView />}
          {activeTab === "production" && <ProductionView />}
          {activeTab === "logistics" && <LogisticsView />}
          {activeTab === "machines" && <MachinesView />}
          {activeTab === "customers" && <CustomersView />}
          {activeTab === "billing" && <BillingView />}
          {activeTab === "current-account" && <CurrentAccountView />}
          {activeTab === "collections" && <CollectionsView />}
          {activeTab === "service" && <ServiceView />}
          {activeTab === "portal" && <CustomerPortalView />}
        </main>
      </div>

      {isAiDrawerOpen && (
        <CherryAICopilotModal onClose={() => setIsAiDrawerOpen(false)} />
      )}

      {isSearchOpen && (
        <GlobalSearchModal onClose={() => setIsSearchOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
