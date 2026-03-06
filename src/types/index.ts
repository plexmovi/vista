// Tipos para la aplicación StreamCheck Monitor

export interface Channel {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  status: 'online' | 'offline' | 'checking' | 'unknown';
  lastChecked?: Date;
  createdAt: Date;
}

export interface ChannelCreate {
  name: string;
  url: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  pin: string | null;
}

export interface AppSettings {
  checkInterval: number; // en milisegundos
  adminPin: string;
}

export interface VerificationResult {
  url: string;
  status: 'online' | 'offline';
  responseTime?: number;
  error?: string;
}

// Constantes de la aplicación
export const APP_CONFIG = {
  CHECK_INTERVAL: 30000, // 30 segundos
  DEFAULT_PIN: '198833',
  STORAGE_KEYS: {
    CHANNELS: 'streamcheck_channels',
    AUTH: 'streamcheck_auth'
  }
};
