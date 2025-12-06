import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, ServiceType, serviceColors } from '@/lib/mock-data';
import ServiceTag from '@/components/ServiceTag';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  Scissors
} from 'lucide-react';

const serviceTypes: { value: ServiceType; label: string }[] = [
  { value: 'corte', label: 'Corte' },
  { value: 'barba', label: 'Barba' },
  { value: 'combo', label: 'Combo' },
  { value: 'pigmentacao', label: 'Pigmentação' },
  { value: 'hidratacao', label: 'Hidratação' },
];

const AdminServicos = () => {
  const { services, addService, updateService, deleteService } = useApp();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<ServiceType>('corte');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');

  const handleOpenDialog = (service?: typeof services[0]) => {
    if (service) {
      setEditingId(service.id);
      setName(service.name);
      setType(service.type);
      setPrice(service.price.toString());
      setDuration(service.duration.toString());
      setDescription(service.description);
    } else {
      setEditingId(null);
      setName('');
      setType('corte');
      setPrice('');
      setDuration('');
      setDescription('');
    }
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!name || !price || !duration) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const serviceData = {
      name,
      type,
      price: parseFloat(price),
      duration: parseInt(duration),
      description,
      color: serviceColors[type].split(' ')[0]
    };

    if (editingId) {
      updateService(editingId, serviceData);
      toast.success('Serviço atualizado!');
    } else {
      addService(serviceData);
      toast.success('Serviço adicionado!');
    }
    setShowDialog(false);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteService(deleteConfirm);
      toast.success('Serviço excluído!');
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Serviços</h1>
          <p className="text-muted-foreground">{services.length} serviços cadastrados</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service, idx) => (
          <Card 
            key={service.id} 
            className="group hover:border-primary/50 transition-colors animate-fade-in"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <ServiceTag type={service.type} />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => handleOpenDialog(service)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteConfirm(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{service.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{service.duration} min</span>
                </div>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(service.price)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {services.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <Scissors className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum serviço cadastrado</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                placeholder="Nome do serviço"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={type} onValueChange={(v) => setType(v as ServiceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço (R$) *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Duração (min) *</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descrição do serviço..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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
        title="Excluir Serviço"
        description="Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        confirmText="Excluir"
        variant="destructive"
      />
    </div>
  );
};

export default AdminServicos;
