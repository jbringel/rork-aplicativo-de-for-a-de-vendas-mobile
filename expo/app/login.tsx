import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Eye, EyeOff, Settings } from 'lucide-react-native';

const Colors = {
  primary: '#4A9FD9',
  secondary: '#64748b',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  error: '#dc2626',
  success: '#16a34a',
};

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const success = await login(username.trim(), password);
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Erro', 'Usuário ou senha incorretos.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSettings = () => {
    router.push('/configuracoes-usuario' as any);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ltbirc2osmxqp52rwyhp1' }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.companyTagline}>Tecnologia em Sistemas Comerciais</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Bem-vindo</Text>
            <Text style={styles.subtitle}>Faça login para continuar</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Usuário</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Digite seu usuário"
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                testID="username-input"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Digite sua senha"
                  placeholderTextColor={Colors.textSecondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="password-input"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  testID="toggle-password-visibility"
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoggingIn && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoggingIn}
              testID="login-button"
            >
              <Text style={styles.loginButtonText}>
                {isLoggingIn ? 'Entrando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleSettings}
              testID="settings-button"
            >
              <Settings size={20} color={Colors.primary} />
              <Text style={styles.settingsButtonText}>Configurações de Usuário</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '500',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 200,
    height: 120,
    marginBottom: 16,
  },
  companyTagline: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  eyeButton: {
    padding: 16,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  loginButtonText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: '600',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  settingsButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});