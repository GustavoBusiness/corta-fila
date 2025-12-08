/**
 * Client Booking - Fluxo de agendamento do cliente
 * 
 * TODO Backend:
 * - Carregar serviços do banco: GET /api/services
 * - Carregar profissionais do banco: GET /api/professionals
 * - Carregar agendamentos existentes: GET /api/appointments
 * - Carregar configurações do admin: GET /api/settings
 * - Carregar produtos do banco: GET /api/products
 * - Salvar agendamento: POST /api/appointments
 * - Salvar cliente: POST /api/clients
 * - Buscar agendamentos do cliente: GET /api/appointments?phone={phone}
 * - Todas as informações do cliente devem vir do banco de dados
 */

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, getWhatsAppLink, ServiceType } from '@/lib/mock-data';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import ServiceTag from '@/components/ServiceTag';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Clock,
  ChevronLeft,
  Check,
  User,
  Phone,
  Calendar,
  MessageCircle,
  Package,
  ShoppingBag,
  ChevronRight
} from 'lucide-react';

type Step = 'services' | 'calendar' | 'professional' | 'time' | 'confirm';

// Máscara de telefone
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

const ClientBooking = () => {
  const { services, professionals, appointments, blockedDays, products, settings, addAppointment, addClient } = useApp();
  
  const [step, setStep] = useState<Step>('services');
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<typeof professionals[0] | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMyAppointments, setShowMyAppointments] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  // Gera os dias do mês atual
  const calendarDays = useMemo(() => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Dias vazios do mês anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [currentCalendarMonth]);

  // Verifica quais dias estão disponíveis
  const isDateAvailable = (date: Date) => {
    if (!selectedService) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Não permite datas passadas
    if (date < today) return false;
    
    // Verifica se ultrapassa o limite configurado pelo admin
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + settings.scheduleMonthsAhead);
    if (date > maxDate) return false;
    
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];
    
    // Verifica se o dia está inativo nas configurações
    if (settings.inactiveDays.includes(dayOfWeek)) return false;
    
    // Verifica se há profissional disponível que oferece o serviço
    const hasAvailableProfessional = professionals.some(prof => {
      const offersService = prof.services.includes(selectedService.id);
      const isWorkDay = prof.workDays.includes(dayOfWeek);
      const isBlocked = blockedDays.some(b => b.date === dateStr && b.professionalId === prof.id);
      return offersService && isWorkDay && !isBlocked;
    });
    
    return hasAvailableProfessional;
  };

  // TODO Backend: Buscar profissionais disponíveis do banco
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

  // TODO Backend: Buscar horários disponíveis do banco
  const availableTimes = useMemo(() => {
    if (!selectedDate || !selectedProfessional || !selectedService) return [];
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    const bookedTimes = appointments
      .filter(a => a.date === dateStr && a.professionalId === selectedProfessional.id && a.status === 'scheduled')
      .map(a => a.time);
    
    const times: { time: string; available: boolean }[] = [];
    const [startH] = selectedProfessional.workHours.start.split(':').map(Number);
    const [endH] = selectedProfessional.workHours.end.split(':').map(Number);
    
    const interval = settings.timeSlotInterval;
    
    for (let h = startH; h < endH; h++) {
      const minutes = interval === 30 ? ['00', '30'] : ['00'];
      for (const m of minutes) {
        const time = `${h.toString().padStart(2, '0')}:${m}`;
        const isBooked = bookedTimes.includes(time);
        
        const now = new Date();
        const isToday = dateStr === now.toISOString().split('T')[0];
        const isPast = isToday && (h < now.getHours() || (h === now.getHours() && parseInt(m) <= now.getMinutes()));
        
        times.push({ time, available: !isBooked && !isPast });
      }
    }
    
    return times;
  }, [selectedDate, selectedProfessional, selectedService, appointments, settings.timeSlotInterval]);

  // TODO Backend: Buscar agendamentos do cliente pelo telefone
  const clientAppointments = useMemo(() => {
    if (!searchPhone) return [];
    const cleanPhone = searchPhone.replace(/\D/g, '');
    return appointments.filter(a => 
      a.clientPhone.replace(/\D/g, '').includes(cleanPhone) && 
      a.status === 'scheduled'
    );
  }, [appointments, searchPhone]);

  // Calcula total (serviço + produtos)
  const totalPrice = useMemo(() => {
    const servicePrice = selectedService?.price || 0;
    const productsPrice = selectedProducts.reduce((sum, productId) => {
      const product = products.find(p => p.id === productId);
      return sum + (product?.price || 0);
    }, 0);
    return servicePrice + productsPrice;
  }, [selectedService, selectedProducts, products]);

  const handleSelectService = (service: typeof services[0]) => {
    setSelectedService(service);
    setCurrentCalendarMonth(new Date());
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    if (formatted.length <= 15) {
      setClientPhone(formatted);
    }
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // TODO Backend: Salvar agendamento e cliente no banco de dados
  const handleConfirm = () => {
    if (!clientName.trim()) {
      toast.error('Preencha seu nome');
      return;
    }
    
    const cleanPhone = clientPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Telefone inválido');
      return;
    }

    if (!selectedService || !selectedDate || !selectedProfessional || !selectedTime) {
      return;
    }

    // TODO Backend: POST /api/clients
    addClient({
      name: clientName,
      phone: clientPhone,
      totalVisits: 1,
      lastVisit: selectedDate.toISOString().split('T')[0]
    });

    // TODO Backend: POST /api/appointments
    addAppointment({
      clientId: '', // TODO Backend: Usar ID retornado do banco
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
      price: totalPrice,
      status: 'scheduled',
      products: selectedProducts.map(id => ({ productId: id, quantity: 1 }))
    });

    setShowSuccess(true);
  };

  const openWhatsApp = () => {
    // Usa template de mensagem configurado pelo admin
    let message = settings.whatsappMessage
      .replace('{nome}', clientName)
      .replace('{data}', selectedDate?.toLocaleDateString('pt-BR') || '')
      .replace('{horario}', selectedTime || '')
      .replace('{servico}', selectedService?.name || '');
    
    if (selectedProducts.length > 0) {
      const productNames = selectedProducts.map(id => {
        const product = products.find(p => p.id === id);
        return product?.name;
      }).filter(Boolean).join(', ');
      message += `\n\n📦 Produtos: ${productNames}`;
    }
    
    message += `\n\n💰 Total: ${formatCurrency(totalPrice)}`;
    
    window.open(getWhatsAppLink(clientPhone, message), '_blank');
  };

  const goBack = () => {
    switch (step) {
      case 'calendar': setStep('services'); break;
      case 'professional': setStep('calendar'); break;
      case 'time': setStep('professional'); break;
      case 'confirm': setStep('time'); break;
    }
  };

  const resetBooking = () => {
    setStep('services');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedProfessional(null);
    setSelectedTime(null);
    setSelectedProducts([]);
    setClientName('');
    setClientPhone('');
    setShowSuccess(false);
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  };

  const getMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const canNavigateNext = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + settings.scheduleMonthsAhead);
    const nextMonth = new Date(currentCalendarMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
    return nextMonth <= maxDate;
  };

  const canNavigatePrev = () => {
    const today = new Date();
    today.setDate(1);
    return currentCalendarMonth > today;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
          <Logo size="md" />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {/* Actions */}
        <div className="flex gap-2 mb-6">
          <Button 
            variant={!showMyAppointments ? 'default' : 'outline'} 
            className="flex-1"
            onClick={() => setShowMyAppointments(false)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Agendar
          </Button>
          <Button 
            variant={showMyAppointments ? 'default' : 'outline'} 
            className="flex-1"
            onClick={() => setShowMyAppointments(true)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Meus Agendamentos
          </Button>
        </div>

        {/* My Appointments View */}
        {showMyAppointments && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label>Digite seu telefone para buscar</Label>
              <Input
                placeholder="(11) 99999-9999"
                value={searchPhone}
                onChange={(e) => setSearchPhone(formatPhone(e.target.value))}
                maxLength={15}
              />
            </div>
            
            {searchPhone && clientAppointments.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{clientAppointments.length} agendamento(s) encontrado(s)</p>
                {clientAppointments.map((apt) => (
                  <Card key={apt.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ServiceTag type={apt.serviceType} />
                        <span className="font-semibold">{apt.serviceName}</span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {apt.professionalName}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(apt.date).toLocaleDateString('pt-BR')} às {apt.time}
                        </p>
                        <p className="text-primary font-bold">{formatCurrency(apt.price)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {searchPhone && searchPhone.length >= 10 && clientAppointments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum agendamento encontrado
              </p>
            )}
          </div>
        )}

        {/* Booking Flow */}
        {!showMyAppointments && (
          <>
            {/* Progress */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {(['services', 'calendar', 'professional', 'time', 'confirm'] as Step[]).map((s) => {
                const steps = ['services', 'calendar', 'professional', 'time', 'confirm'];
                const currentIdx = steps.indexOf(step);
                const stepIdx = steps.indexOf(s);
                return (
                  <div
                    key={s}
                    className={`h-2 rounded-full transition-all ${
                      step === s ? 'w-8 bg-primary' : 
                      currentIdx > stepIdx ? 'w-4 bg-primary/50' : 'w-4 bg-muted'
                    }`}
                  />
                );
              })}
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

            {/* Step: Calendar - Mês completo com navegação */}
            {step === 'calendar' && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">Escolha a data</h1>
                  <p className="text-muted-foreground">Dias disponíveis para agendamento</p>
                </div>
                
                {/* Calendar Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentCalendarMonth(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() - 1))}
                    disabled={!canNavigatePrev()}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg font-semibold capitalize">
                    {getMonthYear(currentCalendarMonth)}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentCalendarMonth(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1))}
                    disabled={!canNavigateNext()}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((date, idx) => {
                    if (!date) {
                      return <div key={`empty-${idx}`} />;
                    }

                    const available = isDateAvailable(date);
                    const isSelected = selectedDate?.toDateString() === date.toDateString();

                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => available && handleSelectDate(date)}
                        disabled={!available}
                        className={`
                          aspect-square rounded-lg border transition-all text-sm font-medium
                          animate-scale-in
                          ${isSelected 
                            ? 'border-primary bg-primary text-primary-foreground' 
                            : available 
                              ? 'border-border bg-card hover:border-primary hover:bg-primary/10 cursor-pointer' 
                              : 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                          }
                        `}
                        style={{ animationDelay: `${idx * 20}ms` }}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>

                {/* Info about unavailable dates */}
                <div className="mt-6 p-4 bg-secondary/50 rounded-lg text-xs text-muted-foreground space-y-1">
                  <p>• Datas cinzas estão indisponíveis</p>
                  <p>• Apenas dias configurados pelo estabelecimento aparecem</p>
                  <p>• Máximo {settings.scheduleMonthsAhead} {settings.scheduleMonthsAhead === 1 ? 'mês' : 'meses'} à frente</p>
                </div>
              </div>
            )}

            {/* Step: Professional - Layout centralizado */}
            {step === 'professional' && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">Escolha o profissional</h1>
                  <p className="text-muted-foreground">
                    Disponíveis em {selectedDate?.toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4 justify-center">
                  {availableProfessionals.map((prof, idx) => (
                    <button
                      key={prof.id}
                      onClick={() => handleSelectProfessional(prof)}
                      className="flex flex-col items-center min-w-[100px] p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/10 transition-all animate-scale-in"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {prof.photo ? (
                        <img 
                          src={prof.photo} 
                          alt={prof.name}
                          className="h-16 w-16 rounded-full object-cover mb-2"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                          <span className="text-xl font-bold text-primary">{prof.avatar}</span>
                        </div>
                      )}
                      <h3 className="font-semibold text-sm text-center">{prof.name}</h3>
                      <p className="text-xs text-muted-foreground">{prof.role}</p>
                    </button>
                  ))}
                </div>
                
                {availableProfessionals.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum profissional disponível nesta data
                  </p>
                )}
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
                
                <ScrollArea className="w-full">
                  <div className="flex flex-wrap gap-2 pb-4">
                    {availableTimes.map(({ time, available }, idx) => (
                      <Button
                        key={time}
                        variant={available ? 'outline' : 'ghost'}
                        disabled={!available}
                        className={`min-w-[70px] h-12 animate-scale-in ${!available ? 'opacity-30' : ''}`}
                        style={{ animationDelay: `${idx * 20}ms` }}
                        onClick={() => available && handleSelectTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
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
                    
                    {selectedProducts.length > 0 && (
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                          <span>Produtos selecionados:</span>
                        </div>
                        <div className="space-y-1 pl-6">
                          {selectedProducts.map(productId => {
                            const product = products.find(p => p.id === productId);
                            return product && (
                              <p key={productId} className="text-sm flex justify-between">
                                <span>{product.name}</span>
                                <span className="text-primary">{formatCurrency(product.price)}</span>
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-border flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(totalPrice)}
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
                      maxLength={100}
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
                      onChange={handlePhoneChange}
                      maxLength={15}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2" 
                    onClick={() => setShowProductsModal(true)}
                    disabled={products.filter(p => p.stock > 0).length === 0}
                  >
                    <Package className="h-4 w-4" />
                    Ver produtos
                  </Button>
                  <Button className="flex-1" onClick={handleConfirm}>
                    Confirmar Agendamento
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Products Modal */}
      <Dialog open={showProductsModal} onOpenChange={setShowProductsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar produtos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {products.filter(p => p.stock > 0).length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {products.filter(p => p.stock > 0).map((product) => (
                  <Card
                    key={product.id}
                    className={`cursor-pointer transition-all ${
                      selectedProducts.includes(product.id) ? 'border-primary bg-primary/10' : ''
                    }`}
                    onClick={() => toggleProduct(product.id)}
                  >
                    <CardContent className="p-3">
                      <div className="aspect-square rounded-lg bg-muted mb-2 flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                      <p className="text-primary font-bold text-sm">{formatCurrency(product.price)}</p>
                      {selectedProducts.includes(product.id) && (
                        <Badge className="mt-2 w-full justify-center">
                          <Check className="h-3 w-3 mr-1" />
                          Selecionado
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum produto disponível
              </p>
            )}
          </div>
          <Button onClick={() => setShowProductsModal(false)} className="w-full">
            Fechar
          </Button>
        </DialogContent>
      </Dialog>

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
                {selectedProducts.length > 0 && (
                  <p className="text-muted-foreground">
                    + {selectedProducts.length} produto(s)
                  </p>
                )}
                <p className="text-primary font-bold">{formatCurrency(totalPrice)}</p>
              </CardContent>
            </Card>
            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={openWhatsApp} className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Abrir WhatsApp
              </Button>
              <Button variant="outline" onClick={resetBooking}>
                Voltar ao início
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientBooking;
