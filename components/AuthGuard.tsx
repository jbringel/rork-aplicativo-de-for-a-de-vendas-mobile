import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { router, useSegments } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';

const Colors = {
  background: '#f8fafc',
  text: '#1e293b',
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const authContext = useAuth();
  const segments = useSegments();
  const navigationRef = useRef<boolean>(false);

  const { isAuthenticated, isLoading } = authContext || { isAuthenticated: false, isLoading: true };

  useEffect(() => {
    // Verificar se o contexto foi carregado corretamente
    if (!authContext) {
      console.error('AuthGuard - AuthContext não foi carregado!');
      return;
    }
    console.log('AuthGuard - useEffect triggered');
    console.log('AuthGuard - isLoading:', isLoading);
    console.log('AuthGuard - isAuthenticated:', isAuthenticated);
    console.log('AuthGuard - segments:', segments);
    
    if (isLoading) {
      console.log('AuthGuard - Still loading, skipping navigation');
      return;
    }
    
    if (navigationRef.current) {
      console.log('AuthGuard - Navigation in progress, skipping');
      return;
    }

    const currentPath = segments.join('/');
    const inLoginScreen = segments[0] === 'login';
    const inConfigScreen = segments[0] === 'configuracoes-usuario';
    const inAuthGroup = segments[0] === '(tabs)';
    const isRootPath = currentPath === '' || currentPath === '(tabs)';

    console.log('AuthGuard - currentPath:', currentPath);
    console.log('AuthGuard - inLoginScreen:', inLoginScreen);
    console.log('AuthGuard - inAuthGroup:', inAuthGroup);
    console.log('AuthGuard - isRootPath:', isRootPath);
    console.log('AuthGuard - Platform:', Platform.OS);

    if (!isAuthenticated) {
      if (!inLoginScreen && !inConfigScreen) {
        console.log('AuthGuard - Redirecting to login');
        navigationRef.current = true;
        
        const performNavigation = () => {
          try {
            router.replace('/login');
            console.log('AuthGuard - Navigation to login successful');
          } catch (error) {
            console.error('AuthGuard - Error navigating to login:', error);
          } finally {
            setTimeout(() => { 
              navigationRef.current = false; 
              console.log('AuthGuard - Navigation lock released');
            }, 500);
          }
        };
        
        setTimeout(performNavigation, 100);
      }
    } else {
      if (inLoginScreen || isRootPath) {
        console.log('AuthGuard - Redirecting to tabs');
        navigationRef.current = true;
        
        const performNavigation = () => {
          try {
            router.replace('/(tabs)');
            console.log('AuthGuard - Navigation to tabs successful');
          } catch (error) {
            console.error('AuthGuard - Error navigating to tabs:', error);
          } finally {
            setTimeout(() => { 
              navigationRef.current = false; 
              console.log('AuthGuard - Navigation lock released');
            }, 500);
          }
        };
        
        setTimeout(performNavigation, 100);
      }
    }
  }, [authContext, isAuthenticated, isLoading, segments]);

  if (isLoading) {
    console.log('AuthGuard - Rendering loading screen');
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
        <Text style={[styles.loadingText, { fontSize: 14, marginTop: 8, opacity: 0.7 }]}>Inicializando aplicativo...</Text>
      </View>
    );
  }

  console.log('AuthGuard - Rendering children');
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '500',
  },
});