/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TabType, Client, Appointment, ServiceItem, ProductItem, Transaction } from './types';
import {
  loadInitialData,
  subscribeToUserData,
  syncLocalDataToFirestoreIfEmpty,
  saveToLocalStorage,
  persistClient,
  persistAppointment,
  persistAppointmentStatus,
  persistService,
  persistProduct,
  persistProductStock,
  persistTransaction,
  removeTransaction,
  removeClient,
  removeAppointment,
  removeService,
} from './services/dataService';
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

  // Core Data States with offline/local persistence
  const [initialData] = useState(() => loadInitialData());
  const [clients, setClients] = useState<Client[]>(initialData.clients);
  const [appointments, setAppointments] = useState<Appointment[]>(initialData.appointments);
  const [services, setServices] = useState<ServiceItem[]>(initialData.services);
  const [products, setProducts] = useState<ProductItem[]>(initialData.products);
  const [transactions, setTransactions] = useState<Transaction[]>(initialData.transactions);

  // Keep local storage up to date on changes
  useEffect(() => {
    saveToLocalStorage('lume_data_clients', clients);
  }, [clients]);

  useEffect(() => {
    saveToLocalStorage('lume_data_appointments', appointments);
  }, [appointments]);

  useEffect(() => {
    saveToLocalStorage('lume_data_services', services);
  }, [services]);

  useEffect(() => {
    saveToLocalStorage('lume_data_products', products);
  }, [products]);

  useEffect(() => {
    saveToLocalStorage('lume_data_transactions', transactions);
  }, [transactions]);

  // Real-time Firestore synchronization when logged in
  useEffect(() => {
    if (!user?.uid) return;

    // Listen to real-time changes from Firestore database
    const unsubscribe = subscribeToUserData(user.uid, (data) => {
      if (data.clients) setClients(data.clients);
      if (data.appointments) setAppointments(data.appointments);
      if (data.services) setServices(data.services);
      if (data.products) setProducts(data.products);
      if (data.transactions) setTransactions(data.transactions);
    });

    // Sync any existing initial data to Firestore if the user cloud collection is currently blank
    syncLocalDataToFirestoreIfEmpty(user.uid, {
      clients,
      appointments,
      services,
      products,
      transactions,
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Handlers with Firestore persistence
  const handleAddAppointment = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
    persistAppointment(newApt, user?.uid);

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
      persistTransaction(newTx, user?.uid);
    }
  };

  const handleAddClient = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
    persistClient(newClient, user?.uid);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
    persistClient(updatedClient, user?.uid);
  };

  const handleDeleteClient = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    removeClient(clientId, user?.uid);
  };

  const handleToggleArchiveClient = (clientId: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const updated = { ...c, archived: !c.archived };
          persistClient(updated, user?.uid);
          return updated;
        }
        return c;
      })
    );
  };

  const handleAddService = (newService: ServiceItem) => {
    setServices((prev) => [...prev, newService]);
    persistService(newService, user?.uid);
  };

  const handleAddProduct = (newProduct: ProductItem) => {
    setProducts((prev) => [...prev, newProduct]);
    persistProduct(newProduct, user?.uid);
  };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    persistTransaction(newTx, user?.uid);
  };

  const handleUpdateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    );
    persistAppointmentStatus(id, status, user?.uid);

    // Synchronize transactions: remove if canceled, restore if confirmed/concluded
    if (status === 'cancelado') {
      setTransactions((prev) => prev.filter((tx) => tx.id !== `tx-apt-${id}`));
      removeTransaction(`tx-apt-${id}`, user?.uid);
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
            persistTransaction(restoredTx, user?.uid);
            return [restoredTx, ...prev];
          }
        }
        return prev;
      });
    }
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
    removeAppointment(id, user?.uid);
    // Also clean up linked transaction if present
    setTransactions((prev) => prev.filter((tx) => tx.id !== `tx-apt-${id}`));
    removeTransaction(`tx-apt-${id}`, user?.uid);
  };

  const handleUpdateStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStock = Math.max(0, p.stock + delta);
          persistProductStock(id, newStock, user?.uid);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  };

  const handleSelectServiceForAppointment = (_serviceId: string) => {
    setNewAppointmentOpen(true);
  };

  const handleUpdateService = (updatedService: ServiceItem) => {
    setServices((prev) =>
      prev.map((s) => (s.id === updatedService.id ? updatedService : s))
    );
    persistService(updatedService, user?.uid);
  };

  const handleDeleteService = (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    removeService(serviceId, user?.uid);
  };

  const handleToggleArchiveService = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          const updated = { ...s, archived: !s.archived };
          persistService(updated, user?.uid);
          return updated;
        }
        return s;
      })
    );
  };

  const handleUpdateServicePostCare = (serviceId: string, postCare: string, imageUrl?: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          const updated = {
            ...s,
            postCareInstructions: postCare,
            postCareImageUrl:
              imageUrl === ''
                ? undefined
                : imageUrl !== undefined
                ? imageUrl
                : s.postCareImageUrl,
          };
          persistService(updated, user?.uid);
          return updated;
        }
        return s;
      })
    );
  };

  const handleUpdateClientPhone = (clientId: string, phone: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const updated = { ...c, phone };
          persistClient(updated, user?.uid);
          return updated;
        }
        return c;
      })
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
              appointments={appointments}
              onOpenNewClient={() => setNewClientOpen(true)}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
              onToggleArchiveClient={handleToggleArchiveClient}
            />
          )}

          {activeTab === 'agendamentos' && (
            <AgendamentosView
              appointments={appointments}
              clients={clients}
              services={services}
              onOpenNewAppointment={() => setNewAppointmentOpen(true)}
              onUpdateStatus={handleUpdateAppointmentStatus}
              onDeleteAppointment={handleDeleteAppointment}
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
              onDeleteService={handleDeleteService}
              onToggleArchiveService={handleToggleArchiveService}
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
          clients={clients.filter((c) => !c.archived)}
          services={services.filter((s) => !s.archived)}
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
