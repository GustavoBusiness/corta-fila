import { useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Logo from '@/components/Logo';
import PhoneInput from '@/components/PhoneInput';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Moon, Sun, Bell, Shield, Database, Calendar, MessageSquare, Upload, Image } from 'lucide-react';

const weekDays = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

const AdminConfiguracoes = () => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(settings.companyLogo || null);

  const toggleInactiveDay = (day: number) => {
    const newDays = settings.inactiveDays.includes(day)
      ? settings.inactiveDays.filter(d => d !== day)
      : [...settings.inactiveDays, day];
    updateSettings({ inactiveDays: newDays });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCompanyLogo(base64);
        updateSettings({ companyLogo: base64 });
        toast.success('Logo atualizada!');
      };
      reader.readAsDataURL(file);
    }
  };

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
              <div className="h-20 rounded bg-gradient-to-b from-gray-100 to-white mb-2 flex items-center justify-center border">
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

      {/* Agenda Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Configurações da Agenda
          </CardTitle>
          <CardDescription>Defina como a agenda será liberada para clientes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Liberar agenda para quantos meses à frente?</Label>
            <Select 
              value={settings.scheduleMonthsAhead.toString()} 
              onValueChange={(v) => {
                updateSettings({ scheduleMonthsAhead: parseInt(v) as 1 | 2 | 3 });
                toast.success('Meses à frente atualizados!');
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 mês</SelectItem>
                <SelectItem value="2">2 meses</SelectItem>
                <SelectItem value="3">3 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Intervalo de horários</Label>
            <Select 
              value={settings.timeSlotInterval.toString()} 
              onValueChange={(v) => {
                updateSettings({ timeSlotInterval: parseInt(v) as 30 | 60 });
                toast.success('Intervalo atualizado!');
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 em 30 minutos</SelectItem>
                <SelectItem value="60">1 em 1 hora</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Dias inativos (não aparecem para clientes)</Label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => (
                <Button
                  key={day.value}
                  size="sm"
                  variant={settings.inactiveDays.includes(day.value) ? 'destructive' : 'outline'}
                  onClick={() => {
                    toggleInactiveDay(day.value);
                    toast.success('Dia atualizado!');
                  }}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Mostrar produtos no agendamento</Label>
              <p className="text-sm text-muted-foreground">Cliente pode adicionar produtos ao agendar</p>
            </div>
            <Switch 
              checked={settings.showProductsInBooking}
              onCheckedChange={(checked) => updateSettings({ showProductsInBooking: checked })}
            />
          </div>
        </CardContent>
      </Card>


      {/* WhatsApp Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensagem WhatsApp
          </CardTitle>
          <CardDescription>Mensagem enviada ao cliente após confirmar agendamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Modelo da mensagem</Label>
            <Textarea
              rows={6}
              value={settings.whatsappMessage}
              onChange={(e) => updateSettings({ whatsappMessage: e.target.value })}
              placeholder="Use: {nome}, {servico}, {profissional}, {data}, {horario}"
            />
            <p className="text-xs text-muted-foreground">
              Variáveis: {'{nome}'}, {'{servico}'}, {'{profissional}'}, {'{data}'}, {'{horario}'}
            </p>
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
          {/* Upload de Logo da Empresa */}
          <div className="space-y-2">
            <Label>Logo da Empresa</Label>
            <div className="flex items-center gap-4">
              <div 
                className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/50 cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {companyLogo ? (
                  <img src={companyLogo} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <Image className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Enviar Logo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Máx. 5MB</p>
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Nome do Estabelecimento</Label>
            <Input 
              value={settings.businessName}
              onChange={(e) => updateSettings({ businessName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefone</Label>
              <PhoneInput 
                value={settings.businessPhone}
                onChange={(value) => updateSettings({ businessPhone: value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input 
                value={settings.businessCnpj}
                onChange={(e) => updateSettings({ businessCnpj: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input 
              value={settings.businessAddress}
              onChange={(e) => updateSettings({ businessAddress: e.target.value })}
            />
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
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Versão</span>
            <span className="font-mono">1.0.0</span>
          </div>
          <Separator />
          <div className="pt-2">
            <div className="flex justify-center mb-4">
              <Logo size="md" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Sistema de Agendamento Corta Fila
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminConfiguracoes;
