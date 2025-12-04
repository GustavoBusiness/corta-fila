import { useTheme } from '@/contexts/ThemeContext';
import Logo from '@/components/Logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Moon, Sun, Bell, Shield, Database } from 'lucide-react';

const AdminConfiguracoes = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Personalize o sistema</p>
      </div>

      {/* Aparência */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Aparência
          </CardTitle>
          <CardDescription>Escolha o tema do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-lg border-2 transition-all ${
                theme === 'light' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <div className="h-20 rounded bg-gradient-to-b from-gray-100 to-white mb-2 flex items-center justify-center">
                <Sun className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="font-medium">Claro</p>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-lg border-2 transition-all ${
                theme === 'dark' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <div className="h-20 rounded bg-gradient-to-b from-gray-800 to-gray-900 mb-2 flex items-center justify-center">
                <Moon className="h-8 w-8 text-blue-400" />
              </div>
              <p className="font-medium">Escuro</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>Configure alertas e lembretes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Novos agendamentos</Label>
              <p className="text-sm text-muted-foreground">Receba alertas de novos agendamentos</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Cancelamentos</Label>
              <p className="text-sm text-muted-foreground">Alertas quando um cliente cancelar</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Lembretes automáticos</Label>
              <p className="text-sm text-muted-foreground">Enviar lembretes para clientes</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Negócio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Dados do Negócio
          </CardTitle>
          <CardDescription>Informações da empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Estabelecimento</Label>
            <Input defaultValue="Corta Fila Barbearia" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input defaultValue="(11) 99999-9999" />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input defaultValue="12.345.678/0001-00" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input defaultValue="Rua Exemplo, 123 - Centro" />
          </div>
          <Button onClick={() => toast.success('Dados salvos!')}>
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>

      {/* Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sistema
          </CardTitle>
          <CardDescription>Informações técnicas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Versão</span>
            <span className="font-mono">1.0.0</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Última atualização</span>
            <span className="font-mono">{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
          <Separator />
          <div className="pt-2">
            <div className="flex justify-center mb-4">
              <Logo size="md" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Sistema de Agendamento Corta Fila<br />
              Desenvolvido com ❤️
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminConfiguracoes;
