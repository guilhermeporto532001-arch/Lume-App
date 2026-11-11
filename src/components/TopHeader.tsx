import React from 'react';
import { Menu, Plus, Sparkles, User as UserIcon } from 'lucide-react';
import { TabType } from '../types';
import { useAuth } from '../context/AuthContext';

interface TopHeaderProps {
  activeTab: TabType;
  onOpenSidebar: () => void;
  onNewAppointment: () => void;
  onOpenAuth: () => void;
}

const tabTitles: Record<TabType, { title: string; subtitle: string }> = {
  home: { title: 'Visão Geral', subtitle: 'Painel diário da clínica e procedimentos' },
  clientes: { title: 'Fichas de Clientes', subtitle: 'Histórico facial, tipos de pele e contatos' },
  agendamentos: { title: 'Agenda de Atendimentos', subtitle: 'Controle de horários e confirmações' },
  financeiro: { title: 'Fluxo Financeiro', subtitle: 'Receitas, despesas e faturamento' },
  produtos: { title: 'Controle de Produtos', subtitle: 'Dermocosméticos de cabine e home care' },
  servicos: { title: 'Catálogo de Procedimentos', subtitle: 'Protocolos faciais, valores e durações' },
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenSidebar,
  onNewAppointment,
  onOpenAuth,
}) => {
  const { user, isGuest } = useAuth();
  const currentInfo = tabTitles[activeTab];

  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/90 backdrop-blur-md border-b border-[#EFE5E0]">
      {/* Left zone: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 lg:hidden"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs text-[#9B8983]">
            <span className="font-semibold text-[#544643]">Lume</span>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-[#7E6963] capitalize">{activeTab}</span>
          </div>
          <h2 className="text-sm md:text-base font-bold text-[#423533] leading-tight">
            {currentInfo.title}
          </h2>
        </div>
      </div>

      {/* Right zone: Date & Action buttons */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Date badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F2] border border-[#EFE5E0] text-xs text-[#7E6963] font-medium capitalize">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9E4B52]" />
          <span>{todayFormatted}</span>
        </div>

        {/* User auth state button */}
        {!user ? (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-[#9E4B52] bg-[#FDF2F2] hover:bg-[#FBE5E7] transition-colors border border-[#F5D8DB]"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">
              {isGuest ? 'Conectar Conta' : 'Fazer Login'}
            </span>
          </button>
        ) : (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF4F2] text-xs text-[#7E6963]">
            <Sparkles className="w-3.5 h-3.5 text-[#9E4B52]" />
            <span className="font-medium truncate max-w-[120px]">
              {user.displayName || user.email?.split('@')[0]}
            </span>
          </div>
        )}

        {/* Primary CTA: Novo Agendamento */}
        <button
          onClick={onNewAppointment}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-[#9E4B52] hover:bg-[#883B41] rounded-xl transition-all shadow-xs hover:shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="whitespace-nowrap">Novo Agendamento</span>
        </button>
      </div>
    </header>
  );
};
