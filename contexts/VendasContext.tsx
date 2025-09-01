import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';

// Import types and database manager directly
import type { Cliente, Produto, Pedido, FormaPagamento, Vendedor, Sincronizacao } from '@/database/schema';
import { dbManager } from '@/database/schema';

// Create mock database for web or error cases
const createMockDatabase = () => {
  console.log('Criando mock database...');
  return {
    getClientes: () => {
      console.log('Mock: getClientes chamado');
      return [
        {
          id_cliente: 1,
          nome_razao: 'João Silva',
          cpf_cnpj: '123.456.789-00',
          telefone: '(11) 99999-9999',
          email: 'joao@email.com',
          limite_credito: 5000.00,
          saldo_devedor: 0,
          ativo: 1
        },
        {
          id_cliente: 2,
          nome_razao: 'Maria Santos',
          cpf_cnpj: '987.654.321-00',
          telefone: '(11) 88888-8888',
          email: 'maria@email.com',
          limite_credito: 3000.00,
          saldo_devedor: 0,
          ativo: 1
        }
      ];
    },
    getProdutos: () => {
      console.log('Mock: getProdutos chamado');
      return [
        {
          id_produto: 1,
          codigo: '001',
          nome: 'Produto A',
          categoria: 'Categoria 1',
          preco_venda: 25.90,
          estoque_atual: 100,
          unidade_medida: 'UN',
          ativo: 1
        },
        {
          id_produto: 2,
          codigo: '002',
          nome: 'Produto B',
          categoria: 'Categoria 1',
          preco_venda: 45.50,
          estoque_atual: 50,
          unidade_medida: 'UN',
          ativo: 1
        }
      ];
    },
    getPedidos: () => {
      console.log('Mock: getPedidos chamado');
      return [];
    },
    getFormasPagamento: () => {
      console.log('Mock: getFormasPagamento chamado');
      return [
        {
          id_forma_pagamento: 1,
          descricao: 'À Vista',
          tipo: 'dinheiro',
          numero_max_parcelas: 1,
          parcel_intervalo_dias: 0,
          ativo: 1
        },
        {
          id_forma_pagamento: 2,
          descricao: 'Cartão de Crédito',
          tipo: 'cartao',
          numero_max_parcelas: 12,
          parcel_intervalo_dias: 30,
          ativo: 1
        }
      ];
    },
    getVendedores: () => {
      console.log('Mock: getVendedores chamado');
      return [
        {
          id_vendedor: 1,
          codigo_vendedor: '1',
          nome: 'Supervisor',
          email: 'supervisor@empresa.com',
          telefone: '(11) 99999-9999',
          ativo: 1
        }
      ];
    },
    getSincronizacoes: () => {
      console.log('Mock: getSincronizacoes chamado');
      return [];
    },
    getDashboardData: () => {
      console.log('Mock: getDashboardData chamado');
      return { 
        vendasHoje: { total: 0, valor: 0 }, 
        vendasMes: { total: 0, valor: 0 }, 
        produtosMaisVendidos: [], 
        pedidosRecentes: [] 
      };
    },
    insertCliente: () => Math.floor(Math.random() * 1000),
    updateCliente: () => {},
    deleteCliente: () => {},
    searchProdutos: () => [],
    insertVendedor: () => Math.floor(Math.random() * 1000),
    insertPedido: () => Math.floor(Math.random() * 1000),
    insertItemPedido: () => Math.floor(Math.random() * 1000),
    insertPedidoPagamento: () => Math.floor(Math.random() * 1000),
    getItensPedido: () => [],
    getPagamentosPedido: () => [],
    calculateParcelas: (valor: number, parcelas: number) => {
      const valorParcela = valor / parcelas;
      return Array.from({ length: parcelas }, (_, i) => ({
        numero: i + 1,
        valor: valorParcela,
        vencimento: new Date(Date.now() + (i * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      }));
    },
    insertSincronizacao: () => Math.floor(Math.random() * 1000),
    updateSincronizacao: () => {}
  };
};

// Initialize database manager
const initializeDatabase = () => {
  try {
    console.log('Inicializando database manager... Platform:', Platform.OS);
    
    if (Platform.OS === 'web') {
      console.log('Usando mock database para web');
      return createMockDatabase();
    }
    
    // Sempre tentar usar o dbManager, mas com fallback
    try {
      if (dbManager && typeof dbManager.getClientes === 'function') {
        console.log('Database manager inicializado com sucesso');
        return dbManager;
      } else {
        console.warn('Database manager não está pronto, usando mock');
        return createMockDatabase();
      }
    } catch (dbError) {
      console.error('Erro ao acessar database manager:', dbError);
      return createMockDatabase();
    }
  } catch (error) {
    console.error('Erro crítico ao inicializar database:', error);
    return createMockDatabase();
  }
};

export const [VendasContext, useVendas] = createContextHook(() => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [sincronizacoes, setSincronizacoes] = useState<Sincronizacao[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Iniciando carregamento de dados...');
      
      // Initialize database manager
      const db = initializeDatabase();
      
      // Carregar dados de forma segura
      console.log('Carregando clientes...');
      const clientesData = await Promise.resolve(db.getClientes());
      console.log('Clientes carregados:', clientesData?.length || 0);
      
      console.log('Carregando produtos...');
      const produtosData = await Promise.resolve(db.getProdutos());
      console.log('Produtos carregados:', produtosData?.length || 0);
      
      console.log('Carregando pedidos...');
      const pedidosData = await Promise.resolve(db.getPedidos());
      console.log('Pedidos carregados:', pedidosData?.length || 0);
      
      console.log('Carregando formas de pagamento...');
      const formasData = await Promise.resolve(db.getFormasPagamento());
      console.log('Formas de pagamento carregadas:', formasData?.length || 0);
      
      console.log('Carregando vendedores...');
      const vendedoresData = await Promise.resolve(db.getVendedores());
      console.log('Vendedores carregados:', vendedoresData?.length || 0);
      
      console.log('Carregando sincronizações...');
      const syncData = await Promise.resolve(db.getSincronizacoes());
      console.log('Sincronizações carregadas:', syncData?.length || 0);
      
      console.log('Carregando dashboard data...');
      const dashData = await Promise.resolve(db.getDashboardData());
      console.log('Dashboard data:', dashData);

      // Atualizar estado de forma segura
      setClientes(Array.isArray(clientesData) ? clientesData : []);
      setProdutos(Array.isArray(produtosData) ? produtosData : []);
      setPedidos(Array.isArray(pedidosData) ? pedidosData : []);
      setFormasPagamento(Array.isArray(formasData) ? formasData : []);
      setVendedores(Array.isArray(vendedoresData) ? vendedoresData : []);
      setSincronizacoes(Array.isArray(syncData) ? syncData : []);
      setDashboardData(dashData || {
        vendasHoje: { total: 0, valor: 0 },
        vendasMes: { total: 0, valor: 0 },
        produtosMaisVendidos: [],
        pedidosRecentes: []
      });
      
      console.log('Dados carregados com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      
      // Definir valores padrão em caso de erro
      setClientes([]);
      setProdutos([]);
      setPedidos([]);
      setFormasPagamento([]);
      setVendedores([]);
      setSincronizacoes([]);
      setDashboardData({
        vendasHoje: { total: 0, valor: 0 },
        vendasMes: { total: 0, valor: 0 },
        produtosMaisVendidos: [],
        pedidosRecentes: []
      });
    } finally {
      setIsLoading(false);
      console.log('LoadData finalizado');
    }
  }, []);

  useEffect(() => {
    console.log('VendasContext inicializando...');
    
    // Carregar dados imediatamente, mas de forma segura
    loadData().catch(error => {
      console.error('Erro no carregamento inicial:', error);
    });
  }, [loadData]);

  const addCliente = useCallback(async (cliente: Omit<Cliente, 'id_cliente'>) => {
    try {
      const db = initializeDatabase();
      const id = db.insertCliente(cliente);
      const novoCliente = { ...cliente, id_cliente: id };
      setClientes(prev => [...prev, novoCliente]);
      return id;
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
  }, []);

  const updateCliente = useCallback(async (cliente: Cliente) => {
    try {
      const db = initializeDatabase();
      db.updateCliente(cliente);
      setClientes(prev => prev.map(c => c.id_cliente === cliente.id_cliente ? cliente : c));
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }, []);

  const deleteCliente = useCallback(async (id: number) => {
    try {
      const db = initializeDatabase();
      db.deleteCliente(id);
      setClientes(prev => prev.filter(c => c.id_cliente !== id));
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  }, []);

  const searchProdutos = useCallback(async (query: string) => {
    try {
      const db = initializeDatabase();
      return db.searchProdutos(query);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }, []);

  const createPedido = useCallback(async (pedidoData: {
    cliente: Cliente;
    vendedor?: Vendedor;
    itens: {
      produto: Produto;
      quantidade: number;
      valor_unitario: number;
      desconto_item?: number;
    }[];
    pagamentos: {
      forma_pagamento: FormaPagamento;
      parcelas: {
        numero: number;
        valor: number;
        vencimento: string;
      }[];
    }[];
    observacoes?: string;
  }) => {
    try {
      const db = initializeDatabase();
      
      // Verificar se o vendedor precisa ser inserido no banco
      let vendedorId = pedidoData.vendedor?.id_vendedor;
      
      if (pedidoData.vendedor && !pedidoData.vendedor.id_vendedor) {
        // Vendedor temporário (baseado no usuário logado) - inserir no banco
        const novoVendedorId = db.insertVendedor({
          codigo_vendedor: pedidoData.vendedor.codigo_vendedor,
          nome: pedidoData.vendedor.nome,
          ativo: 1
        });
        vendedorId = novoVendedorId;
        
        // Atualizar lista de vendedores no estado
        const novoVendedor = {
          ...pedidoData.vendedor,
          id_vendedor: novoVendedorId
        };
        setVendedores(prev => [...prev, novoVendedor]);
      }
      
      // Calcular valores
      const valorBruto = pedidoData.itens.reduce((total, item) => {
        return total + (item.quantidade * item.valor_unitario);
      }, 0);
      
      const valorDesconto = pedidoData.itens.reduce((total, item) => {
        return total + (item.desconto_item || 0);
      }, 0);
      
      const valorLiquido = valorBruto - valorDesconto;

      const pedido: Omit<Pedido, 'id_pedido'> = {
        id_cliente: pedidoData.cliente.id_cliente!,
        id_vendedor: vendedorId,
        data_pedido: new Date().toISOString().split('T')[0],
        status: 'Pendente',
        valor_bruto: valorBruto,
        valor_desconto: valorDesconto,
        valor_liquido: valorLiquido,
        forma_pagamento_padrao: pedidoData.pagamentos[0]?.forma_pagamento.id_forma_pagamento,
        observacoes: pedidoData.observacoes,
        sincronizado: 0
      };

      const pedidoId = db.insertPedido(pedido);

      // Inserir itens do pedido
      pedidoData.itens.forEach(item => {
        const subtotal = (item.quantidade * item.valor_unitario) - (item.desconto_item || 0);
        db.insertItemPedido({
          id_pedido: pedidoId,
          id_produto: item.produto.id_produto!,
          codigo_produto: item.produto.codigo,
          descricao_produto: item.produto.nome,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          desconto_item: item.desconto_item || 0,
          subtotal
        });
      });

      // Inserir pagamentos com parcelas
      pedidoData.pagamentos.forEach(pagamento => {
        pagamento.parcelas.forEach(parcela => {
          db.insertPedidoPagamento({
            id_pedido: pedidoId,
            id_forma_pagamento: pagamento.forma_pagamento.id_forma_pagamento!,
            numero_parcela: parcela.numero,
            valor_parcela: parcela.valor,
            data_vencimento: parcela.vencimento,
            status_parcela: 'Aberta'
          });
        });
      });

      // Recarregar dados
      loadData();
      
      return pedidoId;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  }, [loadData]);

  const getPedidoDetalhes = useCallback(async (idPedido: number) => {
    try {
      const db = initializeDatabase();
      const itens = db.getItensPedido(idPedido);
      const pagamentos = db.getPagamentosPedido(idPedido);
      return { itens, pagamentos };
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      return { itens: [], pagamentos: [] };
    }
  }, []);

  // Função para calcular parcelas
  const calculateParcelas = useCallback(async (valorLiquido: number, numeroParcelas: number, formaPagamento: FormaPagamento, primeiraParcela?: Date) => {
    const db = initializeDatabase();
    const intervaloDias = formaPagamento.parcel_intervalo_dias || 30;
    const dataInicial = primeiraParcela || new Date();
    return db.calculateParcelas(valorLiquido, numeroParcelas, intervaloDias, dataInicial);
  }, []);

  // Função para sincronização
  const iniciarSincronizacao = useCallback(async (tipo: string) => {
    try {
      setIsSyncing(true);
      const db = initializeDatabase();
      const syncId = db.insertSincronizacao({
        tipo,
        inicio: new Date().toISOString(),
        status: 'Em andamento'
      });
      
      // Aqui seria implementada a lógica de sincronização com API
      // Por enquanto, simular sucesso após 2 segundos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      db.updateSincronizacao(
        syncId,
        new Date().toISOString(),
        'Concluída',
        'Sincronização realizada com sucesso'
      );
      
      // Recarregar dados
      loadData();
      
      return true;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [loadData]);

  // Função para obter pedidos por status
  const getPedidosPorStatus = useCallback((status: string) => {
    return pedidos.filter(pedido => pedido.status === status);
  }, [pedidos]);

  return useMemo(() => ({
    clientes,
    produtos,
    pedidos,
    formasPagamento,
    vendedores,
    sincronizacoes,
    dashboardData,
    isLoading,
    isSyncing,
    addCliente,
    updateCliente,
    deleteCliente,
    searchProdutos,
    createPedido,
    getPedidoDetalhes,
    calculateParcelas,
    iniciarSincronizacao,
    getPedidosPorStatus,
    loadData
  }), [
    clientes,
    produtos,
    pedidos,
    formasPagamento,
    vendedores,
    sincronizacoes,
    dashboardData,
    isLoading,
    isSyncing,
    addCliente,
    updateCliente,
    deleteCliente,
    searchProdutos,
    createPedido,
    getPedidoDetalhes,
    calculateParcelas,
    iniciarSincronizacao,
    getPedidosPorStatus,
    loadData
  ]);
});