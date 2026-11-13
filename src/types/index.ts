export type TabType = 'home' | 'clientes' | 'agendamentos' | 'financeiro' | 'produtos' | 'servicos';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  skinType?: 'Seca' | 'Oleosa' | 'Mista' | 'Normal' | 'Sensível';
  allergies?: string;
  notes?: string;
  lastVisit?: string;
  createdAt?: string;
  archived?: boolean;
}

export interface Appointment {
  id: string;
  clientId?: string;
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  durationMinutes: number;
  price: number;
  status: 'agendado' | 'confirmado' | 'concluido' | 'cancelado';
  notes?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  description: string;
  isPackage?: boolean;
  includedServiceIds?: string[];
  includedServiceNames?: string[];
  originalPrice?: number;
  postCareInstructions?: string;
  postCareImageUrl?: string;
  archived?: boolean;
}

export interface ProductItem {
  id: string;
  name: string;
  category: 'cabine' | 'homecare';
  stock: number;
  minStock: number;
  price: number;
  unit: string;
}

export interface Transaction {
  id: string;
  description: string;
  type: 'receita' | 'despesa';
  amount: number;
  date: string;
  category: string;
  paymentMethod: 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro';
}
