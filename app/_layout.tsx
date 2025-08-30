import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, Component, ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Text, StyleSheet } from "react-native";
import { VendasContext } from "@/contexts/VendasContext";
import { AuthContext } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { trpc, trpcClient } from "@/lib/trpc";

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Algo deu errado</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Erro desconhecido'}
          </Text>
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
  },
  errorMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
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
    console.log('RootLayout iniciando...');
    SplashScreen.hideAsync();
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