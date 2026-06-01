export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  timeoutMs: 15_000,
} as const;
