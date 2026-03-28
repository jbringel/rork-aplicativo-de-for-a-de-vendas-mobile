# Arquivos de Exemplo para Sincronização

Este diretório contém arquivos de exemplo que podem ser usados para testar a funcionalidade de sincronização do app de vendas.

## Arquivos Disponíveis

### 1. Formato CSV

- **clientes.csv** - Lista de clientes com todos os campos disponíveis
- **produtos.csv** - Catálogo de produtos com preços e estoque
- **formas_pagamento.csv** - Formas de pagamento aceitas
- **vendedores.csv** - Lista de vendedores/representantes

### 2. Formato JSON

- **dados_sincronizacao.json** - Arquivo completo com todos os dados em formato JSON, incluindo estrutura para exportação de pedidos

## Estrutura dos Dados

### Clientes
- **Campos obrigatórios**: nome_razao
- **Campos opcionais**: fantasia, cpf_cnpj, endereço completo, telefone, email, limites de crédito
- **Observações**: Campo `ativo` controla se o cliente está ativo (1) ou inativo (0)

### Produtos
- **Campos obrigatórios**: codigo, nome, preco_venda
- **Campos opcionais**: descricao, categoria, preco_promocional, estoque_atual, unidade_medida, ncm
- **Observações**: Códigos devem ser únicos

### Formas de Pagamento
- **Campos obrigatórios**: descricao
- **Campos opcionais**: tipo, numero_max_parcelas, parcel_intervalo_dias
- **Tipos disponíveis**: dinheiro, cartao, pix, boleto, crediario, transferencia, cheque

### Vendedores
- **Campos obrigatórios**: nome
- **Campos opcionais**: codigo_vendedor, email, telefone
- **Observações**: Código do vendedor deve ser único

## Como Usar

1. **Para Importação**: Use os arquivos CSV ou JSON como base para criar seus próprios dados
2. **Para Exportação**: O formato JSON mostra como os pedidos são estruturados para envio ao ERP
3. **Para Testes**: Carregue os arquivos de exemplo diretamente no sistema

## Formato de Datas

- **Formato padrão**: YYYY-MM-DD (ex: 2024-01-15)
- **Campos de data**: data_pedido, data_vencimento, data_mov

## Valores Monetários

- **Formato**: Decimal com ponto como separador (ex: 1250.50)
- **Campos monetários**: preco_venda, limite_credito, saldo_devedor, valor_parcela

## Observações Importantes

- Todos os IDs são gerados automaticamente pelo sistema
- Campos com valor `null` no JSON podem ser omitidos
- No CSV, campos vazios devem ser deixados em branco
- O campo `ativo` aceita valores 1 (ativo) ou 0 (inativo)
- Relacionamentos entre tabelas são feitos através dos IDs (id_cliente, id_produto, etc.)