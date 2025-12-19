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

  role: string;

  avatar: string;

  workDays: number[]; 
  workHours: WorkHours;
  createdAt: string;
}


// ================================
// DTOs (Front → API)
// ================================

export interface CreateEmployeeDTO {
  name: string;
  email: string;
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
  role: string;
  phone: string | null;
  avatar: string | null;
  work_days: number[];
  work_hours_start: string;
  work_hours_end: string;
  created_at: string;
}


// ================================
// Normalização (OBRIGATÓRIA)
// ================================

export function normalizeEmployee(raw: RawEmployee): Employee {
  return {
    id: String(raw.id),

    name: raw.name,

    phone: raw.phone,

    role: raw.role,

    avatar:
      raw.avatar ??
      raw.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),

    workDays: raw.work_days,
    workHours: {
      start: raw.work_hours_start,
      end: raw.work_hours_end,
    },
    createdAt: raw.created_at,
  };
}
