import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Save, X } from 'lucide-react-native';
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

export default function ClienteFormScreen() {
  const { clienteId } = useLocalSearchParams();
  const { clientes, addCliente, updateCliente } = useVendas();
  
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nome_razao: '',
    cpf_cnpj: '',
    endereco_logradouro: '',
    endereco_numero: '',
    endereco_complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
    telefone: '',
    email: '',
    limite_credito: 0,
    saldo_devedor: 0,
    observacoes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (clienteId) {
      const cliente = clientes.find(c => c.id_cliente === Number(clienteId));
      if (cliente) {
        setFormData(cliente);
      }
    }
  }, [clienteId, clientes]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome_razao?.trim()) {
      newErrors.nome_razao = 'Nome/Razão Social é obrigatório';
    }

    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (clienteId) {
        await updateCliente(formData as Cliente);
        Alert.alert('Sucesso', 'Cliente atualizado com sucesso!');
      } else {
        await addCliente(formData as Omit<Cliente, 'id_cliente'>);
        Alert.alert('Sucesso', 'Cliente cadastrado com sucesso!');
      }
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar cliente. Tente novamente.');
    }
  };

  const updateField = (field: keyof Cliente, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X color={Colors.surface} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {clienteId ? 'Editar Cliente' : 'Novo Cliente'}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Save color={Colors.surface} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome/Razão Social *</Text>
            <TextInput
              style={[styles.input, errors.nome_razao && styles.inputError]}
              value={formData.nome_razao}
              onChangeText={(text) => updateField('nome_razao', text)}
              placeholder="Digite o nome ou razão social"
            />
            {errors.nome_razao && <Text style={styles.errorText}>{errors.nome_razao}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CPF/CNPJ</Text>
            <TextInput
              style={styles.input}
              value={formData.cpf_cnpj}
              onChangeText={(text) => updateField('cpf_cnpj', text)}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contato</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={formData.telefone}
              onChangeText={(text) => updateField('telefone', text)}
              placeholder="(00) 00000-0000"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              placeholder="email@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Logradouro</Text>
            <TextInput
              style={styles.input}
              value={formData.endereco_logradouro}
              onChangeText={(text) => updateField('endereco_logradouro', text)}
              placeholder="Rua, Avenida, etc."
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.label}>Número</Text>
              <TextInput
                style={styles.input}
                value={formData.endereco_numero}
                onChangeText={(text) => updateField('endereco_numero', text)}
                placeholder="123"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 3, marginLeft: 12 }]}>
              <Text style={styles.label}>Complemento</Text>
              <TextInput
                style={styles.input}
                value={formData.endereco_complemento}
                onChangeText={(text) => updateField('endereco_complemento', text)}
                placeholder="Apto, Sala, etc."
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bairro</Text>
            <TextInput
              style={styles.input}
              value={formData.bairro}
              onChangeText={(text) => updateField('bairro', text)}
              placeholder="Nome do bairro"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 3 }]}>
              <Text style={styles.label}>Cidade</Text>
              <TextInput
                style={styles.input}
                value={formData.cidade}
                onChangeText={(text) => updateField('cidade', text)}
                placeholder="Nome da cidade"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>UF</Text>
              <TextInput
                style={styles.input}
                value={formData.uf}
                onChangeText={(text) => updateField('uf', text.toUpperCase())}
                placeholder="SP"
                maxLength={2}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CEP</Text>
            <TextInput
              style={styles.input}
              value={formData.cep}
              onChangeText={(text) => updateField('cep', text)}
              placeholder="00000-000"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Financeiras</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Limite de Crédito</Text>
              <TextInput
                style={styles.input}
                value={formData.limite_credito?.toString() || '0'}
                onChangeText={(text) => updateField('limite_credito', parseFloat(text) || 0)}
                placeholder="0,00"
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Saldo Devedor</Text>
              <TextInput
                style={styles.input}
                value={formData.saldo_devedor?.toString() || '0'}
                onChangeText={(text) => updateField('saldo_devedor', parseFloat(text) || 0)}
                placeholder="0,00"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.observacoes}
              onChangeText={(text) => updateField('observacoes', text)}
              placeholder="Observações adicionais..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  textArea: {
    height: 100,
  },
  row: {
    flexDirection: 'row',
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
  },
  bottomPadding: {
    height: 20,
  },
});