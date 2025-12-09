// services/AuthService.ts
const API_URL = import.meta.env.VITE_API_URL;

export const AuthService = {
  saveToken(token: string) {
    localStorage.setItem("cortafila:auth:token", token);
  },

  getToken() {
    return localStorage.getItem("cortafila:auth:token");
  },

  clearToken() {
    localStorage.removeItem("cortafila:auth:token");
  },

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

      // erro http
      if (!res.ok) return null;

      const json = await res.json();

      // valida estrutura
      if (!json.success || !json.data) return null;

      return json.data;
    } catch (err) {
      console.log("[AuthService] validateToken ERROR:", err);
      return null;
    }
  }


};
