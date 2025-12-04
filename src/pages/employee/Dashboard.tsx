import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, getWhatsAppLink } from '@/lib/mock-data';
import ServiceTag from '@/components/ServiceTag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  Clock,
  DollarSign,
  MessageCircle,
  TrendingUp
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { userId, userName } = useAuth();
  const { appointments } = useApp();

  const today = new Date().toISOString().split('T')[0];

  const myAppointments = useMemo(() => {
    return appointments.filter(a => a.professionalId === userId);
  }, [appointments, userId]);

  const stats = useMemo(() => {
    const todayApts = myAppointments.filter(a => a.date === today && a.status === 'scheduled');
    const monthApts = myAppointments.filter(a => {
      const d = new Date(a.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const completedMonth = monthApts.filter(a => a.status === 'completed');

    return {
      todayCount: todayApts.length,
      monthCount: completedMonth.length,
      monthRevenue: completedMonth.reduce((sum, a) => sum + a.price, 0),
      hoursWorked: Math.round(completedMonth.reduce((sum, a) => sum + a.duration, 0) / 60)
    };
  }, [myAppointments, today]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return myAppointments
      .filter(a => {
        const aptDate = new Date(`${a.date}T${a.time}`);
        return aptDate >= now && a.status === 'scheduled';
      })
      .slice(0, 8);
  }, [myAppointments]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Olá, {userName?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Seu painel de trabalho</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.todayCount}</p>
                <p className="text-xs text-muted-foreground">Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.monthCount}</p>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.hoursWorked}h</p>
                <p className="text-xs text-muted-foreground">Trabalhadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.monthRevenue)}</p>
                <p className="text-xs text-muted-foreground">Faturado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Próximos Atendimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {upcomingAppointments.map((apt, index) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{apt.clientName}</p>
                      <ServiceTag type={apt.serviceType} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {apt.serviceName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{new Date(apt.date).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span>{apt.time}</span>
                      <span>•</span>
                      <span>{apt.duration}min</span>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0 text-success hover:text-success hover:bg-success/10"
                    onClick={() => window.open(getWhatsAppLink(apt.clientPhone), '_blank')}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </div>
              ))}
              {upcomingAppointments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum atendimento agendado
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
