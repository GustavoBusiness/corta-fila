// Mock data for the scheduling system

export type ServiceType = 'corte' | 'barba' | 'combo' | 'pigmentacao' | 'hidratacao';

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  price: number;
  duration: number; // in minutes
  description: string;
  color: string; // background color for agenda
}

export interface Professional {
  id: string;
  name: string;
  avatar: string;
  photo?: string;
  role: string;
  phone: string;
  email: string;
  services: string[];
  workDays: number[]; // 0-6 (Sunday-Saturday)
  workHours: { start: string; end: string };
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalVisits: number;
  lastVisit?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  serviceType: ServiceType;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid';
  products?: { productId: string; quantity: number }[];
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

export interface BlockedDay {
  id: string;
  professionalId: string;
  date: string;
  reason?: string;
}

export interface BlockedTime {
  id: string;
  professionalId: string;
  date: string;
  time: string;
  reason?: string;
}

export interface BusinessSettings {
  scheduleMonthsAhead: 1 | 2 | 3;
  timeSlotInterval: 30 | 60;
  inactiveDays: number[]; // 0-6 (Sunday-Saturday)
  whatsappMessage: string;
  showProductsInBooking: boolean;
  businessName: string;
  businessPhone: string;
  businessCnpj: string;
  businessAddress: string;
  companyLogo?: string; // Base64 da logo da empresa
}

export const defaultSettings: BusinessSettings = {
  scheduleMonthsAhead: 1,
  timeSlotInterval: 30,
  inactiveDays: [0], // Sunday inactive by default
  whatsappMessage: `✅ Olá {nome}! Seu agendamento foi confirmado!

📋 *Serviço:* {servico}
👤 *Profissional:* {profissional}
📅 *Data:* {data}
🕐 *Horário:* {horario}

Aguardamos você! 🙏`,
  showProductsInBooking: true,
  businessName: 'Corta Fila Barbearia',
  businessPhone: '(11) 99999-9999',
  businessCnpj: '12.345.678/0001-00',
  businessAddress: 'Rua Exemplo, 123 - Centro'
};

// Service background colors for agenda
export const serviceColors: Record<ServiceType, string> = {
  corte: 'bg-info/30 border-info/50',
  barba: 'bg-warning/30 border-warning/50',
  combo: 'bg-primary/30 border-primary/50',
  pigmentacao: 'bg-purple-500/30 border-purple-500/50',
  hidratacao: 'bg-pink-500/30 border-pink-500/50'
};

export const services: Service[] = [
  {
    id: '1',
    name: 'Corte Masculino',
    type: 'corte',
    price: 45,
    duration: 30,
    description: 'Corte moderno com acabamento perfeito',
    color: 'bg-info/30'
  },
  {
    id: '2',
    name: 'Barba Completa',
    type: 'barba',
    price: 35,
    duration: 25,
    description: 'Barba modelada com toalha quente e produtos premium',
    color: 'bg-warning/30'
  },
  {
    id: '3',
    name: 'Combo Corte + Barba',
    type: 'combo',
    price: 70,
    duration: 50,
    description: 'Pacote completo com desconto especial',
    color: 'bg-primary/30'
  },
  {
    id: '4',
    name: 'Pigmentação',
    type: 'pigmentacao',
    price: 80,
    duration: 45,
    description: 'Coloração natural para barba e cabelo',
    color: 'bg-purple-500/30'
  },
  {
    id: '5',
    name: 'Hidratação Capilar',
    type: 'hidratacao',
    price: 50,
    duration: 40,
    description: 'Tratamento profundo para fios mais saudáveis',
    color: 'bg-pink-500/30'
  }
];

export const professionals: Professional[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    avatar: 'CS',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'Barbeiro Senior',
    phone: '5511999999999',
    email: 'carlos@cortafila.com',
    services: ['1', '2', '3', '4', '5'],
    workDays: [1, 2, 3, 4, 5, 6],
    workHours: { start: '09:00', end: '19:00' }
  },
  {
    id: '2',
    name: 'Pedro Santos',
    avatar: 'PS',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    role: 'Barbeiro Pleno',
    phone: '5511988888888',
    email: 'pedro@cortafila.com',
    services: ['1', '2', '3'],
    workDays: [1, 2, 3, 4, 5],
    workHours: { start: '10:00', end: '20:00' }
  },
  {
    id: '3',
    name: 'Lucas Oliveira',
    avatar: 'LO',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'Barbeiro Junior',
    phone: '5511977777777',
    email: 'lucas@cortafila.com',
    services: ['1', '2'],
    workDays: [2, 3, 4, 5, 6],
    workHours: { start: '08:00', end: '18:00' }
  }
];

