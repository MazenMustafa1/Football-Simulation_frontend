import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://localhost:7082/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication if needed
    this.api.interceptors.request.use(
      (config) => {
        // Get token from localStorage if it exists
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Handle common errors here (e.g., 401, 403, 500)
        if (error.response) {
          if (error.response.status === 401) {
            // Handle unauthorized access
            // Could add token refresh logic here
            console.error('Unauthorized access');
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic GET method
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, config);
    return response.data;
  }

  // Generic POST method
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data, config);
    return response.data;
  }

  // Generic PUT method
  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data, config);
    return response.data;
  }

  // Generic DELETE method
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url, config);
    return response.data;
  }

  // Method for handling form data (multipart/form-data)
  public async uploadForm<T>(url: string, formData: FormData, method: 'post' | 'put' = 'post', config?: AxiosRequestConfig): Promise<T> {
    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    };

    let response: AxiosResponse<T>;
    if (method === 'put') {
      response = await this.api.put(url, formData, uploadConfig);
    } else {
      response = await this.api.post(url, formData, uploadConfig);
    }

    return response.data;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

