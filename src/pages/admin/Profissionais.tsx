import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { EmployeeService } from '@/services/EmployeeService';
import {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
} from '@/types/employee';

import { formatPhone } from '@/lib/mock-data';
import WhatsAppButton from '@/components/WhatsAppButton';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import {
  Plus,
  Pencil,
  Trash2,
  UserCircle,
} from 'lucide-react';

const weekDays = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

export default function AdminProfissionais() {
  const [professionals, setProfessionals] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // form
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');

  // ===============================
  // Load
  // ===============================

  useEffect(() => {
    setLoading(true);

    EmployeeService.list()
      .then(data => {
        console.log('TIPO:', Array.isArray(data));
        console.log('DADOS:', data);
        console.log('PRIMEIRO:', data?.[0]);
        setProfessionals(data);
      })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);


  // ===============================
  // Dialog
  // ===============================

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingId(employee.id);
      setName(employee.name);
      setRole(employee.role);
      setPhone(employee.phone ?? '');
      setEmail(employee.email);
      setSelectedServices(employee.serviceIds);
      setSelectedDays(employee.workDays);
      setStartTime(employee.workHours.start);
      setEndTime(employee.workHours.end);
    } else {
      resetForm();
    }

    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setRole('');
    setPhone('');
    setEmail('');
    setSelectedServices([]);
    setSelectedDays([1, 2, 3, 4, 5]);
    setStartTime('09:00');
    setEndTime('18:00');
  };

  // ===============================
  // Save
  // ===============================

  const handleSave = async () => {
    if (!name || !role || !phone) {
      toast.error('Campos obrigatórios');
      return;
    }

    const avatar = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const payload: CreateEmployeeDTO = {
      name,
      email,
      phone,
      role,
      avatar,
      serviceIds: selectedServices,
      workDays: selectedDays,
      workHours: {
        start: startTime,
        end: endTime,
      },
    };

    setLoading(true);

    try {
      let saved: Employee;

      if (editingId) {
        const updatePayload: UpdateEmployeeDTO = payload;
        saved = await EmployeeService.update(editingId, updatePayload);

        setProfessionals(prev =>
          prev.map(p => (p.id === saved.id ? saved : p))
        );

        toast.success('Profissional atualizado');
      } else {
        saved = await EmployeeService.create(payload);
        setProfessionals(prev => [...prev, saved]);

        toast.success('Profissional criado');
      }

      setShowDialog(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Delete
  // ===============================

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setLoading(true);

    try {
      await EmployeeService.remove(deleteConfirm);
      setProfessionals(prev =>
        prev.filter(p => p.id !== deleteConfirm)
      );
      toast.success('Profissional excluído');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleteConfirm(null);
      setLoading(false);
    }
  };

  // ===============================
  // Render
  // ===============================

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Profissionais</h1>
          <p className="text-muted-foreground">
            {professionals.length} profissionais cadastrados
          </p>
        </div>

        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Profissional
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {professionals.map(prof => (
          <Card key={prof.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-bold">
                    {prof.avatar}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold">{prof.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {prof.role}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {prof.phone ? formatPhone(prof.phone) : ''}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <div className="flex gap-1 flex-wrap">
                  {weekDays.map(day => (
                    <Badge
                      key={day.value}
                      variant={
                        prof.workDays.includes(day.value)
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {day.label}
                    </Badge>
                  ))}
                </div>

                <p className="text-xs mt-2">
                  {prof.workHours.start} - {prof.workHours.end}
                </p>
              </div>

              <div className="mt-4 flex justify-end gap-1">
                {prof.phone && (
                  <WhatsAppButton phone={prof.phone} />
                )}

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleOpenDialog(prof)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setDeleteConfirm(prof.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {professionals.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <UserCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhum profissional cadastrado
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Profissional' : 'Novo Profissional'}
            </DialogTitle>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading
                ? 'Salvando...'
                : editingId
                  ? 'Salvar'
                  : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={open => !open && setDeleteConfirm(null)}
        title="Excluir Profissional"
        description="Tem certeza que deseja excluir este profissional?"
        onConfirm={handleDelete}
        confirmText="Excluir"
        variant="destructive"
      />
    </div>
  );
}
