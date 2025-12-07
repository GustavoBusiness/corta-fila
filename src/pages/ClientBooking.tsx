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
import { Checkbox } from '@/components/ui/checkbox';
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
  ShoppingBag
} from 'lucide-react';

type Step = 'services' | 'calendar' | 'professional' | 'time' | 'products' | 'confirm';

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

  // TODO Backend: Buscar dias disponíveis baseado nas configurações do admin
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Usa configuração do admin para quantidade de meses
    const daysAhead = settings.scheduleMonthsAhead * 30;
    
    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const dayOfWeek = date.getDay();
      const dateStr = date.toISOString().split('T')[0];
      
      // Verifica se o dia está inativo nas configurações
      if (settings.inactiveDays.includes(dayOfWeek)) continue;
      
      // Verifica se há profissional disponível
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
  }, [professionals, blockedDays, settings.scheduleMonthsAhead, settings.inactiveDays]);

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
    
    // Usa intervalo configurado pelo admin
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
    // Se admin habilitou produtos, mostra tela de produtos
    if (settings.showProductsInBooking && products.length > 0) {
      setStep('products');
    } else {
      setStep('confirm');
    }
  };

  const handleSkipProducts = () => {
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
      case 'products': setStep('time'); break;
      case 'confirm': 
        if (settings.showProductsInBooking && products.length > 0) {
          setStep('products');
        } else {
          setStep('time');
        }
        break;
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
              {(['services', 'calendar', 'professional', 'time', 'products', 'confirm'] as Step[]).map((s, idx) => {
                if (s === 'products' && (!settings.showProductsInBooking || products.length === 0)) return null;
                const steps = ['services', 'calendar', 'professional', 'time'];
                if (settings.showProductsInBooking && products.length > 0) steps.push('products');
                steps.push('confirm');
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

            {/* Step: Calendar - Layout horizontal com blocos de data */}
            {step === 'calendar' && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">Escolha a data</h1>
                  <p className="text-muted-foreground">Dias disponíveis para agendamento</p>
                </div>
                
                <ScrollArea className="w-full">
                  <div className="flex gap-3 pb-4">
                    {availableDates.slice(0, 21).map((date, idx) => (
                      <button
                        key={date.toISOString()}
                        onClick={() => handleSelectDate(date)}
                        className="flex flex-col items-center justify-center min-w-[70px] h-20 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/10 transition-all animate-scale-in"
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        <span className="text-lg font-bold">
                          {date.getDate()}/{date.getMonth() + 1}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {getDayName(date)}
                        </span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Step: Professional - Layout horizontal com fotos */}
            {step === 'professional' && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">Escolha o profissional</h1>
                  <p className="text-muted-foreground">
                    Disponíveis em {selectedDate?.toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <ScrollArea className="w-full">
                  <div className="flex gap-4 pb-4">
                    {availableProfessionals.map((prof, idx) => (
                      <button
                        key={prof.id}
                        onClick={() => handleSelectProfessional(prof)}
                        className="flex flex-col items-center min-w-[100px] p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/10 transition-all animate-scale-in"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        {/* TODO Backend: Carregar foto do profissional do storage */}
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
                </ScrollArea>
                
                {availableProfessionals.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum profissional disponível nesta data
                  </p>
                )}
              </div>
            )}

            {/* Step: Time - Layout horizontal */}
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

            {/* Step: Products */}
            {step === 'products' && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">Adicionar produtos?</h1>
                  <p className="text-muted-foreground">Selecione produtos para seu atendimento</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {products.filter(p => p.stock > 0).map((product, idx) => (
                    <Card
                      key={product.id}
                      className={`cursor-pointer transition-all animate-scale-in ${
                        selectedProducts.includes(product.id) ? 'border-primary bg-primary/10' : ''
                      }`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      onClick={() => toggleProduct(product.id)}
                    >
                      <CardContent className="p-3">
                        {/* TODO Backend: Carregar foto do produto do storage */}
                        <div className="aspect-square rounded-lg bg-muted mb-2 flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                        <p className="text-primary font-bold">{formatCurrency(product.price)}</p>
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

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={handleSkipProducts}>
                    Pular
                  </Button>
                  <Button className="flex-1" onClick={() => setStep('confirm')}>
                    Continuar
                    {selectedProducts.length > 0 && ` (${selectedProducts.length})`}
                  </Button>
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

                <Button className="w-full h-12 text-lg" onClick={handleConfirm}>
                  Confirmar Agendamento
                </Button>
              </div>
            )}
          </>
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
