/**
 * Student Expense Manager - Core TypeScript Definitions
 */

// ==========================================
// Authentication Types
// ==========================================

export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface LoginCredentials {
  /** OAuth2 expects 'username' (which contains the user's email) */
  username: string;
  password: string;
}

export interface RegisterCredentials {
  full_name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ApiErrorResponse {
  success?: boolean;
  error_code?: string;
  message?: string;
  detail?: string | Array<{ loc: (string | number)[]; msg: string; type: string }>;
}

// ==========================================
// Context & State Types
// ==========================================

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginAsDemo: () => void;
  register: (data: RegisterCredentials) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// ==========================================
// Domain Model Types (Expense Manager)
// ==========================================

export type TransactionType = 'INCOME' | 'EXPENSE';

export type WalletType = 'CASH' | 'BANK' | 'E_WALLET';

export interface Wallet {
  id: number;
  name: string;
  type: WalletType;
  balance: number;
  icon?: string;
  user_id: number;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  user_id?: number;
}

export interface Transaction {
  id: number;
  wallet_id: number;
  category_id: number;
  amount: number;
  type: TransactionType;
  description?: string;
  date: string;
  wallet?: Wallet;
  category?: Category;
  created_at: string;
}

export interface Budget {
  id: number;
  category_id: number;
  amount: number;
  spent: number;
  month: number;
  year: number;
  category?: Category;
}

