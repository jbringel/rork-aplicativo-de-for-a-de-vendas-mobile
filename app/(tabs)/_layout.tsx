import { Tabs } from "expo-router";
import { BarChart3, Users, Package, ShoppingCart, RefreshCw, LogOut } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, Alert } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

const Colors = {
  primary: "#1e40af",
  secondary: "#64748b",
  background: "#f8fafc",
  surface: "#ffffff",
  text: "#1e293b",
  textSecondary: "#64748b",
};

export default function TabLayout() {
  const { logout, currentUser } = useAuth();

  const handleLogout = React.useCallback(() => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair do aplicativo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  }, [logout]);

  const HeaderRight = React.useMemo(() => {
    return () => (
      <TouchableOpacity
        onPress={handleLogout}
        style={{ marginRight: 16, padding: 4 }}
        testID="logout-button"
      >
        <LogOut size={20} color={Colors.surface} />
      </TouchableOpacity>
    );
  }, [handleLogout]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.secondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: "#e2e8f0",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.surface,
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerRight: HeaderRight,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="clientes"
        options={{
          title: "Clientes",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="produtos"
        options={{
          title: "Produtos",
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{
          title: "Pedidos",
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="sincronizar"
        options={{
          title: "Sincronizar",
          tabBarIcon: ({ color, size }) => <RefreshCw color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}