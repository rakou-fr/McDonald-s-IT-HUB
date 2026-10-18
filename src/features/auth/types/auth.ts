export interface User {
  id: string;
  username: string;
  password_hash: string;
  role: string;
  active: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    username: string;
    role: string;
  };
  error?: string;
}