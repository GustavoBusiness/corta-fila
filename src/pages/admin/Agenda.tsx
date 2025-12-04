import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, getWhatsAppLink, ServiceType, Professional, Appointment } from '@/lib/mock-data';
import ServiceTag from '@/components/ServiceTag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MessageCircle,
  X,
  Clock,
  Ban
} from 'lucide-react';

type ViewMode = 'day' | 'week' | 'month';

const AdminAgenda = () => {
  const { 
    appointments, 
    professionals, 
    services, 
    blockedDays,
    addAppointment, 
    updateAppointment, 
    deleteAppointment,
    addBlockedDay,
    removeBlockedDay
  } = useApp();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showBlockDay, setShowBlockDay] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Form state
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newServiceId, setNewServiceId] = useState('');
  const [newProfessionalId, setNewProfessionalId] = useState('');
  const [blockProfessionalId, setBlockProfessionalId] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 8; h < 20; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  const formattedDate = currentDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getDateString = (date: Date) => date.toISOString().split('T')[0];

  const dayAppointments = useMemo(() => {
    const dateStr = getDateString(currentDate);
    return appointments.filter(a => a.date === dateStr && a.status === 'scheduled');
  }, [appointments, currentDate]);

  const weekDays = useMemo(() => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Pad with days from previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
      const day = new Date(year, month, -i);
      days.unshift({ date: day, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    return days;
  }, [currentDate]);

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = getDateString(date);
    return appointments.filter(a => a.date === dateStr && a.status === 'scheduled');
  };

  const isDateBlocked = (date: Date, profId?: string) => {
    const dateStr = getDateString(date);
    return blockedDays.some(b => b.date === dateStr && (!profId || b.professionalId === profId));
  };

  const handleOpenNewAppointment = (date?: string, time?: string) => {
    setSelectedDate(date || getDateString(currentDate));
    setSelectedTime(time || '09:00');
    setShowNewAppointment(true);
  };

  const handleCreateAppointment = () => {
    if (!newClientName || !newClientPhone || !newServiceId || !newProfessionalId) {
      toast.error('Preencha todos os campos');
      return;
    }

    const service = services.find(s => s.id === newServiceId);
    const professional = professionals.find(p => p.id === newProfessionalId);

    if (!service || !professional) return;

    addAppointment({
      clientId: '',
      clientName: newClientName,
      clientPhone: newClientPhone,
      professionalId: professional.id,
      professionalName: professional.name,
      serviceId: service.id,
      serviceName: service.name,
      serviceType: service.type as ServiceType,
      date: selectedDate,
      time: selectedTime,
      duration: service.duration,
      price: service.price,
      status: 'scheduled'
    });

    toast.success('Agendamento criado!');
    setShowNewAppointment(false);
    resetForm();
  };

  const handleBlockDay = () => {
    if (!blockProfessionalId) {
      toast.error('Selecione um profissional');
      return;
    }

    addBlockedDay({
      professionalId: blockProfessionalId,
      date: selectedDate,
      reason: blockReason
    });

    toast.success('Dia bloqueado!');
    setShowBlockDay(false);
    setBlockProfessionalId('');
    setBlockReason('');
  };

  const resetForm = () => {
    setNewClientName('');
    setNewClientPhone('');
    setNewServiceId('');
    setNewProfessionalId('');
  };

  const handleCancelAppointment = (id: string) => {
    updateAppointment(id, { status: 'cancelled' });
    toast.success('Agendamento cancelado');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-muted-foreground capitalize">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => handleOpenNewAppointment()} className="gap-2">
            <Plus className="h-4 w-4" />
            Agendar
          </Button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="day">Dia</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mês</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Tabs>

      {/* Day View */}
      {viewMode === 'day' && (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="divide-y divide-border">
                {timeSlots.map((time) => {
                  const slotAppointments = dayAppointments.filter(a => a.time === time);
                  return (
                    <div
                      key={time}
                      className="flex min-h-[80px] hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => slotAppointments.length === 0 && handleOpenNewAppointment(undefined, time)}
                    >
                      <div className="w-20 shrink-0 p-3 text-sm text-muted-foreground border-r border-border">
                        {time}
                      </div>
                      <div className="flex-1 p-2 flex flex-wrap gap-2">
                        {slotAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            className="flex-1 min-w-[200px] max-w-md p-3 rounded-lg bg-card border border-border group"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{apt.clientName}</span>
                                  <ServiceTag type={apt.serviceType} />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {apt.serviceName} • {apt.professionalName}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {apt.duration}min • {formatCurrency(apt.price)}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-success"
                                  onClick={() => window.open(getWhatsAppLink(apt.clientPhone), '_blank')}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => handleCancelAppointment(apt.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-7 border-b border-border">
                {weekDays.map((day) => {
                  const isToday = getDateString(day) === getDateString(new Date());
                  return (
                    <div
                      key={day.toISOString()}
                      className={`p-3 text-center border-r border-border last:border-r-0 ${isToday ? 'bg-primary/10' : ''}`}
                    >
                      <p className="text-xs text-muted-foreground">
                        {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </p>
                      <p className={`text-lg font-bold ${isToday ? 'text-primary' : ''}`}>
                        {day.getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>
              <ScrollArea className="h-[500px]">
                <div className="grid grid-cols-7">
                  {weekDays.map((day) => {
                    const dayApts = getAppointmentsForDate(day);
                    const dateStr = getDateString(day);
                    return (
                      <div
                        key={day.toISOString()}
                        className="min-h-[500px] p-2 border-r border-border last:border-r-0 hover:bg-secondary/20 cursor-pointer"
                        onClick={() => {
                          setCurrentDate(day);
                          setViewMode('day');
                        }}
                      >
                        <div className="space-y-1">
                          {dayApts.slice(0, 5).map((apt) => (
                            <div
                              key={apt.id}
                              className="p-2 rounded bg-card border border-border text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <p className="font-medium truncate">{apt.time}</p>
                              <p className="text-muted-foreground truncate">{apt.clientName}</p>
                              <ServiceTag type={apt.serviceType} className="mt-1" />
                            </div>
                          ))}
                          {dayApts.length > 5 && (
                            <p className="text-xs text-primary text-center">
                              +{dayApts.length - 5} mais
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-center">
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground p-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map(({ date, isCurrentMonth }, idx) => {
                const dayApts = getAppointmentsForDate(date);
                const isToday = getDateString(date) === getDateString(new Date());
                return (
                  <div
                    key={idx}
                    className={`min-h-[80px] p-2 rounded-lg border cursor-pointer transition-colors
                      ${isCurrentMonth ? 'bg-card' : 'bg-muted/30'}
                      ${isToday ? 'border-primary' : 'border-border'}
                      hover:bg-secondary/50
                    `}
                    onClick={() => {
                      setCurrentDate(date);
                      setViewMode('day');
                    }}
                  >
                    <p className={`text-sm font-medium ${!isCurrentMonth ? 'text-muted-foreground' : ''} ${isToday ? 'text-primary' : ''}`}>
                      {date.getDate()}
                    </p>
                    {dayApts.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {dayApts.slice(0, 2).map((apt) => (
                          <div
                            key={apt.id}
                            className="text-xs p-1 rounded bg-primary/10 truncate"
                          >
                            {apt.time} - {apt.clientName}
                          </div>
                        ))}
                        {dayApts.length > 2 && (
                          <p className="text-xs text-primary">+{dayApts.length - 2}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Appointment Dialog */}
      <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome do Cliente</Label>
              <Input
                placeholder="Nome completo"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input
                placeholder="5511999999999"
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Serviço</Label>
              <Select value={newServiceId} onValueChange={setNewServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} - {formatCurrency(s.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Profissional</Label>
              <Select value={newProfessionalId} onValueChange={setNewProfessionalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowNewAppointment(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAppointment}>
              Criar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Day Dialog */}
      <Dialog open={showBlockDay} onOpenChange={setShowBlockDay}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5" />
              Bloquear Dia
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Profissional</Label>
              <Select value={blockProfessionalId} onValueChange={setBlockProfessionalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Motivo (opcional)</Label>
              <Input
                placeholder="Ex: Folga, Feriado..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowBlockDay(false)}>
              Cancelar
            </Button>
            <Button onClick={handleBlockDay} variant="destructive">
              Bloquear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAgenda;
