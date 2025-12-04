import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { professionals } from '@/lib/mock-data';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@cortafila.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail && adminPassword) {
      login('admin', 'admin-1', 'Administrador');
      toast.success('Bem-vindo, Administrador!');
      navigate('/admin');
    }
  };

  const handleEmployeeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProfessional) {
      const professional = professionals.find(p => p.id === selectedProfessional);
      if (professional) {
        login('employee', professional.id, professional.name);
        toast.success(`Bem-vindo, ${professional.name}!`);
        navigate('/funcionario');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-card rounded-2xl border border-border">
            <Logo size="lg" />
          </div>
          <p className="text-muted-foreground text-center">
            Sistema de Agendamento
          </p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Selecione seu tipo de acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="admin" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="employee" className="gap-2">
                  <User className="h-4 w-4" />
                  Funcionário
                </TabsTrigger>
              </TabsList>

              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">E-mail</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="bg-secondary/50 pr-10"
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
                  </div>
                  <Button type="submit" className="w-full">
                    Entrar como Administrador
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="employee">
                <form onSubmit={handleEmployeeLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profissional</Label>
                    <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue placeholder="Selecione seu nome" />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals.map((prof) => (
                          <SelectItem key={prof.id} value={prof.id}>
                            {prof.name} - {prof.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employee-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="employee-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={employeePassword}
                        onChange={(e) => setEmployeePassword(e.target.value)}
                        className="bg-secondary/50 pr-10"
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
                  </div>
                  <Button type="submit" className="w-full" disabled={!selectedProfessional}>
                    Entrar como Funcionário
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          É cliente?{' '}
          <Button
            variant="link"
            className="p-0 h-auto text-primary"
            onClick={() => navigate('/agendar')}
          >
            Agende aqui
          </Button>
        </p>
      </div>
    </div>
  );
};

export default Login;
