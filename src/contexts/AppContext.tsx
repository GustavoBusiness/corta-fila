import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
import { EmployeeService } from '@/services/EmployeeService';
import { Employee } from '@/types/Employee';

interface AppContextType {
  appointments: Appointment[];
  services: Service[];
  professionals: Professional[] | Employee[];
  clients: Client[];
  products: Product[];
  blockedDays: BlockedDay[];
  blockedTimes: BlockedTime[];
  settings: BusinessSettings;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;

  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;

  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;

  addProfessional: (professional: any) => Promise<any>;
  updateProfessional: (id: string, data: any) => Promise<any>;
  deleteProfessional: (id: string) => Promise<any>;

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
  const [professionals, setProfessionals] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>(initialBlockedDays);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>(initialBlockedTimes);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem('corta-fila-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // Carregar profissionais do backend ao montar o componente
  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        setLoading(true);
        const data = await EmployeeService.list();
        setProfessionals(data);
      } catch (error) {
        console.error('Erro ao carregar profissionais:', error);
        // Fallback para dados mockados em caso de erro
        setProfessionals(initialProfessionals as unknown as Employee[]);
      } finally {
        setLoading(false);
      }
    };

    loadProfessionals();
  }, []);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // ---------------- SETTINGS ----------------
  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('corta-fila-settings', JSON.stringify(updated));
  };

  // ---------------- APPOINTMENTS ----------------
  const addAppointment = (appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    setAppointments(prev =>
      [...prev, newAppointment].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      })
    );
  };

  const updateAppointment = (id: string, data: Partial<Appointment>) => {
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, ...data } : apt));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
  };

  // ---------------- SERVICES ----------------
  const addService = async (service: Omit<Service, 'id'>) => {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/services/create`, {
        method: 'POST',
        body: JSON.stringify(service),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("cortafila:auth:token")}`
        }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        return { success: false, message: err?.message || 'Erro na requisição' };
      }

      const data = await res.json();

      return data;
    } catch {
      return { success: false, message: 'Erro de conexão com o servidor' };
    } finally {
      setLoading(false);
    }
  };

  const updateService = (id: string, data: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // ---------------- PROFESSIONALS ----------------
  const addProfessional = async (professional: any) => {
    setLoading(true);

    try {
      const newProfessional = await EmployeeService.create(professional);
      setProfessionals(prev => [...prev, newProfessional]);
      return { success: true, data: newProfessional };
    } catch (error: any) {
      const message = error?.message || 'Erro ao criar profissional';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfessional = async (id: string, data: any) => {
    setLoading(true);

    try {
      const updated = await EmployeeService.update(id, data);
      setProfessionals(prev => prev.map(p => p.id === id ? updated : p));
      return { success: true, data: updated };
    } catch (error: any) {
      const message = error?.message || 'Erro ao atualizar profissional';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const deleteProfessional = async (id: string) => {
    setLoading(true);

    try {
      await EmployeeService.remove(id);
      setProfessionals(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (error: any) {
      const message = error?.message || 'Erro ao excluir profissional';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- CLIENTS ----------------
  const addClient = (client: Omit<Client, 'id'>) => {
    setClients(prev => [...prev, { ...client, id: generateId() }]);
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // ---------------- PRODUCTS ----------------
  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...product, id: generateId() }]);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // ---------------- BLOCKED DAYS ----------------
  const addBlockedDay = (blockedDay: Omit<BlockedDay, 'id'>) => {
    setBlockedDays(prev => [...prev, { ...blockedDay, id: generateId() }]);
  };

  const removeBlockedDay = (id: string) => {
    setBlockedDays(prev => prev.filter(b => b.id !== id));
  };

  // ---------------- BLOCKED TIMES ----------------
  const addBlockedTime = (blockedTime: Omit<BlockedTime, 'id'>) => {
    setBlockedTimes(prev => [...prev, { ...blockedTime, id: generateId() }]);
  };

  const removeBlockedTime = (id: string) => {
    setBlockedTimes(prev => prev.filter(b => b.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        appointments,
        services,
        professionals,
        clients,
        products,
        blockedDays,
        blockedTimes,
        settings,
        loading,
        setLoading,
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
      }}
    >
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
