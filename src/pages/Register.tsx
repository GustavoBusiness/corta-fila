import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Building2, Mail, Phone, MapPin, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface RegisterFormData {
  companyName: string;
  companyAddress: string;

  userName: string;
  userEmail: string;
  userPhone: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');

  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState<RegisterFormData>({
    companyName: '',
    companyAddress: '',
    userName: '',
    userEmail: '',
    userPhone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.companyName.trim()) newErrors.companyName = 'Nome da empresa é obrigatório';
    if (!formData.companyAddress.trim()) newErrors.companyAddress = 'Endereço é obrigatório';

    if (!formData.userName.trim()) newErrors.userName = 'Nome do usuário é obrigatório';

    if (!formData.userEmail.trim()) {
      newErrors.userEmail = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      newErrors.userEmail = 'E-mail inválido';
    }

    if (!formData.userPhone.trim()) newErrors.userPhone = 'Telefone é obrigatório';

    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    const payload = {
      company: {
        name: formData.companyName,
        address: formData.companyAddress
      },
      user: {
        name: formData.userName,
        email: formData.userEmail,
        phone: formData.userPhone,
        password: formData.password
      }
    };

    try {
      const res = await fetch(`${API_URL}/company/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao cadastrar empresa');
        setIsLoading(false);
        return;
      }

      const conflicting_fields = data.conflicting_fields || [];

      if (data.statusCode === 409) {
        // conflitos específicos
        if (conflicting_fields.includes('email')) {
          setErrors(prev => ({ ...prev, userEmail: 'E-mail já cadastrado' }));
        }

        if (conflicting_fields.includes('phone')) {
          setErrors(prev => ({ ...prev, userPhone: 'Telefone já cadastrado' }));
        }

        toast.error('Informações já cadastradas');
        return; // evita continuar o fluxo
      }

      // outros erros tratados pelo backend
      if (data.statusCode && data.statusCode >= 400) {
        toast.error(data.message || 'Erro ao realizar cadastro');
        return;
      }

      // sucesso real
      toast.success('Cadastro realizado com sucesso');
      setStep('success');

    } catch (err) {
      // erro de rede, timeout, backend fora, etc
      toast.error('Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => navigate('/login');

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
            <h2 className="text-2xl font-bold mb-2">Cadastro Realizado!</h2>
            <p className="text-muted-foreground">
              Sua empresa <span className="font-semibold">{formData.companyName}</span> foi cadastrada.
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
      <div className="absolute top-4 left-4">
        <BackButton />
      </div>

      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-card rounded-2xl border border-border">
            <Logo size="lg" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Cadastre sua Empresa</h1>
            <p className="text-muted-foreground">Comece a gerenciar seus agendamentos</p>
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Dados da Empresa
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* COMPANY */}
              <div className="space-y-2">
                <Label>Nome da Empresa</Label>
                <Input
                  placeholder="Ex: Barbearia do Zé"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className={errors.companyName ? 'border-destructive' : ''}
                />
                {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
              </div>

              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input
                  placeholder="Rua, número, bairro..."
                  value={formData.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                  className={errors.companyAddress ? 'border-destructive' : ''}
                />
                {errors.companyAddress && <p className="text-xs text-destructive">{errors.companyAddress}</p>}
              </div>

              {/* USER */}
              <div className="space-y-2">
                <Label>Seu Nome</Label>
                <Input
                  placeholder="Seu nome"
                  value={formData.userName}
                  onChange={(e) => handleInputChange('userName', e.target.value)}
                  className={errors.userName ? 'border-destructive' : ''}
                />
                {errors.userName && <p className="text-xs text-destructive">{errors.userName}</p>}
              </div>

              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  placeholder="voce@email.com"
                  value={formData.userEmail}
                  onChange={(e) => handleInputChange('userEmail', e.target.value)}
                  className={errors.userEmail ? 'border-destructive' : ''}
                />
                {errors.userEmail && <p className="text-xs text-destructive">{errors.userEmail}</p>}
              </div>

              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={formData.userPhone}
                  onChange={(e) => handleInputChange('userPhone', e.target.value)}
                  className={errors.userPhone ? 'border-destructive' : ''}
                />
                {errors.userPhone && <p className="text-xs text-destructive">{errors.userPhone}</p>}
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <Label>Senha</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label>Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-0 h-full px-3"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Cadastrando...' : 'Cadastrar Empresa'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Button variant="link" className="p-0 h-auto text-primary" onClick={() => navigate('/login')}>
            Faça login
          </Button>
        </p>
      </div>
    </div>
  );
};

export default Register;
