// lib/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getPayPalAccessToken } from './paypal-authenticate';

class Api {
  private axiosInstance: AxiosInstance;
  private client_id: string;
  private client_secret: string

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Optional: Add a request interceptor (e.g. auth token)
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await getPayPalAccessToken(this.client_id, this.client_secret);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Optional: Add a response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Customize error handling globally
        const message = error?.response?.data?.message || 'API request failed';
        return Promise.reject(new Error(message));
      }
    );
  }

  public setCredential(client_id: string, client_secret: string) {
    this.client_id = client_id;
    this.client_secret = client_secret;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.axiosInstance.get(url, config);
    return res.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
    return res.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
    return res.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
    return res.data;
  }
}

const isSandbox = Number(process.env.NEXT_PUBLIC_SANDBOX);
const url = isSandbox == 1 ? "https://api-m.sandbox.paypal.com/v1" : "https://api-m.paypal.com/v1";
const api = new Api(url);
export default api;
