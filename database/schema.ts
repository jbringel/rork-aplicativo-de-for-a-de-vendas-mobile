import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export interface Cliente {
  id_cliente?: number;
  nome_razao: string;
  fantasia?: string;
  cpf_cnpj?: string;
  inscricao_estadual?: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  limite_credito?: number;
  saldo_devedor?: number;
  vendedor_responsavel?: number;
  observacoes?: string;
  ativo?: number;
}

export interface Produto {
  id_produto?: number;
  codigo: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  preco_venda: number;
  preco_promocional?: number;
  estoque_atual?: number;
  unidade_medida?: string;
  ncm?: string;
  observacoes?: string;
  ativo?: number;
}

export interface Pedido {
  id_pedido?: number;
  id_cliente: number;
  id_vendedor?: number;
  data_pedido: string;
  status?: string;
  valor_bruto?: number;
  valor_desconto?: number;
  valor_liquido?: number;
  forma_pagamento_padrao?: number;
  observacoes?: string;
  sincronizado?: number;
}

export interface ItemPedido {
  id_item?: number;
  id_pedido: number;
  id_produto: number;
  codigo_produto?: string;
  descricao_produto?: string;
  quantidade: number;
  valor_unitario: number;
  desconto_item?: number;
  subtotal: number;
}

export interface FormaPagamento {
  id_forma_pagamento?: number;
  descricao: string;
  tipo?: string;
  numero_max_parcelas?: number;
  parcel_intervalo_dias?: number;
  ativo?: number;
}

export interface Vendedor {
  id_vendedor?: number;
  codigo_vendedor?: string;
  nome: string;
  email?: string;
  telefone?: string;
  ativo?: number;
}

export interface Sincronizacao {
  id_sync?: number;
  tipo: string;
  inicio: string;
  fim?: string;
  status: string;
  mensagem?: string;
}

export interface EstoqueMovimento {
  id_mov?: number;
  id_produto: number;
  tipo_mov: string;
  quantidade: number;
  data_mov: string;
  referencia?: string;
}

export interface PedidoPagamento {
  id_pagamento?: number;
  id_pedido: number;
  id_forma_pagamento: number;
  numero_parcela: number;
  valor_parcela: number;
  data_vencimento: string;
  status_parcela?: string;
}

export class DatabaseManager {
  private db: SQLite.SQLiteDatabase | any;

