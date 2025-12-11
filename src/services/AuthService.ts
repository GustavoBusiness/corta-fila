// services/AuthService.ts

const API_URL = import.meta.env.VITE_API_URL;

export const AuthService = {
  // ===============================
  // SALVAR / BUSCAR / LIMPAR TOKEN
  // ===============================
  saveToken(token: string) {
    localStorage.setItem("cortafila:auth:token", token);
  },

  getToken() {
    return localStorage.getItem("cortafila:auth:token");
  },

  clearToken() {
    localStorage.removeItem("cortafila:auth:token");
  },

  // ===============================
  // LOGIN (NOVA PARTE DESACOPLADA)
  // ===============================
  async login(phone: string, password: string) {
    const payload = {
      user: {
        phone,
        password
      }
    };

    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      // Retorno de erro padronizado
      if (data.success === false) {
        return {
          success: false,
          message: data.error || data.message || "Erro ao fazer login"
        };
      }

      // Salvando dados de autenticação
      this.saveToken(data.token);
      localStorage.setItem("cortafila:auth:user", JSON.stringify(data.user));

      return {
        success: true,
        token: data.token,
        user: data.user
      };

    } catch (err) {
      console.log("[AuthService] LOGIN ERROR:", err);
      return {
        success: false,
        message: "Erro de conexão com o servidor"
      };
    }
  },

  // ===============================
  // VALIDAÇÃO DE TOKEN
  // ===============================
  async validateToken() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_URL}users/validate`, {
        method: "POST",
        body: JSON.stringify({ token }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) return null;

      const json = await res.json();

      if (!json.success || !json.data) return null;

      return json.data;
    } catch (err) {
      console.log("[AuthService] validateToken ERROR:", err);
      return null;
    }
  }
};
