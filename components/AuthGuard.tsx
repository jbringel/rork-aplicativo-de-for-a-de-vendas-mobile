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
    if (isLoading || navigationRef.current) return;

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
        
        // No iOS, usar um delay maior para garantir que a navegação funcione
        const delay = Platform.OS === 'ios' ? 200 : 100;
        
        setTimeout(() => {
          router.replace('/login');
          setTimeout(() => { navigationRef.current = false; }, delay);
        }, 50);
      }
    } else {
      if (inLoginScreen || isRootPath) {
        console.log('Redirecting to tabs');
        navigationRef.current = true;
        
        const delay = Platform.OS === 'ios' ? 200 : 100;
        
        setTimeout(() => {
          router.replace('/(tabs)');
          setTimeout(() => { navigationRef.current = false; }, delay);
        }, 50);
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
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