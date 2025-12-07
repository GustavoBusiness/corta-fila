/**
 * Landing Page - Corta Fila
 * Página de apresentação do sistema para novos clientes
 * 
 * TODO Backend: 
 * - Integrar formulário de contato com API de envio de email
 * - Carregar depoimentos do banco de dados
 * - Analytics de conversão
 */

import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  Users,
  Smartphone,
  TrendingUp,
  Shield,
  Star,
  CheckCircle,
  ArrowRight,
  MessageCircle,
  Zap,
  BarChart3,
  Bell
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: 'Agenda Inteligente',
      description: 'Gerencie agendamentos de forma visual e intuitiva com visualização por dia, semana e mês.'
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Sistema otimizado para dispositivos móveis. Seus clientes agendam de qualquer lugar.'
    },
    {
      icon: Users,
      title: 'Gestão de Equipe',
      description: 'Controle completo de profissionais, horários e disponibilidade de cada membro.'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Integrado',
      description: 'Notificações automáticas e contato direto com clientes via WhatsApp.'
    },
    {
      icon: BarChart3,
      title: 'Relatórios Financeiros',
      description: 'Acompanhe faturamento, ticket médio e serviços mais vendidos em tempo real.'
    },
    {
      icon: Bell,
      title: 'Notificações',
      description: 'Lembretes automáticos para clientes e profissionais sobre agendamentos.'
    }
  ];

  const benefits = [
    'Reduza faltas com lembretes automáticos',
    'Aumente seu faturamento com agenda otimizada',
    'Fidelize clientes com atendimento profissional',
    'Economize tempo com gestão automatizada',
    'Tenha controle total do seu negócio',
    'Aceite agendamentos 24 horas por dia'
  ];

  const testimonials = [
    {
      name: 'Carlos Silva',
      role: 'Barbearia Premium',
      content: 'O Corta Fila revolucionou meu negócio. Reduzi 80% das faltas e aumentei o faturamento em 40%.',
      rating: 5
    },
    {
      name: 'Ana Beatriz',
      role: 'Salão de Beleza VIP',
      content: 'Meus clientes adoram poder agendar pelo celular. A integração com WhatsApp é perfeita!',
      rating: 5
    },
    {
      name: 'Roberto Mendes',
      role: 'Studio Hair',
      content: 'Finalmente tenho controle total da minha agenda e das finanças. Recomendo demais!',
      rating: 5
    }
  ];

  const handleContact = () => {
    // TODO Backend: Integrar com sistema de contato/lead
    const message = encodeURIComponent('Olá! Gostaria de saber mais sobre o Corta Fila.');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/cadastro')}>
              Cadastro
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 animate-fade-in">
            <Zap className="h-4 w-4" />
            Sistema de Agendamento Profissional
          </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-slide-up">
            Gerencie sua agenda
            <br />
            sem complicação
            </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
            O sistema completo para barbearias, salões e profissionais de beleza. 
            Agendamento online, gestão de equipe e relatórios financeiros em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Button size="lg" className="text-lg h-14 px-8 gap-2" onClick={handleContact}>
              <MessageCircle className="h-5 w-5" />
              Entrar em contato
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-14 px-8 gap-2" onClick={() => navigate('/agendar')}>
              Ver demonstração
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramentas poderosas para transformar a gestão do seu negócio
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="group hover:border-primary/50 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Por que escolher o Corta Fila
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Desenvolvido por quem entende as necessidades do seu negócio. 
                Simples, eficiente e feito para crescer junto com você.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className="h-6 w-6 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                    <span className="font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <TrendingUp className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-2xl font-bold">+40%</p>
                  <p className="text-muted-foreground">Aumento médio no faturamento</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl border border-border p-4 shadow-lg animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-warning/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-bold">-80%</p>
                    <p className="text-xs text-muted-foreground">Menos faltas</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-card rounded-xl border border-border p-4 shadow-lg animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-info/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="font-bold">100%</p>
                    <p className="text-xs text-muted-foreground">Seguro</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-lg text-muted-foreground">
              Histórias reais de quem transformou seu negócio
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="font-bold text-primary">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-primary/10 via-card to-primary/5 border-primary/20">
            <CardContent className="p-8 lg:p-12 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Pronto para revolucionar seu negócio?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Comece agora mesmo e descubra como o Corta Fila pode transformar a gestão da sua empresa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg h-14 px-8 gap-2" onClick={handleContact}>
                  <MessageCircle className="h-5 w-5" />
                  Entrar em contato
                </Button>
                <Button size="lg" variant="outline" className="text-lg h-14 px-8" onClick={() => navigate('/cadastro')}>
                  Criar conta grátis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Corta Fila. Todos os direitos reservados.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Termos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
              <a href="#" className="hover:text-foreground transition-colors">Suporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
