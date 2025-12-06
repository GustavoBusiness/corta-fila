import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatPhone } from '@/lib/mock-data';
import WhatsAppButton from '@/components/WhatsAppButton';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  UserCircle
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

const AdminProfissionais = () => {
  const { professionals, services, addProfessional, updateProfessional, deleteProfessional } = useApp();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');

  const handleOpenDialog = (prof?: typeof professionals[0]) => {
    if (prof) {
      setEditingId(prof.id);
      setName(prof.name);
      setRole(prof.role);
      setPhone(prof.phone);
      setEmail(prof.email);
      setPhoto(prof.photo || '');
      setSelectedServices(prof.services);
      setSelectedDays(prof.workDays);
      setStartTime(prof.workHours.start);
      setEndTime(prof.workHours.end);
    } else {
      setEditingId(null);
      setName('');
      setRole('');
      setPhone('');
      setEmail('');
      setPhoto('');
      setSelectedServices([]);
      setSelectedDays([1, 2, 3, 4, 5]);
      setStartTime('09:00');
      setEndTime('18:00');
    }
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!name || !role || !phone) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const avatar = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const profData = {
      name,
      avatar,
      photo: photo || undefined,
      role,
      phone,
      email,
      services: selectedServices,
      workDays: selectedDays,
      workHours: { start: startTime, end: endTime }
    };

    if (editingId) {
      updateProfessional(editingId, profData);
      toast.success('Profissional atualizado!');
    } else {
      addProfessional(profData);
      toast.success('Profissional adicionado!');
    }
    setShowDialog(false);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteProfessional(deleteConfirm);
      toast.success('Profissional excluído!');
      setDeleteConfirm(null);
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Profissionais</h1>
          <p className="text-muted-foreground">{professionals.length} profissionais cadastrados</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Profissional
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {professionals.map((prof, idx) => (
          <Card 
            key={prof.id}
            className="group hover:border-primary/50 transition-colors animate-fade-in"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {prof.photo ? (
                  <img 
                    src={prof.photo} 
                    alt={prof.name}
                    className="h-14 w-14 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-primary">{prof.avatar}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{prof.name}</h3>
                  <p className="text-sm text-muted-foreground">{prof.role}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatPhone(prof.phone)}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Dias de trabalho</p>
                <div className="flex gap-1 flex-wrap">
                  {weekDays.map((day) => (
                    <Badge
                      key={day.value}
                      variant={prof.workDays.includes(day.value) ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {day.label}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {prof.workHours.start} - {prof.workHours.end}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-end gap-1">
                <WhatsAppButton phone={prof.phone} />
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
              <UserCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum profissional cadastrado</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Profissional' : 'Novo Profissional'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Cargo *</Label>
                <Input
                  placeholder="Ex: Barbeiro Senior"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL da Foto</Label>
              <Input
                placeholder="https://exemplo.com/foto.jpg"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>WhatsApp *</Label>
                <Input
                  placeholder="5511999999999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dias de Trabalho</Label>
              <div className="flex gap-2 flex-wrap">
                {weekDays.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    size="sm"
                    variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                    onClick={() => toggleDay(day.value)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Horário Início</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Horário Fim</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Serviços</Label>
              <div className="grid grid-cols-2 gap-2">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-center gap-2 p-2 rounded border border-border cursor-pointer hover:bg-secondary/50"
                  >
                    <Checkbox
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <span className="text-sm">{service.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingId ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Excluir Profissional"
        description="Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        confirmText="Excluir"
        variant="destructive"
      />
    </div>
  );
};

export default AdminProfissionais;
