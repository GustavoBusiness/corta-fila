import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Building2, Mail, Phone, MapPin, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface RegisterFormData {
  userPhone: string;
  password: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');

  const [formData, setFormData] = useState<RegisterFormData>({
    userPhone: '',
    password: ''
  });

  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};
    if (!formData.userPhone.trim()) newErrors.userPhone = 'Telefone é obrigatório';

    if (!formData.password) newErrors.password = 'Senha é obrigatória';

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
      user: {
        phone: formData.userPhone,
        password: formData.password
      }
    };

    try {
      const res = await fetch('http://localhost:80/CortaFila_Back/public/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data['success'] === false) {
        toast.error(data.error || data['message'] || 'Erro ao cadastrar empresa');
        setIsLoading(false);
        return;
      }

      toast.success('Login realizado com sucesso');
      navigate('/admin/agenda');
    } catch (err) {
      toast.error('Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

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
              {/* TELEPHONE */}

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

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Carregando...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Button variant="link" className="p-0 h-auto text-primary" onClick={() => navigate('/registro')}>
            Faça Cadastro
          </Button>
        </p>
      </div>
    </div>
  );
};

export default Register;
