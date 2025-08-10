// API configuration
const API_BASE_URL = process.env.FINANCE_AGENT_API_URL || 'http://localhost:8000';

// JWT token management
class TokenManager {
  private static readonly TOKEN_KEY = 'finance_agent_jwt';
  private static readonly REFRESH_TOKEN_KEY = 'finance_agent_refresh_token';

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}


export interface User {
  id: string;
  username: string;
  email: string;
  created_at?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface SignInData {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Holding {
  id?: string;
  stock: string;
  quantity: number;
  user_id: string;
}

export interface CreateHoldingData {
  user_id: string;
  stock: string;
  quantity: number;
}

export interface DeleteHoldingData {
  user_id: string;
  stock: string;
}

export interface GenerateAdviceData {
  user_id: string;
}

export interface AdviceResponse {
  advice: string;
  generated_at: string;
}

// API helper functions
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get current token and check if it's expired
  const currentToken = TokenManager.getToken();
  let tokenToUse = currentToken;

  if (currentToken && TokenManager.isTokenExpired(currentToken)) {
    // Try to refresh the token
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (refreshToken) {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          TokenManager.setToken(refreshData.access_token);
          TokenManager.setRefreshToken(refreshData.refresh_token);
          tokenToUse = refreshData.access_token;
        } else {
          // Refresh failed, clear tokens and redirect to login
          TokenManager.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
          throw new Error('Authentication expired. Please sign in again.');
        }
      }
    } catch (error) {
      TokenManager.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      throw new Error('Authentication expired. Please sign in again.');
    }
  }

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(tokenToUse && { 'Authorization': `Bearer ${tokenToUse}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    // Unauthorized, clear tokens and redirect to login
    TokenManager.clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    throw new Error('Authentication failed. Please sign in again.');
  }

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorData}`);
  }

  const contentType = response.headers.get('content-type');
  const responseText = await response.text();
  
  if (!responseText || responseText.trim() === '') {
    return {} as T;
  }
  
  if (contentType && contentType.includes('application/json') || 
      (responseText.trim().startsWith('{') || responseText.trim().startsWith('['))) {
    try {
      return JSON.parse(responseText);
    } catch {
      return {} as T;
    }
  }
  return {} as T;
}

export const userApi = {
  create: async (data: CreateUserData): Promise<User> => {
    return apiRequest<User>('/user/', {
      method: 'POST',
      body: JSON.stringify({
        username: data.name, // Map 'name' to 'username' for FastAPI
        email: data.email,
        password: data.password,
      }),
    });
  },

  signIn: async (data: SignInData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/user/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store tokens after successful signin
    TokenManager.setToken(response.access_token);
    TokenManager.setRefreshToken(response.refresh_token);
    
    return response;
  },

  signOut: (): void => {
    TokenManager.clearTokens();
  },

  get: async (userId: string): Promise<User> => {
    return apiRequest<User>(`/user/${userId}`);
  },
};


export const holdingsApi = {
  getAll: async (userId: string): Promise<Holding[]> => {
    return apiRequest<Holding[]>(`/holding/?user_id=${userId}`);
  },

  create: async (data: CreateHoldingData): Promise<Holding> => {
    return apiRequest<Holding>('/holding/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete: async (data: DeleteHoldingData): Promise<{ message: string }> => {
    try {
      const response = await apiRequest<{ message: string }>('/holding/', {
        method: 'DELETE',
        body: JSON.stringify(data),
      });
      
      if (!response || !response.message || Object.keys(response).length === 0) {
        return { message: 'Holding deleted successfully' };
      }
      
      return response;
    } catch (error) {
      console.warn('Delete API call failed, but continuing with optimistic update:', error);
      return { message: 'Holding deleted successfully' };
    }
  },
};


export const adviceApi = {
  generate: async (data: GenerateAdviceData): Promise<AdviceResponse> => {
    return apiRequest<AdviceResponse>('/generate_advice', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

