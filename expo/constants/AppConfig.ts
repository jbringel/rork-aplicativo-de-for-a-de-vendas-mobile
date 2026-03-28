import { Platform } from 'react-native';

export const AppConfig = {
  // Configurações de inicialização
  SPLASH_SCREEN_DELAY: Platform.OS === 'web' ? 100 : 200,
  DATABASE_INIT_DELAY: Platform.OS === 'web' ? 0 : 100,
  CONTEXT_INIT_DELAY: Platform.OS === 'web' ? 100 : 300,
  
  // Configurações de navegação
  NAVIGATION_DELAY: Platform.OS === 'ios' ? 100 : Platform.OS === 'web' ? 50 : 75,
  NAVIGATION_LOCK_TIMEOUT: 500,
  
  // Configurações de timeout
  DATABASE_TIMEOUT: 10000,
  LOADING_TIMEOUT: 15000,
  
  // Configurações de retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Configurações de debug
  DEBUG_MODE: __DEV__,
  VERBOSE_LOGGING: __DEV__ && Platform.OS !== 'web',
  
  // Informações do app
  APP_NAME: 'Infosystem - Força de Vendas',
  APP_VERSION: '1.0.0',
  
  // Configurações de plataforma
  IS_WEB: Platform.OS === 'web',
  IS_IOS: Platform.OS === 'ios',
  IS_ANDROID: Platform.OS === 'android',
  
  // Configurações de API
  API_BASE_URL: process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'http://localhost:3000',
  
  // Configurações de banco de dados
  USE_SQLITE: Platform.OS !== 'web',
  USE_MOCK_DATA: Platform.OS === 'web',
  
  // Configurações de autenticação
  AUTH_STORAGE_KEY: '@force_vendas_current_user',
  USERS_STORAGE_KEY: '@force_vendas_users',
  
  // Configurações de cores
  COLORS: {
    primary: '#1e40af',
    secondary: '#64748b',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#dc2626',
  }
};

export const log = (message: string, ...args: any[]) => {
  if (AppConfig.DEBUG_MODE) {
    console.log(`[${AppConfig.APP_NAME}] ${message}`, ...args);
  }
};

export const logError = (message: string, error?: any) => {
  console.error(`[${AppConfig.APP_NAME}] ERROR: ${message}`, error);
};

export const logVerbose = (message: string, ...args: any[]) => {
  if (AppConfig.VERBOSE_LOGGING) {
    console.log(`[${AppConfig.APP_NAME}] VERBOSE: ${message}`, ...args);
  }
};

// Função para verificar se o app está funcionando corretamente
export const healthCheck = () => {
  log('App Health Check', {
    platform: Platform.OS,
    debug: AppConfig.DEBUG_MODE,
    apiUrl: AppConfig.API_BASE_URL,
    useSqlite: AppConfig.USE_SQLITE,
    useMockData: AppConfig.USE_MOCK_DATA,
  });
};

// Função para capturar erros não tratados
export const setupErrorHandling = () => {
  if (AppConfig.DEBUG_MODE) {
    // Capturar erros não tratados
    const originalConsoleError = console.error;
    console.error = (...args) => {
      logError('Unhandled Error', args);
      originalConsoleError.apply(console, args);
    };
  }
};

export default AppConfig;