import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVendas } from '@/contexts/VendasContext';
import { Download, Upload, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';

const Colors = {
  primary: '#1e40af',
  secondary: '#64748b',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  border: '#e2e8f0',
};

export default function SincronizarScreen() {
  const { sincronizacoes, isSyncing, iniciarSincronizacao, loadData } = useVendas();
  const [refreshing, setRefreshing] = useState(false);

  const handleSync = async (tipo: string) => {
    Alert.alert(
      'Confirmar Sincronização',
      `Deseja iniciar a sincronização de ${tipo}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const sucesso = await iniciarSincronizacao(tipo);
            if (sucesso) {
              Alert.alert('Sucesso', 'Sincronização concluída com sucesso!');
            } else {
              Alert.alert('Erro', 'Falha na sincronização. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluída':
        return <CheckCircle size={20} color={Colors.success} />;
      case 'Em andamento':
        return <Clock size={20} color={Colors.warning} />;
      case 'Erro':
        return <XCircle size={20} color={Colors.error} />;
      default:
        return <AlertCircle size={20} color={Colors.secondary} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Seção de Ações de Sincronização */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações de Sincronização</Text>
          
          <TouchableOpacity
            style={[styles.syncButton, styles.importButton]}
            onPress={() => handleSync('Importação')}
            disabled={isSyncing}
          >
            <Download size={24} color={Colors.surface} />
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Importar Dados</Text>
              <Text style={styles.buttonSubtitle}>Clientes, Produtos, Formas de Pagamento</Text>
            </View>
            {isSyncing && <ActivityIndicator size="small" color={Colors.surface} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.syncButton, styles.exportButton]}
            onPress={() => handleSync('Exportação')}
            disabled={isSyncing}
          >
            <Upload size={24} color={Colors.surface} />
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Exportar Pedidos</Text>
              <Text style={styles.buttonSubtitle}>Enviar pedidos pendentes para o ERP</Text>
            </View>
            {isSyncing && <ActivityIndicator size="small" color={Colors.surface} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.syncButton, styles.fullSyncButton]}
            onPress={() => handleSync('Sincronização Completa')}
            disabled={isSyncing}
          >
            <RefreshCw size={24} color={Colors.surface} />
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Sincronização Completa</Text>
              <Text style={styles.buttonSubtitle}>Importar e exportar todos os dados</Text>
            </View>
            {isSyncing && <ActivityIndicator size="small" color={Colors.surface} />}
          </TouchableOpacity>
        </View>

        {/* Histórico de Sincronizações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de Sincronizações</Text>
          
          {sincronizacoes.length === 0 ? (
            <View style={styles.emptyState}>
              <RefreshCw size={48} color={Colors.secondary} />
              <Text style={styles.emptyText}>Nenhuma sincronização realizada</Text>
              <Text style={styles.emptySubtext}>Execute uma sincronização para ver o histórico</Text>
            </View>
          ) : (
            sincronizacoes.map((sync) => (
              <View key={sync.id_sync} style={styles.syncItem}>
                <View style={styles.syncHeader}>
                  <View style={styles.syncInfo}>
                    {getStatusIcon(sync.status)}
                    <View style={styles.syncDetails}>
                      <Text style={styles.syncType}>{sync.tipo}</Text>
                      <Text style={styles.syncDate}>{formatDate(sync.inicio)}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(sync.status) }]}>
                    <Text style={styles.statusText}>{sync.status}</Text>
                  </View>
                </View>
                
                {sync.mensagem && (
                  <Text style={styles.syncMessage}>{sync.mensagem}</Text>
                )}
                
                {sync.fim && (
                  <Text style={styles.syncDuration}>
                    Concluída em: {formatDate(sync.fim)}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Concluída':
      return Colors.success;
    case 'Em andamento':
      return Colors.warning;
    case 'Erro':
      return Colors.error;
    default:
      return Colors.secondary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  importButton: {
    backgroundColor: Colors.success,
  },
  exportButton: {
    backgroundColor: Colors.warning,
  },
  fullSyncButton: {
    backgroundColor: Colors.primary,
  },
  buttonContent: {
    flex: 1,
    marginLeft: 12,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.surface,
    marginBottom: 2,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: Colors.surface,
    opacity: 0.9,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  syncItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 16,
    marginBottom: 16,
  },
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  syncDetails: {
    marginLeft: 12,
    flex: 1,
  },
  syncType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  syncDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.surface,
  },
  syncMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  syncDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});