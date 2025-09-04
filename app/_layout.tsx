import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, Component, ReactNode, useState, useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Text, StyleSheet, Platform, Image, Animated } from "react-native";
import { VendasContext } from "@/contexts/VendasContext";
import { AuthContext } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { trpc, trpcClient } from "@/lib/trpc";
import { log, logError, healthCheck, setupErrorHandling } from "@/constants/AppConfig";

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

function CustomSplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.8), []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={splashStyles.container}>
      <Animated.View 
        style={[
          splashStyles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Image 
          source={{ uri: 'https://r2-pub.rork.com/generated-images/9116a872-e0c4-42bb-9dd4-4077c1a1f212.png' }}
          style={splashStyles.logo}
          resizeMode="contain"
        />
        <Text style={splashStyles.title}>Força de Vendas</Text>
        <Text style={splashStyles.subtitle}>Mobile</Text>
      </Animated.View>
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
});

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    log('RootLayout iniciando...', { platform: Platform.OS });
    
    // Configurar tratamento de erros
    setupErrorHandling();
    
    // Fazer health check
    healthCheck();
    
    // Esconder o splash screen nativo imediatamente
    SplashScreen.hideAsync().catch(error => {
      logError('Erro ao esconder splash screen', error);
    });
  }, []);

  if (showSplash) {
    return <CustomSplashScreen onFinish={() => setShowSplash(false)} />;
  }

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