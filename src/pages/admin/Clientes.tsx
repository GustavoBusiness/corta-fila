import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatPhone, getWhatsAppLink } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  MessageCircle,
  Pencil,
  Trash2,
  Users
} from 'lucide-react';

const AdminClientes = () => {
  const { clients, addClient, updateClient, deleteClient } = useApp();
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleOpenDialog = (client?: typeof clients[0]) => {
    if (client) {
      setEditingId(client.id);
      setName(client.name);
      setPhone(client.phone);
      setEmail(client.email || '');
    } else {
      setEditingId(null);
      setName('');
      setPhone('');
      setEmail('');
    }
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!name || !phone) {
      toast.error('Preencha nome e telefone');
      return;
    }

    if (editingId) {
      updateClient(editingId, { name, phone, email: email || undefined });
      toast.success('Cliente atualizado!');
    } else {
      addClient({ name, phone, email: email || undefined, totalVisits: 0 });
      toast.success('Cliente adicionado!');
    }
    setShowDialog(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClient(id);
      toast.success('Cliente excluído!');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">{clients.length} clientes cadastrados</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredClients.map((client, idx) => (
          <Card key={client.id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-lg font-medium text-primary">
                    {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{client.name}</h3>
                    <Badge variant="secondary">{client.totalVisits} visitas</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatPhone(client.phone)}</p>
                  {client.email && (
                    <p className="text-xs text-muted-foreground">{client.email}</p>
                  )}
                  {client.lastVisit && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Última visita: {new Date(client.lastVisit).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-success"
                    onClick={() => window.open(getWhatsAppLink(client.phone), '_blank')}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenDialog(client)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDelete(client.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredClients.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum cliente encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
    </div>
  );
};

export default AdminClientes;
