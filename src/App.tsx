/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TabType, Client, Appointment, ServiceItem, ProductItem, Transaction } from './types';
import {
  initialClients,
  initialAppointments,
  initialServices,
  initialProducts,
  initialTransactions,
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { AuthModal } from './components/AuthModal';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { NewClientModal } from './components/NewClientModal';
import { LogoUploadModal } from './components/LogoUploadModal';

// Views
import { HomeView } from './views/HomeView';
import { ClientesView } from './views/ClientesView';
import { AgendamentosView } from './views/AgendamentosView';
import { FinanceiroView } from './views/FinanceiroView';
import { ProdutosView } from './views/ProdutosView';
import { ServicosView } from './views/ServicosView';

function MainApp() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);

  // Studio Logo state (stored locally in browser for the aesthetician)
  const [studioLogo, setStudioLogo] = useState<string | null>(() => {
    return localStorage.getItem('lume_studio_logo') || null;
  });

  const handleSaveLogo = (logo: string | null) => {
    setStudioLogo(logo);
    if (logo) {
      localStorage.setItem('lume_studio_logo', logo);
    } else {
      localStorage.removeItem('lume_studio_logo');
    }
  };

  // Core Data States
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Handlers
  const handleAddAppointment = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);

    // Only register in transactions if not canceled
    if (newApt.status !== 'cancelado') {
      const newTx: Transaction = {
        id: `tx-apt-${newApt.id}`,
        description: `${newApt.serviceName} - ${newApt.clientName}`,
        type: 'receita',
        amount: newApt.price,
        date: newApt.date,
        category: 'Procedimento Facial',
        paymentMethod: 'Pix',
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const handleAddClient = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
  };

  const handleAddService = (newService: ServiceItem) => {
    setServices((prev) => [...prev, newService]);
  };

  const handleAddProduct = (newProduct: ProductItem) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleUpdateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    );

    // Synchronize transactions: remove if canceled, restore if confirmed/concluded
    if (status === 'cancelado') {
      setTransactions((prev) => prev.filter((tx) => tx.id !== `tx-apt-${id}`));
    } else {
      setTransactions((prev) => {
        const exists = prev.some((tx) => tx.id === `tx-apt-${id}`);
        if (!exists) {
          const target = appointments.find((a) => a.id === id);
          if (target) {
            const restoredTx: Transaction = {
              id: `tx-apt-${id}`,
              description: `${target.serviceName} - ${target.clientName}`,
              type: 'receita',
              amount: target.price,
              date: target.date,
              category: 'Procedimento Facial',
              paymentMethod: 'Pix',
            };
            return [restoredTx, ...prev];
          }
        }
        return prev;
      });
    }
  };

  const handleUpdateStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      )
    );
  };

  const handleSelectServiceForAppointment = (serviceId: string) => {
    setNewAppointmentOpen(true);
  };

  const handleUpdateService = (updatedService: ServiceItem) => {
    setServices((prev) =>
      prev.map((s) => (s.id === updatedService.id ? updatedService : s))
    );
  };

  const handleUpdateServicePostCare = (serviceId: string, postCare: string, imageUrl?: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? { ...s, postCareInstructions: postCare, postCareImageUrl: imageUrl !== undefined ? imageUrl : s.postCareImageUrl }
          : s
      )
    );
  };

  const handleUpdateClientPhone = (clientId: string, phone: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, phone } : c))
    );
  };

  return (
    <div className="min-h-screen bg-[#FBF8F6] text-[#373331] flex flex-col antialiased selection:bg-[#F5D8DB] selection:text-[#7A363C]">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenAuth={() => setAuthModalOpen(true)}
        appointmentsCountToday={appointments.length}
        studioLogo={studioLogo}
        onOpenLogoModal={() => setLogoModalOpen(true)}
      />

      {/* Main Content Area (offset by 256px on desktop) */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-200">
        {/* Top bar with breadcrumb and quick action */}
        <TopHeader
          activeTab={activeTab}
          onOpenSidebar={() => setSidebarOpen(true)}
          onNewAppointment={() => setNewAppointmentOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
        />

        {/* Dynamic Section View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'home' && (
            <HomeView
              appointments={appointments}
              clients={clients}
              services={services}
              products={products}
              onOpenNewAppointment={() => setNewAppointmentOpen(true)}
              onOpenNewClient={() => setNewClientOpen(true)}
              onNavigate={setActiveTab}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            />
          )}

          {activeTab === 'clientes' && (
            <ClientesView
              clients={clients}
              onOpenNewClient={() => setNewClientOpen(true)}
            />
          )}

          {activeTab === 'agendamentos' && (
            <AgendamentosView
              appointments={appointments}
              clients={clients}
              services={services}
              onOpenNewAppointment={() => setNewAppointmentOpen(true)}
              onUpdateStatus={handleUpdateAppointmentStatus}
              onUpdateClientPhone={handleUpdateClientPhone}
              onUpdateServicePostCare={handleUpdateServicePostCare}
            />
          )}

          {activeTab === 'financeiro' && (
            <FinanceiroView
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
            />
          )}

          {activeTab === 'produtos' && (
            <ProdutosView
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateStock={handleUpdateStock}
            />
          )}

          {activeTab === 'servicos' && (
            <ServicosView
              services={services}
              onAddService={handleAddService}
              onSelectForAppointment={handleSelectServiceForAppointment}
              onUpdateService={handleUpdateService}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      {newAppointmentOpen && (
        <NewAppointmentModal
          isOpen={newAppointmentOpen}
          onClose={() => setNewAppointmentOpen(false)}
          clients={clients}
          services={services}
          onAddAppointment={handleAddAppointment}
        />
      )}

      {newClientOpen && (
        <NewClientModal
          isOpen={newClientOpen}
          onClose={() => setNewClientOpen(false)}
          onAddClient={handleAddClient}
        />
      )}

      {logoModalOpen && (
        <LogoUploadModal
          isOpen={logoModalOpen}
          onClose={() => setLogoModalOpen(false)}
          currentLogo={studioLogo}
          onSaveLogo={handleSaveLogo}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
