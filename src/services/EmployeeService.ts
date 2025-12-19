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
    const raw = await http<RawEmployee[]>('/employee');
    return raw.map(normalizeEmployee);
  },

  async getById(id: string): Promise<Employee> {
    const raw = await http<RawEmployee>(`/employee/${id}`);
    return normalizeEmployee(raw);
  },

  async create(payload: CreateEmployeeDTO): Promise<Employee> {
    const raw = await http<RawEmployee>('/employee/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return normalizeEmployee(raw);
  },

  async update(id: string, payload: UpdateEmployeeDTO): Promise<Employee> {
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
