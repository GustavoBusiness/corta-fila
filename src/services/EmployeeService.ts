import { http } from '@/api/http';
import {
  Employee,
  RawEmployee,
  normalizeEmployee,
} from '@/types/Employee';

export const EmployeeService = {
  async list(): Promise<Employee[]> {
    const raw = await http<RawEmployee[]>('/employee');
    return raw.map(normalizeEmployee);
  },

  async getById(id: string): Promise<Employee> {
    const raw = await http<RawEmployee>(`/employee/${id}`);
    return normalizeEmployee(raw);
  },

  async create(payload: any): Promise<Employee> {
    const raw = await http<RawEmployee>('/employee/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return normalizeEmployee(raw);
  },

  async update(id: string, payload: any): Promise<Employee> {
    const raw = await http<RawEmployee>(`/employee/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return normalizeEmployee(raw);
  },

  async remove(id: string): Promise<void> {
    await http<void>(`/employee/${id}`, { method: 'DELETE' });
  },
};
