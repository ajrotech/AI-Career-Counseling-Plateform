export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
    profile?: {
      firstName: string;
      lastName: string;
    } | null;
  };
  accessToken: string;
  refreshToken: string;
  message: string;
}