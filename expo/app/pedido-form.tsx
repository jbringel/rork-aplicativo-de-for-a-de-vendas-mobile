import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Save, X, Plus, Search, Trash2, User, CreditCard, Calendar, Minus } from 'lucide-react-native';
import { useVendas } from '@/contexts/VendasContext';
import { useAuth } from '@/contexts/AuthContext';
import { Cliente, Produto, FormaPagamento, Vendedor } from '@/database/schema';

const Colors = {
  primary: "#1e40af",
  secondary: "#64748b",
  background: "#f8fafc",
  surface: "#ffffff",
  text: "#1e293b",
  textSecondary: "#64748b",
  danger: "#ef4444",
  success: "#10b981",
};

interface ItemPedido {
  produto: Produto;
  quantidade: number;
  valor_unitario: number;
  desconto_item: number;
  desconto_tipo: 'valor' | 'percentual';
  subtotal: number;
}

interface PagamentoPedido {
  forma_pagamento: FormaPagamento;
  parcelas: {
    numero: number;
    valor: number;
    vencimento: string;
  }[];
}

export default function PedidoFormScreen() {
  const { clientes, produtos, formasPagamento, vendedores, searchProdutos, createPedido, calculateParcelas } = useVendas();
  const { currentUser } = useAuth();
  
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [vendedorSelecionado, setVendedorSelecionado] = useState<Vendedor | null>(null);
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [pagamentos, setPagamentos] = useState<PagamentoPedido[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [numeroParcelas, setNumeroParcelas] = useState(1);
  const [primeiraParcela, setPrimeiraParcela] = useState(new Date());
  
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showVendedorModal, setShowVendedorModal] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [formaPagamentoSelecionada, setFormaPagamentoSelecionada] = useState<FormaPagamento | null>(null);
  
  const [searchClienteQuery, setSearchClienteQuery] = useState('');
  const [searchProdutoQuery, setSearchProdutoQuery] = useState('');
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
  const [quantidadesProdutos, setQuantidadesProdutos] = useState<{[key: number]: number}>({});

  useEffect(() => {
    const loadProdutos = async () => {
      if (searchProdutoQuery.trim()) {
        const filtered = await searchProdutos(searchProdutoQuery);
        setProdutosFiltrados(filtered);
      } else {
        setProdutosFiltrados(produtos.slice(0, 20));
      }
    };
    loadProdutos();
  }, [searchProdutoQuery, produtos, searchProdutos]);

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome_razao.toLowerCase().includes(searchClienteQuery.toLowerCase())
  );

  const calcularValorBruto = () => {
    return itens.reduce((total, item) => total + (item.quantidade * item.valor_unitario), 0);
  };

  const calcularValorDesconto = () => {
    return itens.reduce((total, item) => {
      if (item.desconto_tipo === 'percentual') {
        return total + (item.quantidade * item.valor_unitario * (item.desconto_item / 100));
      }
      return total + item.desconto_item;
    }, 0);
  };

  const calcularValorLiquido = () => {
    return calcularValorBruto() - calcularValorDesconto();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calcularSubtotal = (item: ItemPedido) => {
    const valorBruto = item.quantidade * item.valor_unitario;
    if (item.desconto_tipo === 'percentual') {
      return valorBruto - (valorBruto * (item.desconto_item / 100));
    }
    return valorBruto - item.desconto_item;
  };

  const adicionarItem = (produto: Produto) => {
    const quantidade = quantidadesProdutos[produto.id_produto!] || 1;
    const novoItem: ItemPedido = {
      produto,
      quantidade,
      valor_unitario: produto.preco_promocional || produto.preco_venda,
      desconto_item: 0,
      desconto_tipo: 'valor',
      subtotal: (produto.preco_promocional || produto.preco_venda) * quantidade,
    };
    setItens(prev => [...prev, novoItem]);
    setQuantidadesProdutos(prev => ({ ...prev, [produto.id_produto!]: 1 }));
    setShowProdutoModal(false);
  };

  const alterarQuantidadeProduto = (produtoId: number, delta: number) => {
    setQuantidadesProdutos(prev => {
      const quantidadeAtual = prev[produtoId] || 1;
      const novaQuantidade = Math.max(1, quantidadeAtual + delta);
      return { ...prev, [produtoId]: novaQuantidade };
    });
  };

  const alterarQuantidadeItem = (index: number, delta: number) => {
    setItens(prev => prev.map((item, i) => {
      if (i === index) {
        const novaQuantidade = Math.max(1, item.quantidade + delta);
        const itemAtualizado = { ...item, quantidade: novaQuantidade };
        itemAtualizado.subtotal = calcularSubtotal(itemAtualizado);
        return itemAtualizado;
      }
      return item;
    }));
  };

  const atualizarItem = (index: number, campo: keyof ItemPedido, valor: any) => {
    setItens(prev => prev.map((item, i) => {
      if (i === index) {
        const itemAtualizado = { ...item, [campo]: valor };
        if (campo === 'quantidade' || campo === 'valor_unitario' || campo === 'desconto_item' || campo === 'desconto_tipo') {
          itemAtualizado.subtotal = calcularSubtotal(itemAtualizado);
        }
        return itemAtualizado;
      }
      return item;
    }));
  };

  const removerItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
  };

  const configurarPagamento = async () => {
    if (!formaPagamentoSelecionada) return;
    
    const valorLiquido = calcularValorLiquido();
    const parcelas = await calculateParcelas(valorLiquido, numeroParcelas, formaPagamentoSelecionada, primeiraParcela);
    
    const novoPagamento: PagamentoPedido = {
      forma_pagamento: formaPagamentoSelecionada,
      parcelas
    };
    
    setPagamentos([novoPagamento]);
    setShowPagamentoModal(false);
  };

  const selecionarFormaPagamento = (forma: FormaPagamento) => {
    setFormaPagamentoSelecionada(forma);
    setNumeroParcelas(1);
    setPrimeiraParcela(new Date());
  };

  const validarPedido = () => {
    if (!clienteSelecionado) {
      Alert.alert('Erro', 'Selecione um cliente');
      return false;
    }
    if (itens.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um item ao pedido');
      return false;
    }
    if (pagamentos.length === 0) {
      Alert.alert('Erro', 'Configure a forma de pagamento');
      return false;
    }
    return true;
  };

  const salvarPedido = async () => {
    if (!validarPedido()) return;

    try {
      let vendedorParaPedido = vendedorSelecionado;
      
      if (!vendedorParaPedido && currentUser?.codigo_vendedor) {
        vendedorParaPedido = {
          codigo_vendedor: currentUser.codigo_vendedor,
          nome: currentUser.username,
          ativo: 1
        };
      }

      await createPedido({
        cliente: clienteSelecionado!,
        vendedor: vendedorParaPedido || undefined,
        itens,
        pagamentos,
        observacoes,
      });
      
      Alert.alert('Sucesso', 'Pedido criado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch {
      Alert.alert('Erro', 'Erro ao criar pedido. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X color={Colors.surface} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Pedido</Text>
        <TouchableOpacity onPress={salvarPedido}>
          <Save color={Colors.surface} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowClienteModal(true)}
          >
            <User color={Colors.primary} size={20} />
            <Text style={styles.selectorText}>
              {clienteSelecionado ? clienteSelecionado.nome_razao : 'Selecionar cliente'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendedor</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowVendedorModal(true)}
          >
            <User color={Colors.secondary} size={20} />
            <Text style={styles.selectorText}>
              {vendedorSelecionado 
                ? `${vendedorSelecionado.nome}${vendedorSelecionado.codigo_vendedor ? ` (${vendedorSelecionado.codigo_vendedor})` : ''}` 
                : currentUser?.codigo_vendedor 
                  ? `${currentUser.username} (${currentUser.codigo_vendedor})` 
                  : 'Selecionar vendedor'
              }
            </Text>
          </TouchableOpacity>
          {currentUser?.codigo_vendedor && (
            <Text style={styles.vendedorInfo}>
              Vendedor padrão: {currentUser.username} - Código: {currentUser.codigo_vendedor}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Itens</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowProdutoModal(true)}
            >
              <Plus color={Colors.surface} size={20} />
            </TouchableOpacity>
          </View>

          {itens.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemNome}>{item.produto.nome}</Text>
                <TouchableOpacity onPress={() => removerItem(index)}>
                  <Trash2 color={Colors.danger} size={20} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.itemInputs}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Qtd</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => alterarQuantidadeItem(index, -1)}
                    >
                      <Minus color={Colors.primary} size={16} />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.quantityInput}
                      value={item.quantidade.toString()}
                      onChangeText={(text) => atualizarItem(index, 'quantidade', parseFloat(text) || 1)}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => alterarQuantidadeItem(index, 1)}
                    >
                      <Plus color={Colors.primary} size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Valor Unit.</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={item.valor_unitario.toString()}
                    onChangeText={(text) => atualizarItem(index, 'valor_unitario', parseFloat(text) || 0)}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Desconto</Text>
                  <View style={styles.descontoContainer}>
                    <TextInput
                      style={styles.descontoInput}
                      value={item.desconto_item.toString()}
                      onChangeText={(text) => {
                        const cleaned = text.replace(',', '.');
                        const parsed = parseFloat(cleaned) || 0;
                        const rounded = Math.round(parsed * 1000) / 1000;
                        atualizarItem(index, 'desconto_item', rounded);
                      }}
                      keyboardType="decimal-pad"
                      placeholder="0.000"
                    />
                    <TouchableOpacity
                      style={styles.descontoTipoButton}
                      onPress={() => atualizarItem(index, 'desconto_tipo', item.desconto_tipo === 'valor' ? 'percentual' : 'valor')}
                    >
                      <Text style={styles.descontoTipoText}>{item.desconto_tipo === 'valor' ? 'R$' : '%'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              <Text style={styles.itemSubtotal}>
                Subtotal: {formatCurrency(item.subtotal)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pagamento</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowPagamentoModal(true)}
            >
              <CreditCard color={Colors.surface} size={20} />
            </TouchableOpacity>
          </View>

          {pagamentos.map((pagamento, index) => (
            <View key={index} style={styles.pagamentoCard}>
              <Text style={styles.pagamentoForma}>
                {pagamento.forma_pagamento.descricao}
              </Text>
              <Text style={styles.pagamentoInfo}>
                {pagamento.parcelas.length} parcela{pagamento.parcelas.length > 1 ? 's' : ''}
              </Text>
              {pagamento.parcelas.map((parcela, parcelaIndex) => (
                <View key={parcelaIndex} style={styles.parcelaItem}>
                  <Text style={styles.pagamentoDetalhes}>
                    {pagamento.parcelas.length > 1 ? `${parcela.numero}/${pagamento.parcelas.length}: ` : ''}
                    {formatCurrency(parcela.valor)}
                  </Text>
                  <Text style={styles.pagamentoVencimento}>
                    {new Date(parcela.vencimento).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <TextInput
            style={styles.textArea}
            value={observacoes}
            onChangeText={setObservacoes}
            placeholder="Observações do pedido..."
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.totalSection}>
          <View style={styles.valorRow}>
            <Text style={styles.valorLabel}>Valor Bruto:</Text>
            <Text style={styles.valorValue}>{formatCurrency(calcularValorBruto())}</Text>
          </View>
          <View style={styles.valorRow}>
            <Text style={styles.valorLabel}>Desconto:</Text>
            <Text style={[styles.valorValue, { color: Colors.danger }]}>
              -{formatCurrency(calcularValorDesconto())}
            </Text>
          </View>
          <View style={styles.divisor} />
          <View style={styles.valorRow}>
            <Text style={styles.totalLabel}>Total Líquido:</Text>
            <Text style={styles.totalValue}>{formatCurrency(calcularValorLiquido())}</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showClienteModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Cliente</Text>
            <TouchableOpacity onPress={() => setShowClienteModal(false)}>
              <X color={Colors.text} size={24} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <Search color={Colors.textSecondary} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar cliente..."
              value={searchClienteQuery}
              onChangeText={setSearchClienteQuery}
            />
          </View>

          <FlatList
            data={clientesFiltrados}
            keyExtractor={(item) => item.id_cliente!.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.clienteItem}
                onPress={() => {
                  setClienteSelecionado(item);
                  setShowClienteModal(false);
                }}
              >
                <Text style={styles.clienteItemNome}>{item.nome_razao}</Text>
                {item.cpf_cnpj && (
                  <Text style={styles.clienteItemDoc}>{item.cpf_cnpj}</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      <Modal visible={showProdutoModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Produto</Text>
            <TouchableOpacity onPress={() => setShowProdutoModal(false)}>
              <X color={Colors.text} size={24} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <Search color={Colors.textSecondary} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar produto..."
              value={searchProdutoQuery}
              onChangeText={setSearchProdutoQuery}
            />
          </View>

          <FlatList
            data={produtosFiltrados}
            keyExtractor={(item) => item.id_produto!.toString()}
            renderItem={({ item }) => {
              const quantidade = quantidadesProdutos[item.id_produto!] || 1;
              return (
                <View style={styles.produtoItemContainer}>
                  <TouchableOpacity
                    style={styles.produtoItem}
                    onPress={() => adicionarItem(item)}
                  >
                    <View style={styles.produtoInfo}>
                      <Text style={styles.produtoNome}>{item.nome}</Text>
                      <Text style={styles.produtoCodigo}>Código: {item.codigo}</Text>
                      <Text style={styles.produtoPreco}>
                        {formatCurrency(item.preco_promocional || item.preco_venda)}
                      </Text>
                    </View>
                    <Text style={styles.produtoEstoque}>
                      Estoque: {item.estoque_atual || 0}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.produtoQuantityContainer}>
                    <TouchableOpacity 
                      style={styles.produtoQuantityButton}
                      onPress={() => alterarQuantidadeProduto(item.id_produto!, -1)}
                    >
                      <Minus color={Colors.surface} size={16} />
                    </TouchableOpacity>
                    <Text style={styles.produtoQuantityText}>{quantidade}</Text>
                    <TouchableOpacity 
                      style={styles.produtoQuantityButton}
                      onPress={() => alterarQuantidadeProduto(item.id_produto!, 1)}
                    >
                      <Plus color={Colors.surface} size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        </View>
      </Modal>

      <Modal visible={showVendedorModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Vendedor</Text>
            <TouchableOpacity onPress={() => setShowVendedorModal(false)}>
              <X color={Colors.text} size={24} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={vendedores}
            keyExtractor={(item) => item.id_vendedor!.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.vendedorItem}
                onPress={() => {
                  setVendedorSelecionado(item);
                  setShowVendedorModal(false);
                }}
              >
                <View style={styles.vendedorItemInfo}>
                  <Text style={styles.vendedorItemNome}>{item.nome}</Text>
                  {item.codigo_vendedor && (
                    <Text style={styles.vendedorItemCodigo}>Código: {item.codigo_vendedor}</Text>
                  )}
                  {item.email && (
                    <Text style={styles.vendedorItemEmail}>{item.email}</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      <Modal visible={showPagamentoModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Configurar Pagamento</Text>
            <TouchableOpacity onPress={() => setShowPagamentoModal(false)}>
              <X color={Colors.text} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Forma de Pagamento</Text>
              {formasPagamento.map((forma) => (
                <TouchableOpacity
                  key={forma.id_forma_pagamento}
                  style={[
                    styles.formaOption,
                    formaPagamentoSelecionada?.id_forma_pagamento === forma.id_forma_pagamento && styles.formaOptionSelected
                  ]}
                  onPress={() => selecionarFormaPagamento(forma)}
                >
                  <Text style={[
                    styles.formaOptionText,
                    formaPagamentoSelecionada?.id_forma_pagamento === forma.id_forma_pagamento && styles.formaOptionTextSelected
                  ]}>
                    {forma.descricao}
                  </Text>
                  <Text style={styles.formaOptionInfo}>
                    Até {forma.numero_max_parcelas}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {formaPagamentoSelecionada && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Número de Parcelas</Text>
                <View style={styles.parcelasGrid}>
                  {[1, 2, 3, 4, 5, 6, 10, 12].filter(p => p <= (formaPagamentoSelecionada.numero_max_parcelas || 1)).map(parcelas => (
                    <TouchableOpacity
                      key={parcelas}
                      style={[
                        styles.parcelaOption,
                        numeroParcelas === parcelas && styles.parcelaOptionSelected
                      ]}
                      onPress={() => setNumeroParcelas(parcelas)}
                    >
                      <Text style={[
                        styles.parcelaOptionText,
                        numeroParcelas === parcelas && styles.parcelaOptionTextSelected
                      ]}>
                        {parcelas}x
                      </Text>
                      <Text style={styles.parcelaOptionValue}>
                        {formatCurrency(calcularValorLiquido() / parcelas)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {formaPagamentoSelecionada && numeroParcelas > 1 && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Primeira Parcela</Text>
                <TouchableOpacity style={styles.dateSelector}>
                  <Calendar color={Colors.primary} size={20} />
                  <Text style={styles.dateSelectorText}>
                    {primeiraParcela.toLocaleDateString('pt-BR')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {formaPagamentoSelecionada && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Resumo das Parcelas</Text>
                <Text style={styles.parcelaResumoInfo}>
                  {numeroParcelas > 1 ? `${numeroParcelas} parcelas` : 'À vista'} - Total: {formatCurrency(calcularValorLiquido())}
                </Text>
              </View>
            )}

            {formaPagamentoSelecionada && (
              <TouchableOpacity
                style={styles.confirmarButton}
                onPress={configurarPagamento}
              >
                <Text style={styles.confirmarButtonText}>Confirmar Pagamento</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </Modal>
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
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.surface,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    padding: 8,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
  },
  selectorText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
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
  },
  itemInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: 'center',
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
    textAlign: 'right',
  },
  pagamentoCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  pagamentoForma: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  pagamentoInfo: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  parcelaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  pagamentoDetalhes: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  pagamentoVencimento: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
  },
  totalSection: {
    backgroundColor: Colors.surface,
    marginTop: 12,
    padding: 20,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.success,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  clienteItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  clienteItemNome: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  clienteItemDoc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  produtoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  produtoInfo: {
    flex: 1,
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  produtoCodigo: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  produtoPreco: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
  },
  produtoEstoque: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pagamentoOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pagamentoOptionNome: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  pagamentoOptionParcelas: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  parcelasContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  parcelaButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  parcelaButtonText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  valorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  valorLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  valorValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  divisor: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  vendedorItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  vendedorItemNome: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  vendedorItemEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  modalContent: {
    flex: 1,
  },
  modalSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  formaOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  formaOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#eff6ff',
  },
  formaOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  formaOptionTextSelected: {
    color: Colors.primary,
  },
  formaOptionInfo: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  parcelasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  parcelaOption: {
    minWidth: 80,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  parcelaOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#eff6ff',
  },
  parcelaOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  parcelaOptionTextSelected: {
    color: Colors.primary,
  },
  parcelaOptionValue: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  dateSelectorText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  },
  parcelaResumo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: Colors.background,
    borderRadius: 6,
    marginBottom: 4,
  },
  parcelaResumoNumero: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
  },
  parcelaResumoValor: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
    flex: 1,
    textAlign: 'center',
  },
  parcelaResumoData: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  confirmarButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  confirmarButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  parcelaResumoInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  vendedorInfo: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  vendedorItemInfo: {
    flex: 1,
  },
  vendedorItemCodigo: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  quantityButton: {
    padding: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: 'center',
    minWidth: 40,
  },
  produtoItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  produtoQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  produtoQuantityButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  produtoQuantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  descontoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  descontoInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: 'center',
  },
  descontoTipoButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
  },
  descontoTipoText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
});
