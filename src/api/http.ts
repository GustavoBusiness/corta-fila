export async function http<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(import.meta.env.VITE_API_URL + url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    ...options,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || 'Erro inesperado');
  }

  // 🔥 NORMALIZA AQUI
  return json.data as T;
}
