import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { toast } from "sonner";

interface EmployeeData {
  name: string;
  email: string;
  phone: string;
}

const EmployeeSetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch inicial do funcionário
  useEffect(() => {
    if (!token) {
      toast.error("Token inválido");
      navigate("/");
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/employees/invite-info/${token}`);
        const data = await res.json();
        const userWrapper = data.user;

        if (!userWrapper || !userWrapper.data || userWrapper.data.length === 0) {
          toast.error("Convite inválido");
          navigate("/");
          return;
        }

        const employeeInfo = userWrapper.data[0];


        setEmployee(employeeInfo);
      } catch (e) {
        toast.error("Erro ao carregar dados do funcionário");
      } finally {
        setLoadingEmployee(false);
      }
    };

    load();
  }, [token]);

  const validate = () => {
    if (password.length < 6) {
      toast.error("A senha precisa ter no mínimo 6 caracteres");
      return false;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/employees/complete-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Erro ao criar senha");
        setIsSubmitting(false);
        return;
      }

      toast.success("Senha cadastrada com sucesso");
      navigate("/login");
    } catch (err) {
      toast.error("Erro de conexão com o servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingEmployee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex flex-col items-center space-y-4 mb-4">
        <div className="p-4 bg-card rounded-2xl border border-border">
          <Logo size="lg" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Definir Senha</h1>
          <p className="text-muted-foreground">
            Conclua seu cadastro como profissional
          </p>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {employee.name}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* PASSWORD */}
            <div className="space-y-2">
              <Label>Senha</Label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-0 top-0 h-full px-3"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* CONFIRM */}
            <div className="space-y-2">
              <Label>Confirmar Senha</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-0 top-0 h-full px-3"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button disabled={isSubmitting} className="w-full" type="submit">
              {isSubmitting ? "Salvando..." : "Criar Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeSetPassword;
