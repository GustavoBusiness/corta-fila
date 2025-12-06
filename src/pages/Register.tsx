import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Building2, Mail, Phone, MapPin, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CompanyFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');

  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Partial<CompanyFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CompanyFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da empresa é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulating API call - ready for backend integration
    await new Promise(resolve => setTimeout(resolve, 1500));

    // TODO: Replace with actual API call
    // const response = await api.registerCompany(formData);

    setIsLoading(false);
    setStep('success');
    toast.success('Empresa cadastrada com sucesso!');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-md text-center animate-fade-in">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Cadastro Realizado!</h2>
              <p className="text-muted-foreground">
                Sua empresa <span className="font-semibold text-foreground">{formData.name}</span> foi cadastrada com sucesso.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Agora você pode fazer login e começar a usar o sistema.
            </p>
            <Button onClick={handleGoToLogin} className="w-full gap-2">
              Ir para Login
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-card rounded-2xl border border-border">
            <Logo size="lg" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Cadastre sua Empresa</h1>
            <p className="text-muted-foreground">
              Comece a gerenciar seus agendamentos
            </p>
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>
              Preencha as informações abaixo para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Empresa</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Nome da sua empresa"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`pl-10 bg-secondary/50 ${errors.name ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="empresa@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 bg-secondary/50 ${errors.email ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`pl-10 bg-secondary/50 ${errors.phone ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="Rua, número, bairro, cidade"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`pl-10 bg-secondary/50 ${errors.address ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 bg-secondary/50 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pl-10 pr-10 bg-secondary/50 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Cadastrando...
                  </>
                ) : (
                  'Cadastrar Empresa'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Button
            variant="link"
            className="p-0 h-auto text-primary"
            onClick={() => navigate('/login')}
          >
            Faça login
          </Button>
        </p>
      </div>
    </div>
  );
};

export default Register;
