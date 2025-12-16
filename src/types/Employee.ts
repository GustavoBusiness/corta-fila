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

  email: string;
  phone: string | null;

  role: string;
  active: boolean;

  avatar: string;
  photo: string | null;

  serviceIds: string[];

  workDays: number[]; // 0 (Dom) -> 6 (Sáb)
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
  avatar: string;

  serviceIds: string[];

  workDays: number[];
  workHours: WorkHours;
}

export type UpdateEmployeeDTO = Partial<CreateEmployeeDTO>;

// ================================
// Tipagem CRUA (API → Front)
// ================================

export interface RawEmployee {
  id: number;
  company_id: number;

  name: string;
  email: string;
  role: string;
  phone: string | null;

  avatar: string | null;

  status: 'active' | 'inactive';

  created_at: string;
}

// ================================
// Normalização (OBRIGATÓRIA)
// ================================

export function normalizeEmployee(raw: RawEmployee): Employee {
  return {
    id: String(raw.id),

    name: raw.name,

    email: raw.email,
    phone: raw.phone,

    role: raw.role,
    active: raw.status === 'active',

    avatar:
      raw.avatar ??
      raw.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),

    photo: null,

    serviceIds: [],

    workDays: [1, 2, 3, 4, 5], // default seguro
    workHours: {
      start: '09:00',
      end: '18:00',
    },

    createdAt: raw.created_at,
  };
}