export const clients: Client[] = [
  { id: '1', name: 'João Mendes', phone: '5511966666666', totalVisits: 12, lastVisit: '2024-01-10' },
  { id: '2', name: 'Rafael Costa', phone: '5511955555555', totalVisits: 8, lastVisit: '2024-01-08' },
  { id: '3', name: 'Bruno Lima', phone: '5511944444444', totalVisits: 5, lastVisit: '2024-01-05' },
  { id: '4', name: 'Gustavo Rocha', phone: '5511933333333', totalVisits: 3, lastVisit: '2024-01-03' },
  { id: '5', name: 'Felipe Nunes', phone: '5511922222222', totalVisits: 15, lastVisit: '2024-01-12' },
];

const generateAppointments = (): Appointment[] => {
  const today = new Date();
  const appointments: Appointment[] = [];
  
  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
  
  // Generate appointments for the next 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    
    // Random appointments per day
    const numAppointments = Math.floor(Math.random() * 6) + 3;
    const usedTimes: string[] = [];
    
    for (let i = 0; i < numAppointments; i++) {
      let time = times[Math.floor(Math.random() * times.length)];
      while (usedTimes.includes(time)) {
        time = times[Math.floor(Math.random() * times.length)];
      }
      usedTimes.push(time);
      
      const service = services[Math.floor(Math.random() * services.length)];
      const professional = professionals[Math.floor(Math.random() * professionals.length)];
      const client = clients[Math.floor(Math.random() * clients.length)];
      
      appointments.push({
        id: `apt-${day}-${i}`,
        clientId: client.id,
        clientName: client.name,
        clientPhone: client.phone,
        professionalId: professional.id,
        professionalName: professional.name,
        serviceId: service.id,
        serviceName: service.name,
        serviceType: service.type,
        date: dateStr,
        time,
        duration: service.duration,
        price: service.price,
        status: day < 0 ? 'completed' : 'scheduled',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      });
    }
  }
  
  // Add some past appointments
  for (let day = 1; day <= 30; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split('T')[0];
    
    const numAppointments = Math.floor(Math.random() * 8) + 2;
    
    for (let i = 0; i < numAppointments; i++) {
      const time = times[Math.floor(Math.random() * times.length)];
      const service = services[Math.floor(Math.random() * services.length)];
      const professional = professionals[Math.floor(Math.random() * professionals.length)];
      const client = clients[Math.floor(Math.random() * clients.length)];
      
      appointments.push({
        id: `apt-past-${day}-${i}`,
        clientId: client.id,
        clientName: client.name,
        clientPhone: client.phone,
        professionalId: professional.id,
        professionalName: professional.name,
        serviceId: service.id,
        serviceName: service.name,
        serviceType: service.type,
        date: dateStr,
        time,
        duration: service.duration,
        price: service.price,
        status: Math.random() > 0.1 ? 'completed' : 'cancelled',
        paymentStatus: Math.random() > 0.2 ? 'paid' : 'pending',
        createdAt: date.toISOString()
      });
    }
  }
  
  return appointments.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });
};

export const appointments: Appointment[] = generateAppointments();

export const products: Product[] = [
  { id: '1', name: 'Pomada Matte', description: 'Fixação forte, acabamento fosco', price: 45, stock: 25, category: 'Styling' },
  { id: '2', name: 'Óleo para Barba', description: 'Hidratação e brilho natural', price: 55, stock: 18, category: 'Barba' },
  { id: '3', name: 'Shampoo Anticaspa', description: 'Tratamento profissional', price: 35, stock: 30, category: 'Cabelo' },
  { id: '4', name: 'Balm para Barba', description: 'Nutrição e modelagem', price: 40, stock: 22, category: 'Barba' },
  { id: '5', name: 'Gel Fixador', description: 'Fixação extra forte com brilho', price: 30, stock: 35, category: 'Styling' },
];

export const blockedDays: BlockedDay[] = [];
export const blockedTimes: BlockedTime[] = [];

// Helper functions
export const getServiceTypeColor = (type: ServiceType): string => {
  const colors = {
    corte: 'service-corte',
    barba: 'service-barba',
    combo: 'service-combo',
    pigmentacao: 'service-pigmentacao',
    hidratacao: 'service-hidratacao'
  };
  return colors[type];
};

export const getServiceBgColor = (type: ServiceType): string => {
  return serviceColors[type];
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 13) {
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
  }
  return phone;
};

export const getWhatsAppLink = (phone: string, message?: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleaned}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
};

export const formatWhatsAppMessage = (
  template: string,
  data: {
    nome: string;
    servico: string;
    profissional: string;
    data: string;
    horario: string;
  }
): string => {
  return template
    .replace('{nome}', data.nome)
    .replace('{servico}', data.servico)
    .replace('{profissional}', data.profissional)
    .replace('{data}', data.data)
    .replace('{horario}', data.horario);
};
