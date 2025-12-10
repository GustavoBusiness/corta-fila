import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  appointments as initialAppointments,
  services as initialServices,
  professionals as initialProfessionals,
  clients as initialClients,
  products as initialProducts,
  blockedDays as initialBlockedDays,
  blockedTimes as initialBlockedTimes,
  defaultSettings,
  Appointment,
  Service,
  Professional,
  Client,
  Product,
  BlockedDay,
  BlockedTime,
  BusinessSettings
} from '@/lib/mock-data';

interface AppContextType {
  appointments: Appointment[];
  services: Service[];
  professionals: Professional[];
  clients: Client[];
  products: Product[];
  blockedDays: BlockedDay[];
  blockedTimes: BlockedTime[];
  settings: BusinessSettings;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addProfessional: (professional: Omit<Professional, 'id'>) => void;
  updateProfessional: (id: string, data: Partial<Professional>) => void;
  deleteProfessional: (id: string) => void;
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addBlockedDay: (blockedDay: Omit<BlockedDay, 'id'>) => void;
  removeBlockedDay: (id: string) => void;
  addBlockedTime: (blockedTime: Omit<BlockedTime, 'id'>) => void;
  removeBlockedTime: (id: string) => void;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [professionals, setProfessionals] = useState<Professional[]>(initialProfessionals);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>(initialBlockedDays);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>(initialBlockedTimes);
  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem('corta-fila-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  const API_URL = import.meta.env.VITE_API_URL;

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Settings
  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('corta-fila-settings', JSON.stringify(updated));
  };

  // Appointments
  const addAppointment = (appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setAppointments(prev => [...prev, newAppointment].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    }));
  };

  const updateAppointment = (id: string, data: Partial<Appointment>) => {
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, ...data } : apt));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
  };

  // Services
  const addService = (service: Omit<Service, 'id'>) => {
    setServices(prev => [...prev, { ...service, id: generateId() }]);
  };

  const updateService = (id: string, data: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Professionals
  const addProfessional = (professional: Omit<Professional, 'id'>) => {
    const res = fetch(`${API_URL}/employee/create`, {
      method: 'POST',
      body: JSON.stringify(professional),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('cortafila:auth:token')}`
      }
    })

    return res;
  };

  const updateProfessional = (id: string, data: Partial<Professional>) => {
    setProfessionals(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProfessional = (id: string) => {
    setProfessionals(prev => prev.filter(p => p.id !== id));
  };

  // Clients
  const addClient = (client: Omit<Client, 'id'>) => {
    setClients(prev => [...prev, { ...client, id: generateId() }]);
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // Products
  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...product, id: generateId() }]);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Blocked Days
  const addBlockedDay = (blockedDay: Omit<BlockedDay, 'id'>) => {
    setBlockedDays(prev => [...prev, { ...blockedDay, id: generateId() }]);
  };

  const removeBlockedDay = (id: string) => {
    setBlockedDays(prev => prev.filter(b => b.id !== id));
  };

  // Blocked Times
  const addBlockedTime = (blockedTime: Omit<BlockedTime, 'id'>) => {
    setBlockedTimes(prev => [...prev, { ...blockedTime, id: generateId() }]);
  };

  const removeBlockedTime = (id: string) => {
    setBlockedTimes(prev => prev.filter(b => b.id !== id));
  };

  return (
    <AppContext.Provider value={{
      appointments,
      services,
      professionals,
      clients,
      products,
      blockedDays,
      blockedTimes,
      settings,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      addService,
      updateService,
      deleteService,
      addProfessional,
      updateProfessional,
      deleteProfessional,
      addClient,
      updateClient,
      deleteClient,
      addProduct,
      updateProduct,
      deleteProduct,
      addBlockedDay,
      removeBlockedDay,
      addBlockedTime,
      removeBlockedTime,
      updateSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
