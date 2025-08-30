import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Plus, Search, Edit, Trash2, Phone, Mail } from 'lucide-react-native';
import { router } from 'expo-router';
import { useVendas } from '@/contexts/VendasContext';
import { Cliente } from '@/database/schema';

const Colors = {
  primary: "#1e40af",
  secondary: "#64748b",
  background: "#f8fafc",
  surface: "#ffffff",
  text: "#1e293b",
  textSecondary: "#64748b",
  danger: "#ef4444",
};

export default function ClientesScreen() {
  const { clientes, deleteCliente } = useVendas();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome_razao.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cliente.cpf_cnpj && cliente.cpf_cnpj.includes(searchQuery))
  );

  const handleDeleteCliente = (cliente: Cliente) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o cliente ${cliente.nome_razao}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteCliente(cliente.id_cliente!)
        }
      ]
    );
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderCliente = ({ item }: { item: Cliente }) => (
    <View style={styles.clienteCard}>
      <View style={styles.clienteHeader}>
        <View style={styles.clienteInfo}>
          <Text style={styles.clienteNome}>{item.nome_razao}</Text>
          {item.cpf_cnpj && (
            <Text style={styles.clienteDoc}>{item.cpf_cnpj}</Text>
          )}
        </View>
        <View style={styles.clienteActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push({
              pathname: '/cliente-form',
              params: { clienteId: item.id_cliente }
            })}
          >
            <Edit color={Colors.primary} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteCliente(item)}
          >
            <Trash2 color={Colors.danger} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.clienteDetails}>
        {item.telefone && (
          <View style={styles.detailRow}>
            <Phone color={Colors.textSecondary} size={16} />
            <Text style={styles.detailText}>{item.telefone}</Text>
          </View>
        )}
        {item.email && (
          <View style={styles.detailRow}>
            <Mail color={Colors.textSecondary} size={16} />
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
        )}
      </View>

      <View style={styles.clienteFooter}>
        <View style={styles.limitInfo}>
          <Text style={styles.limitLabel}>Limite:</Text>
          <Text style={styles.limitValue}>
            {formatCurrency(item.limite_credito)}
          </Text>
        </View>
        <View style={styles.saldoInfo}>
          <Text style={styles.saldoLabel}>Saldo Devedor:</Text>
          <Text style={[
            styles.saldoValue,
            { color: (item.saldo_devedor || 0) > 0 ? Colors.danger : Colors.textSecondary }
          ]}>
            {formatCurrency(item.saldo_devedor)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search color={Colors.textSecondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar clientes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/cliente-form')}
        >
          <Plus color={Colors.surface} size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredClientes}
        renderItem={renderCliente}
        keyExtractor={(item) => item.id_cliente!.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum cliente encontrado</Text>
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
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
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
  },
  listContainer: {
    padding: 16,
  },
  clienteCard: {
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
  clienteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNome: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  clienteDoc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  clienteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  clienteDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text,
  },
  clienteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  limitInfo: {
    flex: 1,
  },
  limitLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  limitValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  saldoInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  saldoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  saldoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});