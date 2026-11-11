import React from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Users,
  Wallet,
  AlertCircle,
  Plus,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Appointment, Client, ServiceItem, ProductItem, TabType } from '../types';
import studioBannerImg from '../assets/images/studio_ambiance_1794335608983.jpg';

interface HomeViewProps {
  appointments: Appointment[];
  clients: Client[];
  services: ServiceItem[];
  products: ProductItem[];
  onOpenNewAppointment: () => void;
  onOpenNewClient: () => void;
  onNavigate: (tab: TabType) => void;
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  appointments,
  clients,
  services,
  products,
  onOpenNewAppointment,
  onOpenNewClient,
  onNavigate,
  onUpdateAppointmentStatus,
}) => {
  // Metrics calculation (Canceled appointments are excluded from expected revenue)
  const totalRevenueExpected = appointments
    .filter((a) => a.status !== 'cancelado')
    .reduce((acc, curr) => acc + curr.price, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmado' || a.status === 'concluido').length;

  return (
    <div className="space-y-6">
      {/* Visual Ambiance Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#EFE5E0] bg-white shadow-2xs">
        <div className="relative grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[220px]">
          {/* Text & Quick Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 z-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF2F2] border border-[#F5D8DB] text-xs font-semibold text-[#9E4B52]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Estúdio de Estética Facial
                </span>
                <span className="text-xs text-[#A3928B]">·</span>
                <span className="text-xs text-[#8C7B76]">Gestão Inteligente</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#423533] tracking-tight leading-snug">
                Sua clínica organizada com harmonia e elegância
              </h1>
              <p className="mt-2 text-sm text-[#7E6963] max-w-xl leading-relaxed">
                Acompanhe os atendimentos de hoje, controle fichas de anamnese facial,
                produtos de cabine e fluxo de faturamento em um só lugar.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-5 mt-4 border-t border-[#F7EFEA]">
              <button
                onClick={onOpenNewAppointment}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Agendar Procedimento</span>
              </button>
              <button
                onClick={onOpenNewClient}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#FAF5F2] hover:bg-[#F3EBE6] text-[#544643] text-xs sm:text-sm font-semibold rounded-xl border border-[#E8DDD7] transition-colors"
              >
                <Users className="w-4 h-4 text-[#9E4B52]" />
                <span>Cadastrar Cliente</span>
              </button>
            </div>
          </div>

          {/* Luxury Studio Atmosphere Image */}
          <div className="lg:col-span-5 relative min-h-[180px] lg:min-h-full">
            <img
              src={studioBannerImg}
              alt="Ambiente Estúdio Facial"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white via-transparent to-transparent opacity-80 lg:opacity-40" />
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-white/85 backdrop-blur-md text-[11px] font-medium text-[#7E6963] shadow-2xs border border-white/60">
              Cabine de Tratamento
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Atendimentos Hoje */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE5E0] shadow-2xs hover:border-[#E8DDD7] transition-all">
          <div className="flex items-center justify-between text-[#9B8983] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Agenda de Hoje</span>
            <div className="p-2 rounded-xl bg-[#FDF2F2] text-[#9E4B52]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#423533] tabular-nums">
              {appointments.length}
            </span>
            <span className="text-xs text-[#8C7B76]">
              ({confirmedCount} confirmados)
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#F7EFEA] flex items-center justify-between text-xs text-[#7E6963]">
            <span>Visualizar agenda</span>
            <button
              onClick={() => onNavigate('agendamentos')}
              className="font-medium text-[#9E4B52] hover:underline"
            >
              Abrir
            </button>
          </div>
        </div>

        {/* Faturamento Previsto */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE5E0] shadow-2xs hover:border-[#E8DDD7] transition-all">
          <div className="flex items-center justify-between text-[#9B8983] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Previsto Hoje</span>
            <div className="p-2 rounded-xl bg-[#F6F5E9] text-[#8C7D38]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium text-[#8C7D38]">R$</span>
            <span className="text-2xl sm:text-3xl font-bold text-[#423533] tabular-nums">
              {totalRevenueExpected.toFixed(2)}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#F7EFEA] flex items-center justify-between text-xs text-[#7E6963]">
            <span>Ticket médio: R$ {(totalRevenueExpected / (appointments.length || 1)).toFixed(0)}</span>
            <button
              onClick={() => onNavigate('financeiro')}
              className="font-medium text-[#9E4B52] hover:underline"
            >
              Extrato
            </button>
          </div>
        </div>

        {/* Clientes Ativas */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE5E0] shadow-2xs hover:border-[#E8DDD7] transition-all">
          <div className="flex items-center justify-between text-[#9B8983] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Clientes Ativas</span>
            <div className="p-2 rounded-xl bg-[#F4EBF7] text-[#7A4B9E]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#423533] tabular-nums">
              {clients.length}
            </span>
            <span className="text-xs text-[#8C7B76]">fichas cadastradas</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#F7EFEA] flex items-center justify-between text-xs text-[#7E6963]">
            <span>Anamnese em dia</span>
            <button
              onClick={() => onNavigate('clientes')}
              className="font-medium text-[#9E4B52] hover:underline"
            >
              Ver todas
            </button>
          </div>
        </div>

        {/* Produtos / Estoque */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE5E0] shadow-2xs hover:border-[#E8DDD7] transition-all">
          <div className="flex items-center justify-between text-[#9B8983] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Estoque Cabine</span>
            <div className={`p-2 rounded-xl ${lowStockCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#423533] tabular-nums">
              {lowStockCount}
            </span>
            <span className="text-xs text-amber-800 font-medium">
              {lowStockCount > 0 ? 'produtos em alerta' : 'estoque regular'}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#F7EFEA] flex items-center justify-between text-xs text-[#7E6963]">
            <span>{products.length} itens no catálogo</span>
            <button
              onClick={() => onNavigate('produtos')}
              className="font-medium text-[#9E4B52] hover:underline"
            >
              Repor
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Agenda de Hoje + Ações & Destaques */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Agenda de Hoje (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#EFE5E0] shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F4EBE6]">
            <div>
              <h3 className="text-base font-bold text-[#423533]">Atendimentos Programados</h3>
              <p className="text-xs text-[#8C7B76]">Sessões e procedimentos faciais para hoje</p>
            </div>
            <button
              onClick={() => onNavigate('agendamentos')}
              className="flex items-center gap-1 text-xs font-semibold text-[#9E4B52] hover:underline"
            >
              <span>Ver agenda completa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#F7EFEA]">
            {appointments.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-[#8C7B76]">Nenhum agendamento para hoje ainda.</p>
                <button
                  onClick={onOpenNewAppointment}
                  className="mt-3 px-4 py-2 bg-[#9E4B52] text-white text-xs font-semibold rounded-xl"
                >
                  Agendar Primeiro Atendimento
                </button>
              </div>
            ) : (
              appointments.map((apt) => {
                const isDone = apt.status === 'concluido';
                const isConfirmed = apt.status === 'confirmado';
                const isCanceled = apt.status === 'cancelado';

                return (
                  <div
                    key={apt.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 transition-colors gap-3 ${
                      isCanceled ? 'bg-rose-50/25 opacity-75' : 'hover:bg-[#FAF6F4]'
                    }`}
                  >
                    {/* Left: Time & Client */}
                    <div className="flex items-start gap-3.5">
                      <div className="flex flex-col items-center justify-center w-14 py-1.5 px-2 rounded-xl bg-[#FAF5F2] border border-[#EFE5E0] shrink-0">
                        <Clock className="w-3.5 h-3.5 text-[#9E4B52] mb-0.5" />
                        <span className="text-xs font-bold text-[#423533] tabular-nums">
                          {apt.time}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#423533]">{apt.clientName}</h4>
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                              isDone
                                ? 'bg-emerald-50 text-emerald-800'
                                : isConfirmed
                                ? 'bg-sky-50 text-sky-800'
                                : isCanceled
                                ? 'bg-rose-100 text-rose-800 font-semibold'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {isDone
                              ? 'Concluído'
                              : isConfirmed
                              ? 'Confirmado'
                              : isCanceled
                              ? 'Cancelado'
                              : 'Agendado'}
                          </span>
                        </div>
                        <p className="text-xs text-[#7E6963] mt-0.5 font-medium">
                          {apt.serviceName}
                        </p>
                        {apt.notes && (
                          <p className="text-[11px] text-[#A3928B] mt-1 italic">
                            Obs: {apt.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Duration, Price & Status actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F7EFEA]">
                      <div className="text-left sm:text-right">
                        {isCanceled ? (
                          <div>
                            <div className="text-xs line-through text-stone-400 tabular-nums">
                              R$ {apt.price.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-rose-600 font-semibold">
                              Cancelado
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-xs font-bold text-[#423533] tabular-nums">
                              R$ {apt.price.toFixed(2)}
                            </div>
                            <div className="text-[11px] text-[#9B8983]">
                              {apt.durationMinutes} min
                            </div>
                          </>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        {apt.status !== 'concluido' && !isCanceled && (
                          <button
                            onClick={() => onUpdateAppointmentStatus(apt.id, 'concluido')}
                            title="Marcar como Concluído"
                            className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {apt.status === 'agendado' && (
                          <button
                            onClick={() => onUpdateAppointmentStatus(apt.id, 'confirmado')}
                            title="Confirmar Presença"
                            className="px-2 py-1 rounded-lg text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors"
                          >
                            Confirmar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Procedimentos Frequentes & Dicas de Cabine (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Services card */}
          <div className="p-5 rounded-3xl bg-white border border-[#EFE5E0] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#423533]">Protocolos em Alta</h3>
              <button
                onClick={() => onNavigate('servicos')}
                className="text-xs font-semibold text-[#9E4B52] hover:underline"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-2.5">
              {services.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-[#8C7B76]">Nenhum procedimento cadastrado.</p>
                  <button
                    onClick={() => onNavigate('servicos')}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#9E4B52] hover:underline"
                  >
                    <span>+ Cadastrar Procedimento</span>
                  </button>
                </div>
              ) : (
                services.slice(0, 4).map((srv) => (
                  <div
                    key={srv.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF5F2] border border-[#F4EBE6]"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-[#423533] truncate">{srv.name}</p>
                      <p className="text-[11px] text-[#8C7B76]">{srv.durationMinutes} min · {srv.category}</p>
                    </div>
                    <span className="text-xs font-bold text-[#9E4B52] tabular-nums shrink-0">
                      R$ {srv.price.toFixed(0)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tips / Care guidelines */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FDF4F2] to-[#FAF2EE] border border-[#F5D8DB]">
            <div className="flex items-center gap-2 mb-2 text-[#9E4B52]">
              <Sparkles className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Rotina & Boas Práticas
              </h4>
            </div>
            <p className="text-xs text-[#675753] leading-relaxed">
              Lembre-se de esterilizar os extratores em autoclave e conferir a validade dos
              ácidos de cabine. Mantenha as fichas de anamnese sempre atualizadas após cada sessão.
            </p>
            <div className="mt-3 pt-3 border-t border-[#F3DFE2] flex items-center justify-between text-xs text-[#7E6963]">
              <span>Próxima reposição sugerida</span>
              <span className="font-semibold text-[#9E4B52]">Sexta-feira</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
