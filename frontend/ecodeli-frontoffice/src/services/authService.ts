import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export interface RegisterData {
  role: string;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone: string;
  vehicule?: string;
  permisVerif?: boolean;
  siret?: string;
  typeService?: string;
  tarifHoraire?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
}

const authService = {
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/inscription`, userData);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: credentials.email,
      password: credentials.password
    });
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  logout: (): void => {
    localStorage.removeItem('user');
  },
  
  getCurrentUser: (): AuthResponse | null => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  },

  checkEmailAvailability: async (email: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/check-email?email=${email}`);
      return response.data.available;
    } catch (error) {
      return false;
    }
  }
};

export default authService;