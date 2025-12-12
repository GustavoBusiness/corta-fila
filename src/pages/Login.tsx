import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import PhoneInput, { cleanPhone } from '@/components/PhoneInput';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from "@/contexts/AuthContext";
import { AuthService } from "@/services/AuthService";

interface LoginFormData {
  userPhone: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    userPhone: '',
    password: ''
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  // ============================
  // VALIDAÇÃO DO FORMULÁRIO
  // ============================
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.userPhone.trim()) newErrors.userPhone = 'Telefone é obrigatório';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // ============================
  // SUBMIT DO LOGIN
  // ============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // ---- LÓGICA DESACOPLADA ----
    const result = await AuthService.login(formData.userPhone, formData.password);

    if (!result.success) {
      toast.error(result.message);
      setIsLoading(false);
      return;
    }

    // Sucesso
    toast.success("Login realizado com sucesso");

    // Atualiza contexto (assim como antes)
    login(result.user.role, String(result.user.id), result.user.name);

    setIsLoading(false);
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
            <h1 className="text-2xl font-bold">Entre com sua conta</h1>
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

              {/* PHONE */}
              <div className="space-y-2">
                <Label>Telefone</Label>
                <PhoneInput
                  value={formData.userPhone}
                  onChange={(value) => handleInputChange('userPhone', value)}
                  error={!!errors.userPhone}
                />
                {errors.userPhone && <p className="text-xs text-destructive">{errors.userPhone}</p>}
              </div>

              {/* SENHA */}
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
          <Button
            variant="link"
            className="p-0 h-auto text-primary"
            onClick={() => navigate('/registro')}
          >
            Faça Cadastro
          </Button>
        </p>

      </div>
    </div>
  );
};

export default Login;