  constructor() {
    try {
      console.log('Inicializando banco de dados... Platform:', Platform.OS);
      
      // Verificar se estamos no web - SQLite não funciona no web
      if (Platform.OS === 'web') {
        console.warn('SQLite não suportado no web, usando dados mock');
        this.initMockDatabase();
        return;
      }
      
      console.log('Tentando abrir banco SQLite...');
      this.db = SQLite.openDatabaseSync('vendas.db');
      console.log('Banco de dados aberto com sucesso');
      
      // Aguardar um pouco antes de inicializar
      setTimeout(() => {
        try {
          this.initDatabase();
          console.log('Banco de dados inicializado com sucesso');
        } catch (initError) {
          console.error('Erro na inicialização do banco:', initError);
          this.initMockDatabase();
        }
      }, 100);
      
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error);
      
      // Tentar novamente com um nome diferente
      try {
        console.log('Tentando criar banco com nome alternativo...');
        this.db = SQLite.openDatabaseSync('vendas_backup.db');
        
        setTimeout(() => {
          try {
            this.initDatabase();
            console.log('Banco alternativo criado com sucesso');
          } catch (initError) {
            console.error('Erro na inicialização do banco alternativo:', initError);
            this.initMockDatabase();
          }
        }, 100);
        
      } catch (secondError) {
        console.error('Erro crítico ao criar banco:', secondError);
        this.initMockDatabase();
      }
    }
  }
  
  private initMockDatabase() {
    console.log('Inicializando mock database...');
    // @ts-ignore - Mock database for web or error cases
    this.db = {
      execSync: () => {
        console.log('Mock: execSync chamado');
      },
      runSync: () => {
        console.log('Mock: runSync chamado');
        return { lastInsertRowId: Math.floor(Math.random() * 1000), changes: 1 };
      },
      getAllSync: () => {
        console.log('Mock: getAllSync chamado');
        return [];
      },
      getFirstSync: () => {
        console.log('Mock: getFirstSync chamado');
        return { count: 0 };
      }
    };
    this.initWebMockData();
    console.log('Mock database inicializado');
  }

  private initDatabase() {
    try {
      console.log('Criando tabelas do banco de dados...');
      
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS clientes (
          id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
          nome_razao TEXT NOT NULL,
          fantasia TEXT,
          cpf_cnpj TEXT,
          inscricao_estadual TEXT,
          endereco_logradouro TEXT,
          endereco_numero TEXT,
          endereco_complemento TEXT,
          bairro TEXT,
          cidade TEXT,
          uf TEXT,
          cep TEXT,
          telefone TEXT,
          email TEXT,
          limite_credito REAL DEFAULT 0,
          saldo_devedor REAL DEFAULT 0,
          vendedor_responsavel INTEGER,
          observacoes TEXT,
          ativo INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS produtos (
          id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo TEXT NOT NULL UNIQUE,
          nome TEXT NOT NULL,
          descricao TEXT,
          categoria TEXT,
          preco_venda REAL NOT NULL,
          preco_promocional REAL,
          estoque_atual REAL DEFAULT 0,
          unidade_medida TEXT DEFAULT 'UN',
          ncm TEXT,
          observacoes TEXT,
          ativo INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS vendedores (
          id_vendedor INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo_vendedor TEXT,
          nome TEXT NOT NULL,
          email TEXT,
          telefone TEXT,
          ativo INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS pedidos (
          id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
          id_cliente INTEGER,
          id_vendedor INTEGER,
          data_pedido TEXT NOT NULL,
          status TEXT DEFAULT 'Pendente',
          valor_bruto REAL DEFAULT 0,
          valor_desconto REAL DEFAULT 0,
          valor_liquido REAL DEFAULT 0,
          forma_pagamento_padrao INTEGER,
          observacoes TEXT,
          sincronizado INTEGER DEFAULT 0,
          FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente),
          FOREIGN KEY (id_vendedor) REFERENCES vendedores (id_vendedor)
        );

        CREATE TABLE IF NOT EXISTS itens_pedido (
          id_item INTEGER PRIMARY KEY AUTOINCREMENT,
          id_pedido INTEGER,
          id_produto INTEGER,
          codigo_produto TEXT,
          descricao_produto TEXT,
          quantidade REAL NOT NULL,
          valor_unitario REAL NOT NULL,
          desconto_item REAL DEFAULT 0,
          subtotal REAL NOT NULL,
          FOREIGN KEY (id_pedido) REFERENCES pedidos (id_pedido),
          FOREIGN KEY (id_produto) REFERENCES produtos (id_produto)
        );

        CREATE TABLE IF NOT EXISTS formas_pagamento (
          id_forma_pagamento INTEGER PRIMARY KEY AUTOINCREMENT,
          descricao TEXT NOT NULL,
          tipo TEXT,
          numero_max_parcelas INTEGER DEFAULT 1,
          parcel_intervalo_dias INTEGER DEFAULT 30,
          ativo INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS pedido_pagamentos (
          id_pagamento INTEGER PRIMARY KEY AUTOINCREMENT,
          id_pedido INTEGER,
          id_forma_pagamento INTEGER,
          numero_parcela INTEGER NOT NULL,
          valor_parcela REAL NOT NULL,
          data_vencimento TEXT NOT NULL,
          status_parcela TEXT DEFAULT 'Aberta',
          FOREIGN KEY (id_pedido) REFERENCES pedidos (id_pedido),
          FOREIGN KEY (id_forma_pagamento) REFERENCES formas_pagamento (id_forma_pagamento)
        );

        CREATE TABLE IF NOT EXISTS estoque_movimentos (
          id_mov INTEGER PRIMARY KEY AUTOINCREMENT,
          id_produto INTEGER,
          tipo_mov TEXT NOT NULL,
          quantidade REAL NOT NULL,
          data_mov TEXT NOT NULL,
          referencia TEXT,
          FOREIGN KEY (id_produto) REFERENCES produtos (id_produto)
        );

        CREATE TABLE IF NOT EXISTS sincronizacoes (
          id_sync INTEGER PRIMARY KEY AUTOINCREMENT,
          tipo TEXT NOT NULL,
          inicio TEXT NOT NULL,
          fim TEXT,
          status TEXT NOT NULL,
          mensagem TEXT
        );

        CREATE TABLE IF NOT EXISTS metadados_campos (
          id_meta INTEGER PRIMARY KEY AUTOINCREMENT,
          entidade TEXT NOT NULL,
          campo TEXT NOT NULL,
          tipo TEXT NOT NULL,
          obrigatorio INTEGER DEFAULT 0,
          label TEXT
        );
      `);
      
      console.log('Tabelas criadas com sucesso');

      // Inserir dados padrão de forma segura
      try {
        console.log('Inserindo formas de pagamento padrão...');
        this.insertDefaultPaymentMethods();
        
        console.log('Inserindo dados de exemplo...');
        this.insertSampleData();
        
        console.log('Executando migrações...');
        this.runMigrations();
        
        console.log('Inserindo supervisor padrão...');
        this.insertDefaultSupervisor();
        
        console.log('Inicialização do banco concluída com sucesso');
      } catch (dataError) {
        console.error('Erro ao inserir dados padrão:', dataError);
        // Continuar mesmo com erro nos dados padrão
      }
      
    } catch (error) {
      console.error('Erro crítico na inicialização do banco:', error);
      throw error;
    }
  }

  private runMigrations() {
    try {
      console.log('Executando migrações do banco de dados...');
      
      // Verificar se a tabela vendedores existe
      const tables = this.db.getAllSync("SELECT name FROM sqlite_master WHERE type='table' AND name='vendedores'") as any[];
      
      if (tables.length > 0) {
        console.log('Tabela vendedores encontrada, verificando colunas...');
        
        // Verificar se a coluna codigo_vendedor existe na tabela vendedores
        const tableInfo = this.db.getAllSync("PRAGMA table_info(vendedores)") as any[];
        const hasCodigoVendedor = tableInfo.some(column => column.name === 'codigo_vendedor');
        
        if (!hasCodigoVendedor) {
          console.log('Adicionando coluna codigo_vendedor à tabela vendedores...');
          this.db.execSync('ALTER TABLE vendedores ADD COLUMN codigo_vendedor TEXT');
          console.log('Coluna codigo_vendedor adicionada com sucesso!');
        } else {
          console.log('Coluna codigo_vendedor já existe na tabela vendedores');
        }
      } else {
        console.log('Tabela vendedores não existe ainda, será criada pelo CREATE TABLE');
      }
      
      console.log('Migrações executadas com sucesso');
    } catch (error) {
      console.error('Erro ao executar migrações:', error);
      // Continuar mesmo com erro nas migrações
    }
  }

  private insertDefaultPaymentMethods() {
    try {
      const existingMethods = this.db.getFirstSync('SELECT COUNT(*) as count FROM formas_pagamento') as { count: number };
      
      if (existingMethods.count === 0) {
        console.log('Inserindo formas de pagamento padrão...');
        this.db.execSync(`
          INSERT INTO formas_pagamento (descricao, tipo, numero_max_parcelas, parcel_intervalo_dias) VALUES
          ('À Vista', 'dinheiro', 1, 0),
          ('Cartão de Crédito', 'cartao', 12, 30),
          ('Cartão de Débito', 'cartao', 1, 0),
          ('PIX', 'pix', 1, 0),
          ('Boleto', 'boleto', 6, 30),
          ('Crediário', 'crediario', 24, 30);
        `);
        console.log('Formas de pagamento inseridas com sucesso');
      } else {
        console.log('Formas de pagamento já existem no banco');
      }
    } catch (error) {
      console.error('Erro ao inserir formas de pagamento:', error);
    }
  }

  private initWebMockData() {
    if (Platform.OS === 'web') {
      console.log('Inicializando dados mock para web');
      // Dados serão carregados via métodos mock
    }
  }

  private insertSampleData() {
    try {
      const existingClients = this.db.getFirstSync('SELECT COUNT(*) as count FROM clientes') as { count: number };
      
      if (existingClients.count === 0) {
        console.log('Inserindo clientes de exemplo...');
        this.db.execSync(`
          INSERT INTO clientes (nome_razao, cpf_cnpj, telefone, email, limite_credito) VALUES
          ('João Silva', '123.456.789-00', '(11) 99999-9999', 'joao@email.com', 5000.00),
          ('Maria Santos', '987.654.321-00', '(11) 88888-8888', 'maria@email.com', 3000.00),
          ('Empresa ABC Ltda', '12.345.678/0001-90', '(11) 77777-7777', 'contato@abc.com', 10000.00);
        `);
        console.log('Clientes de exemplo inseridos');
      } else {
        console.log('Clientes já existem no banco');
      }

      const existingProducts = this.db.getFirstSync('SELECT COUNT(*) as count FROM produtos') as { count: number };
      
      if (existingProducts.count === 0) {
        console.log('Inserindo produtos de exemplo...');
        this.db.execSync(`
          INSERT INTO produtos (codigo, nome, categoria, preco_venda, estoque_atual) VALUES
          ('001', 'Produto A', 'Categoria 1', 25.90, 100),
          ('002', 'Produto B', 'Categoria 1', 45.50, 50),
          ('003', 'Produto C', 'Categoria 2', 89.90, 25),
          ('004', 'Produto D', 'Categoria 2', 120.00, 15),
          ('005', 'Produto E', 'Categoria 3', 199.90, 8);
        `);
        console.log('Produtos de exemplo inseridos');
      } else {
        console.log('Produtos já existem no banco');
      }
    } catch (error) {
      console.error('Erro ao inserir dados de exemplo:', error);
    }
  }
  
  private insertDefaultSupervisor() {
    try {
      console.log('Verificando supervisor padrão...');
      
      // Verificar se já existe um supervisor com código "1"
      const existingSupervisor = this.db.getFirstSync(
        'SELECT COUNT(*) as count FROM vendedores WHERE codigo_vendedor = ?',
        ['1']
      ) as { count: number };
      
      if (existingSupervisor.count === 0) {
        console.log('Inserindo supervisor padrão...');
        this.db.runSync(
          'INSERT INTO vendedores (codigo_vendedor, nome, email, ativo) VALUES (?, ?, ?, ?)',
          ['1', 'Supervisor', 'supervisor@empresa.com', 1]
        );
        console.log('Supervisor padrão inserido com sucesso!');
      } else {
        console.log('Supervisor padrão já existe');
      }
    } catch (error) {
      console.error('Erro ao inserir supervisor padrão:', error);
      // Continuar mesmo com erro
    }
  }

  // Métodos para Clientes
  getClientes(): Cliente[] {
    if (Platform.OS === 'web') {
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
        },
        {
          id_cliente: 3,
          nome_razao: 'Empresa ABC Ltda',
          cpf_cnpj: '12.345.678/0001-90',
          telefone: '(11) 77777-7777',
          email: 'contato@abc.com',
          limite_credito: 10000.00,
          saldo_devedor: 0,
          ativo: 1
        }
      ];
    }
    return this.db.getAllSync('SELECT * FROM clientes ORDER BY nome_razao') as Cliente[];
  }

  insertCliente(cliente: Omit<Cliente, 'id_cliente'>): number {
    const result = this.db.runSync(
      `INSERT INTO clientes (nome_razao, fantasia, cpf_cnpj, inscricao_estadual, endereco_logradouro, endereco_numero, 
       endereco_complemento, bairro, cidade, uf, cep, telefone, email, limite_credito, 
       saldo_devedor, vendedor_responsavel, observacoes, ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cliente.nome_razao, cliente.fantasia || null, cliente.cpf_cnpj || null, cliente.inscricao_estadual || null,
        cliente.endereco_logradouro || null, cliente.endereco_numero || null, cliente.endereco_complemento || null, 
        cliente.bairro || null, cliente.cidade || null, cliente.uf || null, cliente.cep || null, 
        cliente.telefone || null, cliente.email || null, cliente.limite_credito || 0, 
        cliente.saldo_devedor || 0, cliente.vendedor_responsavel || null, cliente.observacoes || null, cliente.ativo || 1
      ]
    );
    return result.lastInsertRowId;
  }

  updateCliente(cliente: Cliente): void {
    this.db.runSync(
      `UPDATE clientes SET nome_razao = ?, fantasia = ?, cpf_cnpj = ?, inscricao_estadual = ?, endereco_logradouro = ?, 
       endereco_numero = ?, endereco_complemento = ?, bairro = ?, cidade = ?, uf = ?, 
       cep = ?, telefone = ?, email = ?, limite_credito = ?, saldo_devedor = ?, 
       vendedor_responsavel = ?, observacoes = ?, ativo = ? WHERE id_cliente = ?`,
      [
        cliente.nome_razao, cliente.fantasia || null, cliente.cpf_cnpj || null, cliente.inscricao_estadual || null,
        cliente.endereco_logradouro || null, cliente.endereco_numero || null, cliente.endereco_complemento || null,
        cliente.bairro || null, cliente.cidade || null, cliente.uf || null, cliente.cep || null, 
        cliente.telefone || null, cliente.email || null, cliente.limite_credito || 0, 
        cliente.saldo_devedor || 0, cliente.vendedor_responsavel || null, cliente.observacoes || null, 
        cliente.ativo || 1, cliente.id_cliente || 0
      ]
    );
  }

  deleteCliente(id: number): void {
    this.db.runSync('DELETE FROM clientes WHERE id_cliente = ?', [id]);
  }

  // Métodos para Produtos
  getProdutos(): Produto[] {
    if (Platform.OS === 'web') {
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
        },
        {
          id_produto: 3,
          codigo: '003',
          nome: 'Produto C',
          categoria: 'Categoria 2',
          preco_venda: 89.90,
          estoque_atual: 25,
          unidade_medida: 'UN',
          ativo: 1
        }
      ];
    }
    return this.db.getAllSync('SELECT * FROM produtos ORDER BY nome') as Produto[];
  }

  searchProdutos(query: string): Produto[] {
    return this.db.getAllSync(
      'SELECT * FROM produtos WHERE nome LIKE ? OR codigo LIKE ? ORDER BY nome',
      [`%${query}%`, `%${query}%`]
    ) as Produto[];
  }

  // Métodos para Pedidos
  getPedidos(): any[] {
    if (Platform.OS === 'web') {
      return [];
    }
    return this.db.getAllSync(`
      SELECT p.*, c.nome_razao as cliente_nome, v.nome as vendedor_nome 
      FROM pedidos p 
      LEFT JOIN clientes c ON p.id_cliente = c.id_cliente 
      LEFT JOIN vendedores v ON p.id_vendedor = v.id_vendedor
      ORDER BY p.data_pedido DESC
    `) as any[];
  }

  insertPedido(pedido: Omit<Pedido, 'id_pedido'>): number {
    const result = this.db.runSync(
      'INSERT INTO pedidos (id_cliente, id_vendedor, data_pedido, status, valor_bruto, valor_desconto, valor_liquido, forma_pagamento_padrao, observacoes, sincronizado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        pedido.id_cliente, pedido.id_vendedor || null, pedido.data_pedido, pedido.status || 'Pendente', 
        pedido.valor_bruto || 0, pedido.valor_desconto || 0, pedido.valor_liquido || 0, 
        pedido.forma_pagamento_padrao || null, pedido.observacoes || null, pedido.sincronizado || 0
      ]
    );
    return result.lastInsertRowId;
  }

  insertItemPedido(item: Omit<ItemPedido, 'id_item'>): number {
    const result = this.db.runSync(
      'INSERT INTO itens_pedido (id_pedido, id_produto, codigo_produto, descricao_produto, quantidade, valor_unitario, desconto_item, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        item.id_pedido, item.id_produto, item.codigo_produto || null, item.descricao_produto || null,
        item.quantidade, item.valor_unitario, item.desconto_item || 0, item.subtotal
      ]
    );
    return result.lastInsertRowId;
  }

  getItensPedido(idPedido: number): any[] {
    return this.db.getAllSync(`
      SELECT ip.*, p.nome as produto_nome, p.codigo as produto_codigo
      FROM itens_pedido ip
      LEFT JOIN produtos p ON ip.id_produto = p.id_produto
      WHERE ip.id_pedido = ?
    `, [idPedido]) as any[];
  }

  // Métodos para Formas de Pagamento
  getFormasPagamento(): FormaPagamento[] {
    if (Platform.OS === 'web') {
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
        },
        {
          id_forma_pagamento: 3,
          descricao: 'PIX',
          tipo: 'pix',
          numero_max_parcelas: 1,
          parcel_intervalo_dias: 0,
          ativo: 1
        }
      ];
    }
    return this.db.getAllSync('SELECT * FROM formas_pagamento WHERE ativo = 1 ORDER BY descricao') as FormaPagamento[];
  }

  insertPedidoPagamento(pagamento: Omit<PedidoPagamento, 'id_pagamento'>): number {
    const result = this.db.runSync(
      'INSERT INTO pedido_pagamentos (id_pedido, id_forma_pagamento, numero_parcela, valor_parcela, data_vencimento, status_parcela) VALUES (?, ?, ?, ?, ?, ?)',
      [
        pagamento.id_pedido, pagamento.id_forma_pagamento, pagamento.numero_parcela, 
        pagamento.valor_parcela, pagamento.data_vencimento, pagamento.status_parcela || 'Aberta'
      ]
    );
    return result.lastInsertRowId;
  }

  getPagamentosPedido(idPedido: number): any[] {
    return this.db.getAllSync(`
      SELECT pp.*, fp.descricao as forma_descricao
      FROM pedido_pagamentos pp
      LEFT JOIN formas_pagamento fp ON pp.id_forma_pagamento = fp.id_forma_pagamento
      WHERE pp.id_pedido = ?
      ORDER BY pp.numero_parcela
    `, [idPedido]) as any[];
  }

  // Métodos para Vendedores
  getVendedores(): Vendedor[] {
    if (Platform.OS === 'web') {
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
    }
    return this.db.getAllSync('SELECT * FROM vendedores WHERE ativo = 1 ORDER BY nome') as Vendedor[];
  }

  insertVendedor(vendedor: Omit<Vendedor, 'id_vendedor'>): number {
    const result = this.db.runSync(
      'INSERT INTO vendedores (codigo_vendedor, nome, email, telefone, ativo) VALUES (?, ?, ?, ?, ?)',
      [vendedor.codigo_vendedor || null, vendedor.nome, vendedor.email || null, vendedor.telefone || null, vendedor.ativo || 1]
    );
    return result.lastInsertRowId;
  }

  // Métodos para Sincronização
  insertSincronizacao(sync: Omit<Sincronizacao, 'id_sync'>): number {
    if (Platform.OS === 'web') {
      return Math.floor(Math.random() * 1000);
    }
    const result = this.db.runSync(
      'INSERT INTO sincronizacoes (tipo, inicio, fim, status, mensagem) VALUES (?, ?, ?, ?, ?)',
      [sync.tipo, sync.inicio, sync.fim || null, sync.status, sync.mensagem || null]
    );
    return result.lastInsertRowId;
  }

  getSincronizacoes(): Sincronizacao[] {
    if (Platform.OS === 'web') {
      return [];
    }
    return this.db.getAllSync('SELECT * FROM sincronizacoes ORDER BY inicio DESC LIMIT 50') as Sincronizacao[];
  }

  updateSincronizacao(id: number, fim: string, status: string, mensagem?: string): void {
    this.db.runSync(
      'UPDATE sincronizacoes SET fim = ?, status = ?, mensagem = ? WHERE id_sync = ?',
      [fim, status, mensagem || null, id]
    );
  }

  // Métodos para Estoque
  insertEstoqueMovimento(movimento: Omit<EstoqueMovimento, 'id_mov'>): number {
    const result = this.db.runSync(
      'INSERT INTO estoque_movimentos (id_produto, tipo_mov, quantidade, data_mov, referencia) VALUES (?, ?, ?, ?, ?)',
      [movimento.id_produto, movimento.tipo_mov, movimento.quantidade, movimento.data_mov, movimento.referencia || null]
    );
    return result.lastInsertRowId;
  }

  getEstoqueMovimentos(idProduto?: number): EstoqueMovimento[] {
    if (idProduto) {
      return this.db.getAllSync(
        'SELECT * FROM estoque_movimentos WHERE id_produto = ? ORDER BY data_mov DESC',
        [idProduto]
      ) as EstoqueMovimento[];
    }
    return this.db.getAllSync('SELECT * FROM estoque_movimentos ORDER BY data_mov DESC LIMIT 100') as EstoqueMovimento[];
  }

  // Utilitários para Parcelamento
  calculateParcelas(valorLiquido: number, numeroParcelas: number, intervaloDias: number = 30, primeiraParcela: Date = new Date()): {numero: number, valor: number, vencimento: string}[] {
    const valorBase = Math.round((valorLiquido / numeroParcelas) * 100) / 100;
    const resto = Math.round((valorLiquido - (valorBase * numeroParcelas)) * 100) / 100;
    
    const parcelas = [];
    
    for (let i = 1; i <= numeroParcelas; i++) {
      const dataVencimento = new Date(primeiraParcela);
      dataVencimento.setDate(dataVencimento.getDate() + ((i - 1) * intervaloDias));
      
      const valor = i === numeroParcelas ? valorBase + resto : valorBase;
      
      parcelas.push({
        numero: i,
        valor: valor,
        vencimento: dataVencimento.toISOString().split('T')[0]
      });
    }
    
    return parcelas;
  }

  // Métodos para Dashboard
  getDashboardData(): any {
    if (Platform.OS === 'web') {
      return {
        vendasHoje: { total: 0, valor: 0 },
        vendasMes: { total: 0, valor: 0 },
        produtosMaisVendidos: [],
        pedidosRecentes: []
      };
    }
    
    const hoje = new Date().toISOString().split('T')[0];
    const mesAtual = hoje.substring(0, 7);

    const vendasHoje = this.db.getFirstSync(
      'SELECT COUNT(*) as total, COALESCE(SUM(valor_liquido), 0) as valor FROM pedidos WHERE DATE(data_pedido) = ?',
      [hoje]
    );

    const vendasMes = this.db.getFirstSync(
      'SELECT COUNT(*) as total, COALESCE(SUM(valor_liquido), 0) as valor FROM pedidos WHERE strftime("%Y-%m", data_pedido) = ?',
      [mesAtual]
    );

    const produtosMaisVendidos = this.db.getAllSync(`
      SELECT p.nome, SUM(ip.quantidade) as total_vendido
      FROM itens_pedido ip
      LEFT JOIN produtos p ON ip.id_produto = p.id_produto
      LEFT JOIN pedidos pd ON ip.id_pedido = pd.id_pedido
      WHERE strftime("%Y-%m", pd.data_pedido) = ?
      GROUP BY ip.id_produto, p.nome
      ORDER BY total_vendido DESC
      LIMIT 5
    `, [mesAtual]);

    const pedidosRecentes = this.db.getAllSync(`
      SELECT p.id_pedido, p.data_pedido, p.valor_liquido, c.nome_razao as cliente_nome
      FROM pedidos p
      LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
      ORDER BY p.data_pedido DESC
      LIMIT 10
    `);

    return {
      vendasHoje,
      vendasMes,
      produtosMaisVendidos,
      pedidosRecentes
    };
  }
}

export const dbManager = new DatabaseManager();