import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Shield, User } from 'lucide-react-native';

const Colors = {
  primary: '#1e40af',
  secondary: '#64748b',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  error: '#dc2626',
  success: '#16a34a',
  warning: '#f59e0b',
};

interface UserData {
  id: string;
  username: string;
  password: string;
  role: 'master' | 'user';
}

export default function ConfiguracoesUsuarioScreen() {
  const { users, createUser, updateUser, deleteUser, login } = useAuth();
  const [masterUsername, setMasterUsername] = useState<string>('Supervisor');
  const [masterPassword, setMasterPassword] = useState<string>('');
  const [showMasterPassword, setShowMasterPassword] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editUsername, setEditUsername] = useState<string>('');
  const [editPassword, setEditPassword] = useState<string>('');
  const [showEditPassword, setShowEditPassword] = useState<boolean>(false);

  const handleMasterLogin = async () => {
    if (!masterPassword.trim()) {
      Alert.alert('Erro', 'Digite a senha do supervisor.');
      return;
    }

    const success = await login(masterUsername, masterPassword);
    if (success) {
      setIsAuthenticated(true);
      setMasterPassword('');
    } else {
      Alert.alert('Erro', 'Credenciais do supervisor incorretas.');
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    const success = await createUser(newUsername.trim(), newPassword, 'user');
    if (success) {
      Alert.alert('Sucesso', 'Usuário criado com sucesso!');
      setNewUsername('');
      setNewPassword('');
    } else {
      Alert.alert('Erro', 'Usuário já existe ou erro ao criar.');
    }
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditPassword(user.password);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editUsername.trim() || !editPassword.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    const success = await updateUser(editingUser.id, editUsername.trim(), editPassword);
    if (success) {
      Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
      setEditingUser(null);
      setEditUsername('');
      setEditPassword('');
    } else {
      Alert.alert('Erro', 'Nome de usuário já existe ou erro ao atualizar.');
    }
  };

  const handleDeleteUser = (user: UserData) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o usuário "${user.username}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteUser(user.id);
            if (success) {
              Alert.alert('Sucesso', 'Usuário excluído com sucesso!');
            } else {
              Alert.alert('Erro', 'Erro ao excluir usuário.');
            }
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }: { item: UserData }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          {item.role === 'master' ? (
            <Shield size={20} color={Colors.warning} />
          ) : (
            <User size={20} color={Colors.primary} />
          )}
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.userRole}>
            {item.role === 'master' ? 'Supervisor' : 'Usuário'}
          </Text>
        </View>
      </View>
      
      {item.role !== 'master' && (
        <View style={styles.userActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditUser(item)}
            testID={`edit-user-${item.id}`}
          >
            <Edit size={16} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteUser(item)}
            testID={`delete-user-${item.id}`}
          >
            <Trash2 size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (!isAuthenticated) {
    return (
      <>
        <Stack.Screen options={{ title: 'Configurações de Usuário' }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.authContainer}>
            <View style={styles.authCard}>
              <Shield size={48} color={Colors.warning} style={styles.authIcon} />
              <Text style={styles.authTitle}>Acesso Restrito</Text>
              <Text style={styles.authSubtitle}>
                Digite as credenciais do supervisor para continuar
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Usuário</Text>
                <TextInput
                  style={styles.input}
                  value={masterUsername}
                  onChangeText={setMasterUsername}
                  placeholder="Supervisor"
                  placeholderTextColor={Colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="master-username-input"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Senha</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={masterPassword}
                    onChangeText={setMasterPassword}
                    placeholder="Digite a senha do supervisor"
                    placeholderTextColor={Colors.textSecondary}
                    secureTextEntry={!showMasterPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="master-password-input"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowMasterPassword(!showMasterPassword)}
                    testID="toggle-master-password"
                  >
                    {showMasterPassword ? (
                      <EyeOff size={20} color={Colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={Colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.authButton}
                onPress={handleMasterLogin}
                testID="master-login-button"
              >
                <Text style={styles.authButtonText}>Acessar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                testID="back-button"
              >
                <ArrowLeft size={20} color={Colors.primary} />
                <Text style={styles.backButtonText}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Gerenciar Usuários' }} />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Criar Novo Usuário</Text>
            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nome do Usuário</Text>
                <TextInput
                  style={styles.input}
                  value={newUsername}
                  onChangeText={setNewUsername}
                  placeholder="Digite o nome do usuário"
                  placeholderTextColor={Colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="new-username-input"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Senha</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Digite a senha"
                    placeholderTextColor={Colors.textSecondary}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="new-password-input"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    testID="toggle-new-password"
                  >
                    {showNewPassword ? (
                      <EyeOff size={20} color={Colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={Colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateUser}
                testID="create-user-button"
              >
                <Plus size={20} color={Colors.surface} />
                <Text style={styles.createButtonText}>Criar Usuário</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usuários Cadastrados</Text>
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={renderUserItem}
              scrollEnabled={false}
              testID="users-list"
            />
          </View>

          {editingUser && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Editar Usuário</Text>
              <View style={styles.card}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Nome do Usuário</Text>
                  <TextInput
                    style={styles.input}
                    value={editUsername}
                    onChangeText={setEditUsername}
                    placeholder="Digite o nome do usuário"
                    placeholderTextColor={Colors.textSecondary}
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="edit-username-input"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Senha</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={editPassword}
                      onChangeText={setEditPassword}
                      placeholder="Digite a senha"
                      placeholderTextColor={Colors.textSecondary}
                      secureTextEntry={!showEditPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      testID="edit-password-input"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowEditPassword(!showEditPassword)}
                      testID="toggle-edit-password"
                    >
                      {showEditPassword ? (
                        <EyeOff size={20} color={Colors.textSecondary} />
                      ) : (
                        <Eye size={20} color={Colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setEditingUser(null);
                      setEditUsername('');
                      setEditPassword('');
                    }}
                    testID="cancel-edit-button"
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdateUser}
                    testID="update-user-button"
                  >
                    <Text style={styles.updateButtonText}>Atualizar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  authCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  authIcon: {
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  authButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  authButtonText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  inputContainer: {
    marginBottom: 16,
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
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.surface,
    minHeight: 48,
    width: '100%',
    minWidth: 320,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: Colors.surface,
    minHeight: 48,
    width: '100%',
    minWidth: 320,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 48,
    minWidth: 240,
  },
  eyeButton: {
    padding: 16,
    minHeight: 48,
    justifyContent: 'center',
  },
  createButton: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  userItem: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  userRole: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: Colors.background,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  updateButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});