// ================================
// Tipos auxiliares
// ================================

export interface WorkHours {
  start: string; // HH:mm
  end: string;   // HH:mm
}

// ================================
// Entidade NORMALIZADA (UI)
// ================================

export interface Employee {
  id: string;

  name: string;

  phone: string | null;

  email?: string;

  role: string;

  avatar: string;

  photo?: string;

  services: string[]; // IDs dos serviços que atende

  workDays: number[]; 
  workHours: WorkHours;
  createdAt: string;
}


// ================================
// DTOs (Front → API)
// ================================

export interface CreateEmployeeDTO {
  name: string;
  email?: string;
  phone: string;
  role: string;
  avatar?: string;
  photo?: string;
  services: string[];
  workDays: number[];
  workHours: WorkHours;
}

export type UpdateEmployeeDTO = Partial<CreateEmployeeDTO>;


// ================================
// Tipagem CRUA (API → Front)
// ================================

export interface RawEmployee {
  id: number;
  name: string;  
  role: string | null;
  phone: string | null;
  avatar: string | null;
  email?: string;
  photo?: string;
  services?: Array<{
    id: string;
    name: string;
    duration: number;
    price?: number;
  }>;
  professional_working_hours?: Array<{
    day: number;
    start_time: string;
    end_time: string;
  }>;
  created_at: string;
}


// ================================
// Normalização (OBRIGATÓRIA)
// ================================

export function normalizeEmployee(raw: RawEmployee): Employee {
  // Agregar work_days e work_hours da tabela professional_working_hours
  const workingHours = raw.professional_working_hours || [];
  const workDays = [...new Set(workingHours.map(wh => wh.day))].sort();
  
  // Se houver múltiplos horários por dia, usar o primeiro (ou você pode implementar lógica diferente)
  const firstWorkingHour = workingHours[0];
  const workHours: WorkHours = {
    start: firstWorkingHour?.start_time || '09:00',
    end: firstWorkingHour?.end_time || '18:00',
  };

  return {
    id: String(raw.id),

    name: raw.name,

    phone: raw.phone,

    email: raw.email,

    role: raw.role || 'Profissional',

    avatar:
      raw.avatar ??
      raw.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),

    photo: raw.photo,

    services: raw.services?.map(s => String(s.id)) || [],

    workDays: workDays.length > 0 ? workDays : [1, 2, 3, 4, 5],
    workHours,
    createdAt: raw.created_at,
  };
}
