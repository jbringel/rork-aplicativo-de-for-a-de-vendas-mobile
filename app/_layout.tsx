import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, Component, ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Text, StyleSheet, Platform } from "react-native";
import { VendasContext } from "@/contexts/VendasContext";
import { AuthContext } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { trpc, trpcClient } from "@/lib/trpc";
import { AppConfig, log, logError, healthCheck, setupErrorHandling } from "@/constants/AppConfig";

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error?: Error, errorInfo?: string}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('ErrorBoundary - Error caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary - Full error details:', {
      error: error.message,
      stack: error.stack,
      errorInfo: errorInfo.componentStack
    });
    
    this.setState({
      errorInfo: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>App Parou de Funcionar</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Erro desconhecido'}
          </Text>
          <Text style={styles.errorDetails}>
            Reinicie o aplicativo para continuar.
          </Text>
          {__DEV__ && this.state.errorInfo && (
            <Text style={styles.errorStack}>
              {this.state.errorInfo}
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorDetails: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorStack: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'left',
    marginTop: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Voltar" }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="configuracoes-usuario" options={{ title: "Configurações", presentation: "modal" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="cliente-form" options={{ title: "Cliente", presentation: "modal" }} />
      <Stack.Screen name="pedido-form" options={{ title: "Novo Pedido", presentation: "modal" }} />
      <Stack.Screen name="pedido-detalhes" options={{ title: "Detalhes do Pedido" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    log('RootLayout iniciando...', { platform: Platform.OS });
    
    // Configurar tratamento de erros
    setupErrorHandling();
    
    // Fazer health check
    healthCheck();
    
    // Aguardar um pouco antes de esconder o splash screen
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(error => {
        logError('Erro ao esconder splash screen', error);
      });
    }, AppConfig.SPLASH_SCREEN_DELAY);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AuthContext>
            <AuthGuard>
              <VendasContext>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </VendasContext>
            </AuthGuard>
          </AuthContext>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}