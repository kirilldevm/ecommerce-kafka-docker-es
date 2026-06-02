import axios from 'axios';
import { apiConfig } from '@/config/api.config';

export const authHttp = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeoutMs,
  headers: { 'Content-Type': 'application/json' },
});
