import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Transaction } from '../types';

interface FinanceiroViewProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Transaction) => void;
}

export const FinanceiroView: React.FC<FinanceiroViewProps> = ({
  transactions,
  onAddTransaction,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'receita' | 'despesa'>('receita');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Procedimento Facial');
  const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>('Pix');

  const totalReceitas = transactions
    .filter((t) => t.type === 'receita')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalDespesas = transactions
    .filter((t) => t.type === 'despesa')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      description: description.trim(),
      type,
      amount: parseFloat(amount),
      date: 'Hoje',
      category,
      paymentMethod,
    };

    onAddTransaction(newTx);
    setDescription('');
    setAmount('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top summary row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#EFE5E0] shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#423533]">Controle Financeiro</h2>
          <p className="text-xs text-[#8C7B76]">
            Fluxo de caixa da clínica, recebimentos e despesas operacionais
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Entradas */}
        <div className="p-5 rounded-3xl bg-white border border-[#EFE5E0] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9B8983]">
              Receitas do Mês
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium text-emerald-700">R$</span>
            <span className="text-2xl sm:text-3xl font-bold text-[#423533] tabular-nums">
              {totalReceitas.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-emerald-800 font-medium mt-2">
            Entradas de atendimentos e vendas
          </p>
        </div>

        {/* Saídas */}
        <div className="p-5 rounded-3xl bg-white border border-[#EFE5E0] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9B8983]">
              Despesas & Custos
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium text-rose-700">R$</span>
            <span className="text-2xl sm:text-3xl font-bold text-[#423533] tabular-nums">
              {totalDespesas.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-rose-800 font-medium mt-2">
            Insumos, produtos e manutenção
          </p>
        </div>

        {/* Saldo Líquido */}
        <div className="p-5 rounded-3xl bg-white border border-[#EFE5E0] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9B8983]">
              Saldo Líquido
            </span>
            <div className="p-2 rounded-xl bg-[#FAF5F2] text-[#9E4B52]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium text-[#9E4B52]">R$</span>
            <span className="text-2xl sm:text-3xl font-bold text-[#423533] tabular-nums">
              {saldoLiquido.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-[#7E6963] font-medium mt-2">
            Resultado financeiro atual
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-[#EFE5E0] shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F4EBE6]">
          <h3 className="text-sm font-bold text-[#423533]">Últimas Movimentações</h3>
        </div>

        <div className="divide-y divide-[#F7EFEA]">
          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-semibold text-[#423533]">Nenhuma movimentação financeira registrada.</p>
              <p className="text-xs text-[#8C7B76] mt-1">Registre entradas de procedimentos ou despesas operacionais.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Lançamento</span>
              </button>
            </div>
          ) : (
            transactions.map((tx) => {
            const isReceita = tx.type === 'receita';
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 sm:px-6 hover:bg-[#FAF6F4] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`p-2.5 rounded-2xl ${
                      isReceita
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {isReceita ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#423533]">{tx.description}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-[#8C7B76]">
                      <span>{tx.category}</span>
                      <span>·</span>
                      <span>{tx.paymentMethod}</span>
                      <span>·</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      isReceita ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {isReceita ? '+ ' : '- '}R$ {tx.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          }))}
        </div>
      </div>

      {/* Modal Novo Lançamento */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#EFE5E0] p-6 space-y-4">
            <h3 className="text-base font-bold text-[#423533]">Novo Lançamento Financeiro</h3>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="flex p-1 rounded-xl bg-[#F6EDE9] border border-[#EFE5E0]">
                <button
                  type="button"
                  onClick={() => setType('receita')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    type === 'receita'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-[#8C7B76]'
                  }`}
                >
                  Receita / Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setType('despesa')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    type === 'despesa'
                      ? 'bg-white text-rose-700 shadow-2xs'
                      : 'text-[#8C7B76]'
                  }`}
                >
                  Despesa / Saída
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#544643] mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Limpeza de Pele - Paciente X"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#544643] mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#544643] mb-1">
                    Pagamento
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533] bg-white"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F4EBE6]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#7E6963] hover:text-[#423533]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs font-semibold rounded-xl"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
