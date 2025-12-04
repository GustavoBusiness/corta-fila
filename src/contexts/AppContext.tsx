import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  appointments as initialAppointments, 
  services as initialServices,
  professionals as initialProfessionals,
  clients as initialClients,
  products as initialProducts,
  blockedDays as initialBlockedDays,
  Appointment, 
  Service, 
  Professional, 
  Client, 
  Product,
  BlockedDay
} from '@/lib/mock-data';

interface AppContextType {
  appointments: Appointment[];
  services: Service[];
  professionals: Professional[];
  clients: Client[];
  products: Product[];
  blockedDays: BlockedDay[];
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [professionals, setProfessionals] = useState<Professional[]>(initialProfessionals);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>(initialBlockedDays);

  const generateId = () => Math.random().toString(36).substr(2, 9);

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
    setProfessionals(prev => [...prev, { ...professional, id: generateId() }]);
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

  return (
    <AppContext.Provider value={{
      appointments,
      services,
      professionals,
      clients,
      products,
      blockedDays,
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
      removeBlockedDay
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
