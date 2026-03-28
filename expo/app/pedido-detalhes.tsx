import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, User, Calendar, Package, CreditCard } from 'lucide-react-native';
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

export default function PedidoDetalhesScreen() {
  const { pedidoId } = useLocalSearchParams();
  const { pedidos, getPedidoDetalhes } = useVendas();
  
  const [pedido, setPedido] = useState<any>(null);
  const [detalhes, setDetalhes] = useState<{ itens: any[], pagamentos: any[] }>({ itens: [], pagamentos: [] });

  useEffect(() => {
    const loadPedidoDetalhes = async () => {
      if (pedidoId) {
        const pedidoEncontrado = pedidos.find(p => p.id_pedido === Number(pedidoId));
        if (pedidoEncontrado) {
          setPedido(pedidoEncontrado);
          const pedidoDetalhes = await getPedidoDetalhes(Number(pedidoId));
          setDetalhes(pedidoDetalhes);
        }
      }
    };
    loadPedidoDetalhes();
  }, [pedidoId, pedidos, getPedidoDetalhes]);

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

  if (!pedido) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color={Colors.surface} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pedido #{pedido.id_pedido}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pedido.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(pedido.status) }]}>
            {pedido.status || 'Pendente'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Informações do Cliente */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User color={Colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Cliente</Text>
          </View>
          <Text style={styles.clienteNome}>{pedido.cliente_nome}</Text>
        </View>

        {/* Informações do Pedido */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar color={Colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Informações do Pedido</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data:</Text>
            <Text style={styles.infoValue}>{formatDate(pedido.data_pedido)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total:</Text>
            <Text style={[styles.infoValue, styles.totalValue]}>
              {formatCurrency(pedido.valor_total || 0)}
            </Text>
          </View>
          {pedido.observacoes && (
            <View style={styles.observacoesContainer}>
              <Text style={styles.infoLabel}>Observações:</Text>
              <Text style={styles.observacoesText}>{pedido.observacoes}</Text>
            </View>
          )}
        </View>

        {/* Itens do Pedido */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package color={Colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Itens</Text>
          </View>
          {detalhes.itens.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemNome}>{item.produto_nome}</Text>
                <Text style={styles.itemCodigo}>#{item.produto_codigo}</Text>
              </View>
              <View style={styles.itemDetails}>
                <View style={styles.itemDetailRow}>
                  <Text style={styles.itemDetailLabel}>Quantidade:</Text>
                  <Text style={styles.itemDetailValue}>{item.quantidade}</Text>
                </View>
                <View style={styles.itemDetailRow}>
                  <Text style={styles.itemDetailLabel}>Valor Unitário:</Text>
                  <Text style={styles.itemDetailValue}>
                    {formatCurrency(item.valor_unitario)}
                  </Text>
                </View>
                {item.desconto_item > 0 && (
                  <View style={styles.itemDetailRow}>
                    <Text style={styles.itemDetailLabel}>Desconto:</Text>
                    <Text style={[styles.itemDetailValue, { color: Colors.warning }]}>
                      -{formatCurrency(item.desconto_item)}
                    </Text>
                  </View>
                )}
                <View style={[styles.itemDetailRow, styles.subtotalRow]}>
                  <Text style={styles.subtotalLabel}>Subtotal:</Text>
                  <Text style={styles.subtotalValue}>
                    {formatCurrency(item.subtotal)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Pagamentos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard color={Colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Pagamentos</Text>
          </View>
          {detalhes.pagamentos.map((pagamento, index) => (
            <View key={index} style={styles.pagamentoCard}>
              <View style={styles.pagamentoHeader}>
                <Text style={styles.pagamentoForma}>{pagamento.forma_descricao}</Text>
                <Text style={styles.pagamentoParcela}>
                  Parcela {pagamento.numero_parcela}
                </Text>
              </View>
              <View style={styles.pagamentoDetails}>
                <View style={styles.pagamentoDetailRow}>
                  <Text style={styles.pagamentoDetailLabel}>Valor:</Text>
                  <Text style={styles.pagamentoDetailValue}>
                    {formatCurrency(pagamento.valor_parcela)}
                  </Text>
                </View>
                <View style={styles.pagamentoDetailRow}>
                  <Text style={styles.pagamentoDetailLabel}>Vencimento:</Text>
                  <Text style={styles.pagamentoDetailValue}>
                    {formatDate(pagamento.data_vencimento)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.surface,
    flex: 1,
    marginLeft: 16,
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.surface,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  clienteNome: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 18,
    color: Colors.success,
    fontWeight: '700',
  },
  observacoesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  observacoesText: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 4,
    lineHeight: 20,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  itemCodigo: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  itemDetails: {
    gap: 6,
  },
  itemDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDetailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  itemDetailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  subtotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  subtotalLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  subtotalValue: {
    fontSize: 16,
    color: Colors.success,
    fontWeight: '700',
  },
  pagamentoCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  pagamentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pagamentoForma: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  pagamentoParcela: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pagamentoDetails: {
    gap: 4,
  },
  pagamentoDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pagamentoDetailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pagamentoDetailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 20,
  },
});