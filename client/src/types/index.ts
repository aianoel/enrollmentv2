export * from '@shared/schema';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface AuthState {
  user: FirebaseUser | null;
  userProfile: any | null;
  loading: boolean;
  error: string | null;
}

export interface ChatState {
  messages: any[];
  onlineUsers: any[];
  currentRoom: string | null;
  isOpen: boolean;
}

export interface EnrollmentStep {
  step: number;
  title: string;
  completed: boolean;
}

export interface NavigationItem {
  label: string;
  icon: string;
  path: string;
  roles: string[];
}
