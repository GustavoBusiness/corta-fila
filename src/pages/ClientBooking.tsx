import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, getWhatsAppLink, ServiceType } from '@/lib/mock-data';
import Logo from '@/components/Logo';
import ServiceTag from '@/components/ServiceTag';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  Phone,
  Calendar,
  MessageCircle
} from 'lucide-react';

type Step = 'services' | 'calendar' | 'professional' | 'time' | 'confirm';

const ClientBooking = () => {
  const { services, professionals, appointments, blockedDays, addAppointment, addClient } = useApp();
  
  const [step, setStep] = useState<Step>('services');
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<typeof professionals[0] | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Check if at least one professional is available on this day
      const dayOfWeek = date.getDay();
      const dateStr = date.toISOString().split('T')[0];
      
      const hasAvailableProfessional = professionals.some(prof => {
        const isWorkDay = prof.workDays.includes(dayOfWeek);
        const isBlocked = blockedDays.some(b => b.date === dateStr && b.professionalId === prof.id);
        return isWorkDay && !isBlocked;
      });
      
      if (hasAvailableProfessional) {
        dates.push(date);
      }
    }
    
    return dates;
  }, [professionals, blockedDays]);

  const availableProfessionals = useMemo(() => {
    if (!selectedDate || !selectedService) return [];
    
    const dayOfWeek = selectedDate.getDay();
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    return professionals.filter(prof => {
      const offersService = prof.services.includes(selectedService.id);
      const isWorkDay = prof.workDays.includes(dayOfWeek);
      const isBlocked = blockedDays.some(b => b.date === dateStr && b.professionalId === prof.id);
      return offersService && isWorkDay && !isBlocked;
    });
  }, [selectedDate, selectedService, professionals, blockedDays]);

  const availableTimes = useMemo(() => {
    if (!selectedDate || !selectedProfessional || !selectedService) return [];
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    const bookedTimes = appointments
      .filter(a => a.date === dateStr && a.professionalId === selectedProfessional.id && a.status === 'scheduled')
      .map(a => a.time);
    
    const times: { time: string; available: boolean }[] = [];
    const [startH] = selectedProfessional.workHours.start.split(':').map(Number);
    const [endH] = selectedProfessional.workHours.end.split(':').map(Number);
    
    for (let h = startH; h < endH; h++) {
      for (const m of ['00', '30']) {
        const time = `${h.toString().padStart(2, '0')}:${m}`;
        const isBooked = bookedTimes.includes(time);
        
        // Check if time is in the past for today
        const now = new Date();
        const isToday = dateStr === now.toISOString().split('T')[0];
        const isPast = isToday && (h < now.getHours() || (h === now.getHours() && parseInt(m) <= now.getMinutes()));
        
        times.push({ time, available: !isBooked && !isPast });
      }
    }
    
    return times;
  }, [selectedDate, selectedProfessional, selectedService, appointments]);

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: { date: Date; isCurrentMonth: boolean; isAvailable: boolean }[] = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      const day = new Date(year, month, -i);
      days.unshift({ date: day, isCurrentMonth: false, isAvailable: false });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const isAvailable = availableDates.some(d => d.toDateString() === date.toDateString());
      days.push({ date, isCurrentMonth: true, isAvailable });
    }
    
    return days;
  }, [currentMonth, availableDates]);

  const handleSelectService = (service: typeof services[0]) => {
    setSelectedService(service);
    setStep('calendar');
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setStep('professional');
  };

  const handleSelectProfessional = (prof: typeof professionals[0]) => {
    setSelectedProfessional(prof);
    setStep('time');
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (!clientName || !clientPhone) {
      toast.error('Preencha seu nome e WhatsApp');
      return;
    }

    if (!selectedService || !selectedDate || !selectedProfessional || !selectedTime) {
      return;
    }

    // Add client
    addClient({
      name: clientName,
      phone: clientPhone,
      totalVisits: 1,
      lastVisit: selectedDate.toISOString().split('T')[0]
    });

    // Add appointment
    addAppointment({
      clientId: '',
      clientName,
      clientPhone,
      professionalId: selectedProfessional.id,
      professionalName: selectedProfessional.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      serviceType: selectedService.type as ServiceType,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      duration: selectedService.duration,
      price: selectedService.price,
      status: 'scheduled'
    });

    setShowSuccess(true);
  };

  const openWhatsApp = () => {
    const message = `✅ Seu agendamento foi confirmado!\n\n📋 *${selectedService?.name}*\n👤 Profissional: ${selectedProfessional?.name}\n📅 ${selectedDate?.toLocaleDateString('pt-BR')}\n🕐 ${selectedTime}\n💰 ${formatCurrency(selectedService?.price || 0)}\n\nObrigado pela preferência! 🙏`;
    window.open(getWhatsAppLink(clientPhone, message), '_blank');
  };

  const goBack = () => {
    switch (step) {
      case 'calendar':
        setStep('services');
        break;
      case 'professional':
        setStep('calendar');
        break;
      case 'time':
        setStep('professional');
        break;
      case 'confirm':
        setStep('time');
        break;
    }
  };

  const resetBooking = () => {
    setStep('services');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedProfessional(null);
    setSelectedTime(null);
    setClientName('');
    setClientPhone('');
    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-center p-4">
          <Logo size="md" />
        </div>
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {['services', 'calendar', 'professional', 'time', 'confirm'].map((s, idx) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                step === s ? 'w-8 bg-primary' : 
                ['services', 'calendar', 'professional', 'time', 'confirm'].indexOf(step) > idx 
                  ? 'w-4 bg-primary/50' 
                  : 'w-4 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Back Button */}
        {step !== 'services' && (
          <Button variant="ghost" className="mb-4 gap-2" onClick={goBack}>
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
        )}

        {/* Step: Services */}
        {step === 'services' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Escolha o serviço</h1>
              <p className="text-muted-foreground">Selecione o que deseja agendar</p>
            </div>
            <div className="space-y-3">
              {services.map((service, idx) => (
                <Card
                  key={service.id}
                  className="cursor-pointer hover:border-primary transition-all animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                  onClick={() => handleSelectService(service)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <ServiceTag type={service.type} />
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {service.duration} minutos
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step: Calendar */}
        {step === 'calendar' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Escolha a data</h1>
              <p className="text-muted-foreground">Dias disponíveis para agendamento</p>
            </div>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="font-semibold capitalize">
                    {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-xs font-medium text-muted-foreground p-2">
                      {d}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {monthDays.map(({ date, isCurrentMonth, isAvailable }, idx) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    return (
                      <button
                        key={idx}
                        disabled={!isAvailable}
                        onClick={() => isAvailable && handleSelectDate(date)}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all
                          ${!isCurrentMonth ? 'text-muted-foreground/30' : ''}
                          ${isAvailable ? 'hover:bg-primary hover:text-primary-foreground cursor-pointer' : 'cursor-not-allowed opacity-30'}
                          ${isToday ? 'ring-2 ring-primary' : ''}
                        `}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step: Professional */}
        {step === 'professional' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Escolha o profissional</h1>
              <p className="text-muted-foreground">
                Disponíveis em {selectedDate?.toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="space-y-3">
              {availableProfessionals.map((prof, idx) => (
                <Card
                  key={prof.id}
                  className="cursor-pointer hover:border-primary transition-all animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                  onClick={() => handleSelectProfessional(prof)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-primary">{prof.avatar}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{prof.name}</h3>
                      <p className="text-sm text-muted-foreground">{prof.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {availableProfessionals.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum profissional disponível nesta data
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step: Time */}
        {step === 'time' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Escolha o horário</h1>
              <p className="text-muted-foreground">
                {selectedProfessional?.name} • {selectedDate?.toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {availableTimes.map(({ time, available }, idx) => (
                <Button
                  key={time}
                  variant={available ? 'outline' : 'ghost'}
                  disabled={!available}
                  className={`h-12 animate-scale-in ${!available ? 'opacity-30' : ''}`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                  onClick={() => available && handleSelectTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Confirmar agendamento</h1>
              <p className="text-muted-foreground">Preencha seus dados para finalizar</p>
            </div>

            {/* Summary */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <ServiceTag type={selectedService?.type || 'corte'} />
                  <span className="font-semibold">{selectedService?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedProfessional?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedDate?.toLocaleDateString('pt-BR')} às {selectedTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedService?.duration} minutos</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(selectedService?.price || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Seu nome
                </Label>
                <Input
                  placeholder="Nome completo"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Seu WhatsApp
                </Label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </div>
            </div>

            <Button className="w-full h-12 text-lg" onClick={handleConfirm}>
              Confirmar Agendamento
            </Button>
          </div>
        )}
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="sr-only">Sucesso</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center mx-auto animate-scale-in">
              <Check className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold">Agendamento confirmado!</h2>
            <p className="text-muted-foreground">
              Seu agendamento foi realizado com sucesso. Você receberá a confirmação no WhatsApp.
            </p>
            <Card className="bg-secondary/50">
              <CardContent className="p-4 text-left text-sm space-y-2">
                <p><strong>{selectedService?.name}</strong></p>
                <p>{selectedProfessional?.name}</p>
                <p>{selectedDate?.toLocaleDateString('pt-BR')} às {selectedTime}</p>
                <p className="text-primary font-bold">{formatCurrency(selectedService?.price || 0)}</p>
              </CardContent>
            </Card>
            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={openWhatsApp} className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Abrir WhatsApp
              </Button>
              <Button variant="outline" onClick={resetBooking}>
                Fazer novo agendamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientBooking;
