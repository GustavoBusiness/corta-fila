import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Scissors,
  BarChart3
} from 'lucide-react';

const AdminFinanceiro = () => {
  const { appointments, services, professionals } = useApp();

  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Today's data
    const todayApts = appointments.filter(a => a.date === todayStr && a.status === 'completed');
    const todayRevenue = todayApts.reduce((sum, a) => sum + a.price, 0);

    // This month
    const monthApts = appointments.filter(a => {
      const d = new Date(a.date);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });
    const monthCompleted = monthApts.filter(a => a.status === 'completed');
    const monthCancelled = monthApts.filter(a => a.status === 'cancelled');
    const monthRevenue = monthCompleted.reduce((sum, a) => sum + a.price, 0);

    // Last month for comparison
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthApts = appointments.filter(a => {
      const d = new Date(a.date);
      return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear() && a.status === 'completed';
    });
    const lastMonthRevenue = lastMonthApts.reduce((sum, a) => sum + a.price, 0);

    // Growth percentage
    const growth = lastMonthRevenue > 0 
      ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Service breakdown
    const serviceStats = services.map(service => {
      const serviceApts = monthCompleted.filter(a => a.serviceId === service.id);
      return {
        ...service,
        count: serviceApts.length,
        revenue: serviceApts.reduce((sum, a) => sum + a.price, 0)
      };
    }).sort((a, b) => b.count - a.count);

    // Professional breakdown
    const profStats = professionals.map(prof => {
      const profApts = monthCompleted.filter(a => a.professionalId === prof.id);
      return {
        ...prof,
        count: profApts.length,
        revenue: profApts.reduce((sum, a) => sum + a.price, 0)
      };
    }).sort((a, b) => b.count - a.count);

    return {
      todayServices: todayApts.length,
      todayRevenue,
      monthServices: monthCompleted.length,
      monthCancelled: monthCancelled.length,
      monthRevenue,
      ticketMedio: monthCompleted.length > 0 ? monthRevenue / monthCompleted.length : 0,
      growth,
      serviceStats,
      profStats,
      topService: serviceStats[0],
      topProfessional: profStats[0]
    };
  }, [appointments, services, professionals]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <p className="text-muted-foreground">Análise financeira do negócio</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Scissors className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.todayServices}</p>
                <p className="text-xs text-muted-foreground">Serviços hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</p>
                <p className="text-xs text-muted-foreground">Receita hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.monthServices}</p>
                <p className="text-xs text-muted-foreground">Serviços no mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.ticketMedio)}</p>
                <p className="text-xs text-muted-foreground">Ticket médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground mb-1">Faturamento do Mês</p>
                <p className="text-4xl font-bold">{formatCurrency(stats.monthRevenue)}</p>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${stats.growth >= 0 ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                {stats.growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(stats.growth).toFixed(1)}%
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Comparado ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Realizados</p>
                <p className="text-2xl font-bold text-success">{stats.monthServices}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Cancelados</p>
                <p className="text-2xl font-bold text-destructive">{stats.monthCancelled}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div 
                  className="h-full bg-success rounded-full transition-all"
                  style={{ 
                    width: `${(stats.monthServices / (stats.monthServices + stats.monthCancelled)) * 100 || 0}%` 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Taxa de conclusão: {((stats.monthServices / (stats.monthServices + stats.monthCancelled)) * 100 || 0).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Scissors className="h-5 w-5" />
              Serviços Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.serviceStats.map((service, idx) => (
                <div key={service.id} className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-muted-foreground w-8">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{service.name}</span>
                      <Badge variant="secondary">{service.count}x</Badge>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ 
                          width: `${(service.count / (stats.serviceStats[0]?.count || 1)) * 100}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(service.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Professionals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Profissionais Mais Agendados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.profStats.map((prof, idx) => (
                <div key={prof.id} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">{prof.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{prof.name}</span>
                      <Badge variant="secondary">{prof.count} serviços</Badge>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div 
                        className="h-full bg-info rounded-full transition-all"
                        style={{ 
                          width: `${(prof.count / (stats.profStats[0]?.count || 1)) * 100}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(prof.revenue)} faturado
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminFinanceiro;
