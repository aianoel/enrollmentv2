import { User } from "@shared/schema";

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
}

// Authentication API functions
export const authAPI = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    return response.json();
  },

  async register(userData: any): Promise<AuthResponse> {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    return response.json();
  }
};

// Local storage helpers
export const storage = {
  setUser(user: User) {
    localStorage.setItem("auth_user", JSON.stringify(user));
  },

  getUser(): User | null {
    const userStr = localStorage.getItem("auth_user");
    return userStr ? JSON.parse(userStr) : null;
  },

  removeUser() {
    localStorage.removeItem("auth_user");
  }
};

// Default admin credentials for quick testing
export const ADMIN_CREDENTIALS = {
  email: "admin@school.edu",
  password: "admin123456"
};