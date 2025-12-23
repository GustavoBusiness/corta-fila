import { http } from '@/api/http';
import {
  Employee,
  RawEmployee,
  normalizeEmployee,
  UpdateEmployeeDTO,
  CreateEmployeeDTO
} from '@/types/Employee';

export const EmployeeService = {
  async list(): Promise<Employee[]> {
    const raw = await http<RawEmployee[]>('/profissionals');
    return raw.map(normalizeEmployee);
  },

  async getById(id: string): Promise<Employee> {
    const raw = await http<RawEmployee>(`/profissionals/${id}`);
    return normalizeEmployee(raw);
  },

  async create(payload: CreateEmployeeDTO): Promise<Employee> {
    const raw = await http<RawEmployee>('/profissionals/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return normalizeEmployee(raw);
  },

  async update(id: string, payload: UpdateEmployeeDTO): Promise<Employee> {
    const raw = await http<RawEmployee>(`/profissionals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return normalizeEmployee(raw);
  },

  async remove(id: string): Promise<void> {
    await http<void>(`/profissionals/${id}`, { method: 'DELETE' });
  },
};
