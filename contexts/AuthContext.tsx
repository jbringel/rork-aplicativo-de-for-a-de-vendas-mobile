import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';

interface User {
  id: string;
  username: string;
  password: string;
  role: 'master' | 'user';
}



const STORAGE_KEYS = {
  USERS: '@force_vendas_users',
  CURRENT_USER: '@force_vendas_current_user',
};

const MASTER_USER: User = {
  id: 'master',
  username: 'Supervisor',
  password: 'infosystem@2025',
  role: 'master',
};

export const [AuthContext, useAuth] = createContextHook(() => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadStoredData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Carregar usuários
      const storedUsers = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      let usersList: User[] = [];
      
      if (storedUsers) {
        usersList = JSON.parse(storedUsers);
      }
      
      // Sempre garantir que o usuário master existe
      const masterExists = usersList.find(u => u.id === 'master');
      if (!masterExists) {
        usersList.unshift(MASTER_USER);
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersList));
      }
      
      setUsers(usersList);
      
      // Verificar se há usuário logado
      const storedCurrentUser = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (storedCurrentUser) {
        const user = JSON.parse(storedCurrentUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredData();
  }, [loadStoredData]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  }, [users]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setCurrentUser(null);
      setIsAuthenticated(false);
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }, []);

  const createUser = useCallback(async (username: string, password: string, role: 'master' | 'user'): Promise<boolean> => {
    try {
      // Verificar se usuário já existe
      const userExists = users.find(u => u.username === username);
      if (userExists) {
        return false;
      }
      
      const newUser: User = {
        id: Date.now().toString(),
        username,
        password,
        role,
      };
      
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      
      return true;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return false;
    }
  }, [users]);

  const updateUser = useCallback(async (id: string, username: string, password: string): Promise<boolean> => {
    try {
      // Não permitir alterar o usuário master
      if (id === 'master') {
        return false;
      }
      
      // Verificar se novo username já existe em outro usuário
      const userExists = users.find(u => u.username === username && u.id !== id);
      if (userExists) {
        return false;
      }
      
      const updatedUsers = users.map(u => 
        u.id === id ? { ...u, username, password } : u
      );
      
      setUsers(updatedUsers);
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      
      // Se o usuário atual foi alterado, atualizar também
      if (currentUser?.id === id) {
        const updatedCurrentUser = { ...currentUser, username, password };
        setCurrentUser(updatedCurrentUser);
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedCurrentUser));
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return false;
    }
  }, [users, currentUser]);

  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Não permitir deletar o usuário master
      if (id === 'master') {
        return false;
      }
      
      const updatedUsers = users.filter(u => u.id !== id);
      setUsers(updatedUsers);
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      
      // Se o usuário atual foi deletado, fazer logout
      if (currentUser?.id === id) {
        await logout();
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return false;
    }
  }, [users, currentUser, logout]);

  const contextValue = useMemo(() => ({
    isAuthenticated,
    currentUser,
    users,
    login,
    logout,
    createUser,
    updateUser,
    deleteUser,
    isLoading,
  }), [isAuthenticated, currentUser, users, login, logout, createUser, updateUser, deleteUser, isLoading]);

  return contextValue;
});