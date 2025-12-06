import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, getWhatsAppLink, getServiceBgColor } from '@/lib/mock-data';
import ServiceTag from '@/components/ServiceTag';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { appointments, professionals, clients, services } = useApp();

  const today = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    const todayAppointments = appointments.filter(a => a.date === today);
    const monthAppointments = appointments.filter(a => {
      const aptDate = new Date(a.date);
      const now = new Date();
      return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
    });

    const completedToday = todayAppointments.filter(a => a.status === 'completed');
    const completedMonth = monthAppointments.filter(a => a.status === 'completed');

    return {
      todayTotal: todayAppointments.length,
      todayCompleted: completedToday.length,
      monthTotal: monthAppointments.length,
      monthRevenue: completedMonth.reduce((sum, a) => sum + a.price, 0),
      ticketMedio: completedMonth.length > 0 
        ? completedMonth.reduce((sum, a) => sum + a.price, 0) / completedMonth.length 
        : 0
    };
  }, [appointments, today]);

  const todaySchedule = useMemo(() => {
    return appointments
      .filter(a => a.date === today && a.status === 'scheduled')
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, today]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter(a => {
        const aptDate = new Date(`${a.date}T${a.time}`);
        return aptDate >= now && a.status === 'scheduled';
      })
      .slice(0, 10);
  }, [appointments]);

  const appointmentsByProfessional = useMemo(() => {
    const todayApts = appointments.filter(a => a.date === today);
    return professionals.map(prof => ({
      ...prof,
      appointments: todayApts.filter(a => a.professionalId === prof.id)
    }));
  }, [appointments, professionals, today]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.todayTotal}</p>
                <p className="text-xs text-muted-foreground">Agendamentos hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.monthTotal}</p>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.monthRevenue)}</p>
                <p className="text-xs text-muted-foreground">Faturamento mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.ticketMedio)}</p>
                <p className="text-xs text-muted-foreground">Ticket médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule - Focus on hours */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horários de Hoje
            <Badge variant="secondary" className="ml-auto">{todaySchedule.length} agendamentos</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[350px] pr-4">
            <div className="space-y-2">
              {todaySchedule.map((apt, index) => (
                <div
                  key={apt.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${getServiceBgColor(apt.serviceType)} animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="text-center min-w-[60px]">
                    <p className="text-lg font-bold">{apt.time}</p>
                    <p className="text-xs text-muted-foreground">{apt.duration}min</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{apt.clientName}</p>
                      <ServiceTag type={apt.serviceType} />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {apt.serviceName} • {apt.professionalName}
                    </p>
                  </div>
                  <WhatsAppButton phone={apt.clientPhone} />
                </div>
              ))}
              {todaySchedule.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">Nenhum agendamento para hoje</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Próximos Agendamentos */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {upcomingAppointments.map((apt, index) => (
                  <div
                    key={apt.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${getServiceBgColor(apt.serviceType)} animate-fade-in`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{apt.clientName}</p>
                        <ServiceTag type={apt.serviceType} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {apt.serviceName} • {apt.professionalName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(apt.date).toLocaleDateString('pt-BR')} às {apt.time}
                      </p>
                    </div>
                    <WhatsAppButton phone={apt.clientPhone} />
                  </div>
                ))}
                {upcomingAppointments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
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
            <CardTitle className="text-lg flex items-center gap-2">
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
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">{prof.avatar}</span>
                      </div>
                      <span className="font-medium text-sm">{prof.name}</span>
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
