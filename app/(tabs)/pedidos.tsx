import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Plus, Calendar, User, DollarSign } from 'lucide-react-native';
import { router } from 'expo-router';
import { useVendas } from '@/contexts/VendasContext';

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

export default function PedidosScreen() {
  const { pedidos } = useVendas();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendente': return Colors.warning;
      case 'aprovado': return Colors.success;
      case 'cancelado': return '#ef4444';
      default: return Colors.textSecondary;
    }
  };

  const renderPedido = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.pedidoCard}
      onPress={() => router.push({
        pathname: '/pedido-detalhes',
        params: { pedidoId: item.id_pedido }
      })}
    >
      <View style={styles.pedidoHeader}>
        <View style={styles.pedidoInfo}>
          <Text style={styles.pedidoId}>Pedido #{item.id_pedido}</Text>
          <View style={styles.clienteRow}>
            <User color={Colors.textSecondary} size={16} />
            <Text style={styles.clienteNome}>{item.cliente_nome}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status || 'Pendente'}
          </Text>
        </View>
      </View>

      <View style={styles.pedidoDetails}>
        <View style={styles.detailRow}>
          <Calendar color={Colors.textSecondary} size={16} />
          <Text style={styles.detailText}>{formatDate(item.data_pedido)}</Text>
        </View>
        <View style={styles.detailRow}>
          <DollarSign color={Colors.textSecondary} size={16} />
          <Text style={styles.valorText}>{formatCurrency(item.valor_total || 0)}</Text>
        </View>
      </View>

      {item.observacoes && (
        <Text style={styles.observacoes} numberOfLines={2}>
          {item.observacoes}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pedidos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/pedido-form')}
        >
          <Plus color={Colors.surface} size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={pedidos}
        renderItem={renderPedido}
        keyExtractor={(item) => item.id_pedido.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/pedido-form')}
            >
              <Text style={styles.emptyButtonText}>Criar primeiro pedido</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
  },
  listContainer: {
    padding: 16,
  },
  pedidoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pedidoInfo: {
    flex: 1,
  },
  pedidoId: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  clienteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clienteNome: {
    marginLeft: 6,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pedidoDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  valorText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
  },
  observacoes: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});