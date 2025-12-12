import { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, getServiceBgColor } from '@/lib/mock-data';
import ServiceTag from '@/components/ServiceTag';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  Filter
} from 'lucide-react';

const AdminDashboard = () => {
  const { appointments, professionals, services } = useApp();
  
  // Filtros
  const [filterProfessional, setFilterProfessional] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  const stats = useMemo(() => {
    const todayAppointments = appointments.filter(a => a.date === today);
    const monthAppointments = appointments.filter(a => {
      const aptDate = new Date(a.date);
      const nowDate = new Date();
      return aptDate.getMonth() === nowDate.getMonth() && aptDate.getFullYear() === nowDate.getFullYear();
    });

    const completedToday = todayAppointments.filter(a => a.status === 'completed');
    const scheduledToday = todayAppointments.filter(a => a.status === 'scheduled');

    return {
      todayTotal: scheduledToday.length,
      todayCompleted: completedToday.length,
      monthTotal: monthAppointments.length,
    };
  }, [appointments, today]);

  // Horários de hoje - filtra por profissional e serviço, remove passados
  const todaySchedule = useMemo(() => {
    let filtered = appointments
      .filter(a => a.date === today && a.status === 'scheduled');
    
    // Filtrar agendamentos com horário já passado
    filtered = filtered.filter(a => {
      const [hours, minutes] = a.time.split(':').map(Number);
      const aptTime = new Date(now);
      aptTime.setHours(hours, minutes, 0, 0);
      return aptTime > now;
    });
    
    // Aplicar filtros
    if (filterProfessional !== 'all') {
      filtered = filtered.filter(a => a.professionalId === filterProfessional);
    }
    if (filterService !== 'all') {
      filtered = filtered.filter(a => a.serviceId === filterService);
    }
    
    return filtered.sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, today, now, filterProfessional, filterService]);

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter(a => {
        const aptDate = new Date(`${a.date}T${a.time}`);
        return aptDate >= now && a.status === 'scheduled';
      })
      .slice(0, 10);
  }, [appointments, now]);

  const appointmentsByProfessional = useMemo(() => {
    const todayApts = appointments.filter(a => a.date === today && a.status === 'scheduled');
    return professionals.map(prof => ({
      ...prof,
      appointments: todayApts.filter(a => a.professionalId === prof.id)
    }));
  }, [appointments, professionals, today]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Visão geral do seu negócio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{stats.todayTotal}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Agendados hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{stats.todayCompleted}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-info" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{stats.monthTotal}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Este mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule with Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Agendamentos do Dia
              <Badge variant="secondary" className="ml-2">{todaySchedule.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Select value={filterProfessional} onValueChange={setFilterProfessional}>
                <SelectTrigger className="w-[130px] sm:w-[150px] h-8 text-xs sm:text-sm">
                  <SelectValue placeholder="Profissional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {professionals.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger className="w-[130px] sm:w-[150px] h-8 text-xs sm:text-sm">
                  <SelectValue placeholder="Serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {services.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] sm:h-[350px] pr-4">
            <div className="space-y-2">
              {todaySchedule.map((apt, index) => (
                <div
                  key={apt.id}
                  className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border ${getServiceBgColor(apt.serviceType)} animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="text-center min-w-[50px] sm:min-w-[60px]">
                    <p className="text-base sm:text-lg font-bold">{apt.time}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{apt.duration}min</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-sm sm:text-base truncate">{apt.clientName}</p>
                      <ServiceTag type={apt.serviceType} />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {apt.serviceName} • {apt.professionalName}
                    </p>
                  </div>
                  <WhatsAppButton phone={apt.clientPhone} />
                </div>
              ))}
              {todaySchedule.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground text-sm">
                    {filterProfessional !== 'all' || filterService !== 'all' 
                      ? 'Nenhum agendamento com esses filtros'
                      : 'Nenhum agendamento pendente para hoje'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Próximos Agendamentos */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px] sm:h-[300px] pr-4">
              <div className="space-y-3">
                {upcomingAppointments.map((apt, index) => (
                  <div
                    key={apt.id}
                    className={`flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg border ${getServiceBgColor(apt.serviceType)} animate-fade-in`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-sm sm:text-base truncate">{apt.clientName}</p>
                        <ServiceTag type={apt.serviceType} />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {apt.serviceName} • {apt.professionalName}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        {new Date(apt.date).toLocaleDateString('pt-BR')} às {apt.time}
                      </p>
                    </div>
                    <WhatsAppButton phone={apt.clientPhone} />
                  </div>
                ))}
                {upcomingAppointments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    Nenhum agendamento próximo
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Por Profissional */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Hoje por Profissional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointmentsByProfessional.map((prof) => (
                <div key={prof.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-primary">{prof.avatar}</span>
                      </div>
                      <span className="font-medium text-sm truncate">{prof.name}</span>
                    </div>
                    <Badge variant="secondary">{prof.appointments.length}</Badge>
                  </div>
                  {prof.appointments.length > 0 && (
                    <div className="pl-10 space-y-1">
                      {prof.appointments.slice(0, 3).map((apt) => (
                        <div key={apt.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{apt.time}</span>
                          <span>•</span>
                          <span className="truncate">{apt.clientName}</span>
                        </div>
                      ))}
                      {prof.appointments.length > 3 && (
                        <p className="text-xs text-primary">
                          +{prof.appointments.length - 3} mais
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
