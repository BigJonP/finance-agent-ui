// API configuration
const API_BASE_URL = process.env.FINANCE_AGENT_API_URL || 'http://localhost:8000';

// Types
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
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorData}`);
  }

  return response.json();
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

  signIn: async (data: SignInData): Promise<User> => {
    return apiRequest<User>('/user/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
    return apiRequest<{ message: string }>('/holding/', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
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
