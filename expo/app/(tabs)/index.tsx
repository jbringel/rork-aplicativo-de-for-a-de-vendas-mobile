import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { TrendingUp, Users, Package, ShoppingCart, DollarSign } from 'lucide-react-native';
import { useVendas } from '@/contexts/VendasContext';
import { log, logError } from '@/constants/AppConfig';

const Colors = {
  primary: "#1e40af",
  secondary: "#64748b",
  background: "#f8fafc",
  surface: "#ffffff",
  text: "#1e293b",
  textSecondary: "#64748b",
  success: "#10b981",
  warning: "#f59e0b",
};

export default function DashboardScreen() {
  const vendasContext = useVendas();

  // Verificar se o contexto foi carregado
  if (!vendasContext) {
    logError('DashboardScreen - VendasContext não foi carregado!');
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Erro no contexto de vendas</Text>
      </View>
    );
  }

  const { dashboardData, isLoading, loadData, clientes, produtos, pedidos } = vendasContext;

  useEffect(() => {
    log('DashboardScreen montado');
    log('Dados carregados', {
      clientes: clientes?.length || 0,
      produtos: produtos?.length || 0,
      pedidos: pedidos?.length || 0,
      dashboardData: !!dashboardData
    });
  }, [clientes, produtos, pedidos, dashboardData]);

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value || 0);
    } catch (error) {
      logError('Erro ao formatar moeda', error);
      return `R$ ${(value || 0).toFixed(2)}`;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      logError('Erro ao formatar data', error);
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando dados...</Text>
        <Text style={styles.subtitle}>Inicializando banco de dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadData} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Infosystem - Força de Vendas</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Users color={Colors.primary} size={32} />
          <Text style={styles.statNumber}>{clientes?.length || 0}</Text>
          <Text style={styles.statLabel}>Clientes</Text>
        </View>
        
        <View style={styles.statCard}>
          <Package color={Colors.success} size={32} />
          <Text style={styles.statNumber}>{produtos?.length || 0}</Text>
          <Text style={styles.statLabel}>Produtos</Text>
        </View>
        
        <View style={styles.statCard}>
          <ShoppingCart color={Colors.warning} size={32} />
          <Text style={styles.statNumber}>{pedidos?.length || 0}</Text>
          <Text style={styles.statLabel}>Pedidos</Text>
        </View>
      </View>

      {dashboardData && (
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <DollarSign color={Colors.success} size={24} />
              <Text style={styles.metricTitle}>Vendas Hoje</Text>
            </View>
            <Text style={styles.metricValue}>
              {formatCurrency(dashboardData.vendasHoje?.valor || 0)}
            </Text>
            <Text style={styles.metricSubtitle}>
              {dashboardData.vendasHoje?.total || 0} pedidos
            </Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <TrendingUp color={Colors.primary} size={24} />
              <Text style={styles.metricTitle}>Vendas do Mês</Text>
            </View>
            <Text style={styles.metricValue}>
              {formatCurrency(dashboardData.vendasMes?.valor || 0)}
            </Text>
            <Text style={styles.metricSubtitle}>
              {dashboardData.vendasMes?.total || 0} pedidos
            </Text>
          </View>
        </View>
      )}

      {dashboardData?.pedidosRecentes?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pedidos Recentes</Text>
          <View style={styles.card}>
            {dashboardData.pedidosRecentes.slice(0, 5).map((pedido: any) => (
              <View key={pedido.id_pedido} style={styles.orderItem}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderClient}>{pedido.cliente_nome}</Text>
                  <Text style={styles.orderDate}>{formatDate(pedido.data_pedido)}</Text>
                </View>
                <Text style={styles.orderValue}>
                  {formatCurrency(pedido.valor_liquido)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadData}
        >
          <Text style={styles.refreshButtonText}>Atualizar Dados</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  metricsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  productQuantity: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  productRank: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rankNumber: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  orderInfo: {
    flex: 1,
  },
  orderClient: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  orderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
    paddingVertical: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});