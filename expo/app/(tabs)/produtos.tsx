import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Search, Package } from 'lucide-react-native';
import { useVendas } from '@/contexts/VendasContext';
import { Produto } from '@/database/schema';

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

export default function ProdutosScreen() {
  const { produtos } = useVendas();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    produto.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (produto.categoria && produto.categoria.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getEstoqueStatus = (estoque?: number) => {
    if (!estoque || estoque === 0) return { color: '#ef4444', text: 'Sem estoque' };
    if (estoque <= 10) return { color: Colors.warning, text: 'Estoque baixo' };
    return { color: Colors.success, text: 'Em estoque' };
  };

  const renderProduto = ({ item }: { item: Produto }) => {
    const estoqueStatus = getEstoqueStatus(item.estoque_atual);
    
    return (
      <View style={styles.produtoCard}>
        <View style={styles.produtoHeader}>
          <View style={styles.produtoIcon}>
            <Package color={Colors.primary} size={24} />
          </View>
          <View style={styles.produtoInfo}>
            <Text style={styles.produtoNome}>{item.nome}</Text>
            <Text style={styles.produtoCodigo}>Código: {item.codigo}</Text>
            {item.categoria && (
              <Text style={styles.produtoCategoria}>{item.categoria}</Text>
            )}
          </View>
        </View>

        {item.descricao && (
          <Text style={styles.produtoDescricao}>{item.descricao}</Text>
        )}

        <View style={styles.produtoFooter}>
          <View style={styles.precoContainer}>
            <Text style={styles.precoLabel}>Preço</Text>
            <Text style={styles.precoValue}>
              {formatCurrency(item.preco_venda)}
            </Text>
            {item.preco_promocional && item.preco_promocional < item.preco_venda && (
              <Text style={styles.precoPromocional}>
                Promoção: {formatCurrency(item.preco_promocional)}
              </Text>
            )}
          </View>

          <View style={styles.estoqueContainer}>
            <Text style={styles.estoqueLabel}>Estoque</Text>
            <Text style={styles.estoqueQuantidade}>
              {item.estoque_atual || 0} {item.unidade_medida || 'UN'}
            </Text>
            <Text style={[styles.estoqueStatus, { color: estoqueStatus.color }]}>
              {estoqueStatus.text}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search color={Colors.textSecondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredProdutos}
        renderItem={renderProduto}
        keyExtractor={(item) => item.id_produto!.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package color={Colors.textSecondary} size={48} />
            <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
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
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  },
  listContainer: {
    padding: 16,
  },
  produtoCard: {
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
  produtoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  produtoIcon: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  produtoInfo: {
    flex: 1,
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  produtoCodigo: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  produtoCategoria: {
    fontSize: 12,
    color: Colors.primary,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  produtoDescricao: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  produtoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  precoContainer: {
    flex: 1,
  },
  precoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  precoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  precoPromocional: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '600',
  },
  estoqueContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  estoqueLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  estoqueQuantidade: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  estoqueStatus: {
    fontSize: 12,
    fontWeight: '500',
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
    marginTop: 12,
  },
});