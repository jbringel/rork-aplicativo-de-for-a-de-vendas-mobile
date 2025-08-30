import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { router, useSegments } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';

const Colors = {
  background: '#f8fafc',
  text: '#1e293b',
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const navigationRef = useRef<boolean>(false);

  useEffect(() => {
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

    console.log('AuthGuard - isAuthenticated:', isAuthenticated);
    console.log('AuthGuard - currentPath:', currentPath);
    console.log('AuthGuard - inAuthGroup:', inAuthGroup);
    console.log('AuthGuard - Platform:', Platform.OS);

    if (!isAuthenticated) {
      if (!inLoginScreen && !inConfigScreen) {
        console.log('Redirecting to login');
        navigationRef.current = true;
        
        const performNavigation = () => {
          try {
            router.replace('/login');
            console.log('Navigation to login successful');
          } catch (error) {
            console.error('Error navigating to login:', error);
          } finally {
            setTimeout(() => { 
              navigationRef.current = false; 
              console.log('Navigation lock released');
            }, 500);
          }
        };
        
        // Aguardar um pouco antes de navegar
        setTimeout(performNavigation, 100);
      }
    } else {
      if (inLoginScreen || isRootPath) {
        console.log('Redirecting to tabs');
        navigationRef.current = true;
        
        const performNavigation = () => {
          try {
            router.replace('/(tabs)');
            console.log('Navigation to tabs successful');
          } catch (error) {
            console.error('Error navigating to tabs:', error);
          } finally {
            setTimeout(() => { 
              navigationRef.current = false; 
              console.log('Navigation lock released');
            }, 500);
          }
        };
        
        // Aguardar um pouco antes de navegar
        setTimeout(performNavigation, 100);
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
        <Text style={[styles.loadingText, { fontSize: 14, marginTop: 8, opacity: 0.7 }]}>Inicializando aplicativo...</Text>
      </View>
    );
  }

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