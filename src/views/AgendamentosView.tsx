import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  Archive,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Check,
  Ban,
  CalendarDays,
  MessageCircle,
  X,
} from 'lucide-react';
import { Appointment, Client, ServiceItem } from '../types';
import {
  getAppointmentMonthKey,
  getCurrentMonthKey,
  formatMonthKeyToLabel,
} from '../utils/monthArchive';
import { PostCareWhatsAppModal } from '../components/PostCareWhatsAppModal';

interface AgendamentosViewProps {
  appointments: Appointment[];
  clients: Client[];
  services: ServiceItem[];
  onOpenNewAppointment: () => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  onDeleteAppointment: (id: string) => void;
  onUpdateClientPhone?: (clientId: string, phone: string) => void;
  onUpdateServicePostCare?: (serviceId: string, postCare: string, imageUrl?: string) => void;
}

export const AgendamentosView: React.FC<AgendamentosViewProps> = ({
  appointments,
  clients,
  services,
  onOpenNewAppointment,
  onUpdateStatus,
  onDeleteAppointment,
  onUpdateClientPhone,
  onUpdateServicePostCare,
}) => {
  const currentMonthKey = getCurrentMonthKey();

  // State: selected month filter ('currentMonthKey', 'all', or specific 'YYYY-MM')
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
  // State: status tab filter
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // State for Post-care WhatsApp modal
  const [postCareAppointment, setPostCareAppointment] = useState<Appointment | null>(null);
  const [isPostCareModalOpen, setIsPostCareModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

  // Compute available months dynamically from appointments list + current month
  const availableMonths = useMemo(() => {
    const monthKeysSet = new Set<string>();
    monthKeysSet.add(currentMonthKey);

    appointments.forEach((apt) => {
      const key = getAppointmentMonthKey(apt.date);
      if (key) {
        monthKeysSet.add(key);
      }
    });

    const sorted = Array.from(monthKeysSet).sort((a, b) => b.localeCompare(a));

    return sorted.map((key) => {
      const isCurrent = key === currentMonthKey;
      const isPast = key < currentMonthKey;
      const count = appointments.filter((apt) => getAppointmentMonthKey(apt.date) === key).length;
      return {
        key,
        label: formatMonthKeyToLabel(key),
        isCurrent,
        isPast,
        count,
      };
    });
  }, [appointments, currentMonthKey]);

  // 1. Filter by selected Month first
  const monthAppointments = useMemo(() => {
    if (selectedMonth === 'all') {
      return appointments;
    }
    return appointments.filter((apt) => getAppointmentMonthKey(apt.date) === selectedMonth);
  }, [appointments, selectedMonth]);

  // 2. Filter by status second
  const filtered = useMemo(() => {
    return monthAppointments.filter((apt) => {
      if (filterStatus === 'todos') return true;
      return apt.status === filterStatus;
    });
  }, [monthAppointments, filterStatus]);

  // CRITICAL RULE: Cancelled appointments are NEVER counted in the "Total Previsto"
  const totalPrevisto = useMemo(() => {
    return filtered
      .filter((apt) => apt.status !== 'cancelado')
      .reduce((acc, curr) => acc + curr.price, 0);
  }, [filtered]);

  const canceledCount = useMemo(() => {
    return filtered.filter((apt) => apt.status === 'cancelado').length;
  }, [filtered]);

  const isViewingArchivedMonth = selectedMonth !== 'all' && selectedMonth < currentMonthKey;

  // When marking an appointment as concluded, open the WhatsApp post-care modal directly!
  const handleMarkConcluido = (apt: Appointment) => {
    onUpdateStatus(apt.id, 'concluido');
    setPostCareAppointment(apt);
    setIsPostCareModalOpen(true);
  };

  const handleOpenPostCareModal = (apt: Appointment) => {
    setPostCareAppointment(apt);
    setIsPostCareModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#EFE5E0] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#423533]">Agenda de Atendimentos</h2>
            {isViewingArchivedMonth && (
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                <Archive className="w-3 h-3" />
                Mês Arquivado
              </span>
            )}
          </div>
          <p className="text-xs text-[#8C7B76]">
            Gerenciamento de horários, confirmações e pós-atendimento via WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Total Previsto (Cancelados NÃO são somados) */}
          <div className="text-right pr-3 border-r border-[#EFE5E0]">
            <span className="text-[11px] text-[#A3928B] uppercase font-semibold">
              Total previsto
            </span>
            <p className="text-sm sm:text-base font-bold text-[#423533] tabular-nums">
              R$ {totalPrevisto.toFixed(2)}
            </p>
            {canceledCount > 0 && (
              <span className="text-[10px] text-rose-600 font-medium block">
                {canceledCount} {canceledCount === 1 ? 'cancelado' : 'cancelados'} (não somados)
              </span>
            )}
          </div>

          <button
            onClick={onOpenNewAppointment}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Month Selector Bar & Archiving Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 bg-white rounded-3xl border border-[#EFE5E0] shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#8C7B76] font-semibold pl-1 pr-2">
            <CalendarDays className="w-4 h-4 text-[#9E4B52]" />
            <span>Período:</span>
          </div>

          {/* Quick Month Selector Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {availableMonths.map((m) => {
              const isSelected = selectedMonth === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSelectedMonth(m.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#9E4B52] text-white shadow-2xs'
                      : m.isCurrent
                      ? 'bg-[#FDF2F2] text-[#9E4B52] hover:bg-[#F5D8DB] border border-[#F5D8DB]'
                      : 'bg-[#FAF5F2] text-[#675753] hover:bg-[#F2E8E4] border border-[#EFE5E0]'
                  }`}
                >
                  {m.isPast && <Archive className="w-3 h-3 opacity-70" />}
                  <span>{m.isCurrent ? `Mês Atual (${m.label.split(' ')[0]})` : m.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-black/5 text-[#8C7B76]'
                    }`}
                  >
                    {m.count}
                  </span>
                </button>
              );
            })}

            {/* "Todos os Meses" option */}
            <button
              type="button"
              onClick={() => setSelectedMonth('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedMonth === 'all'
                  ? 'bg-[#423533] text-white shadow-2xs'
                  : 'bg-stone-100 text-[#7E6963] hover:bg-stone-200'
              }`}
            >
              Todos os Meses ({appointments.length})
            </button>
          </div>
        </div>

        {/* Quick Month Dropdown if there are many months */}
        {availableMonths.length > 3 && (
          <div className="relative shrink-0">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-semibold py-1.5 pl-3 pr-8 rounded-xl border border-[#E4D7D2] bg-white text-[#423533] focus:border-[#9E4B52] outline-hidden cursor-pointer"
            >
              <option value={currentMonthKey}>Mês Atual ({formatMonthKeyToLabel(currentMonthKey)})</option>
              <optgroup label="Meses Anteriores Arquivados">
                {availableMonths
                  .filter((m) => m.isPast)
                  .map((m) => (
                    <option key={m.key} value={m.key}>
                      📦 {m.label} ({m.count} atendimentos)
                    </option>
                  ))}
              </optgroup>
              <option value="all">Ver Todo o Histórico</option>
            </select>
          </div>
        )}
      </div>

      {/* Archive Notification Banner (shown when looking at previous month) */}
      {isViewingArchivedMonth && (
        <div className="flex items-center justify-between p-3.5 sm:px-5 rounded-2xl bg-gradient-to-r from-amber-50 to-[#FAF5F2] border border-amber-200 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Archive className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold">Arquivo Histórico:</span> Você está visualizando os atendimentos arquivados de{' '}
              <strong>{formatMonthKeyToLabel(selectedMonth)}</strong>.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedMonth(currentMonthKey)}
            className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-300 font-semibold transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Voltar ao Mês Atual</span>
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-[#EFE5E0] shadow-2xs overflow-x-auto">
        {[
          { id: 'todos', label: 'Todos os Horários', count: monthAppointments.length },
          {
            id: 'confirmado',
            label: 'Confirmados',
            count: monthAppointments.filter((a) => a.status === 'confirmado').length,
          },
          {
            id: 'concluido',
            label: 'Concluídos',
            count: monthAppointments.filter((a) => a.status === 'concluido').length,
          },
          {
            id: 'cancelado',
            label: 'Cancelados',
            count: monthAppointments.filter((a) => a.status === 'cancelado').length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterStatus === tab.id
                ? 'bg-[#FDF2F2] text-[#9E4B52] border border-[#F5D8DB]'
                : 'text-[#7E6963] hover:text-[#423533] hover:bg-[#FAF5F2]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterStatus === tab.id
                  ? 'bg-[#F5D8DB] text-[#9E4B52]'
                  : 'bg-stone-100 text-stone-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-3xl border border-[#EFE5E0] shadow-2xs overflow-hidden">
        {appointments.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-[#423533]">Nenhum agendamento registrado ainda.</p>
            <p className="text-xs text-[#8C7B76] mt-1">Marque o primeiro atendimento para preencher a agenda.</p>
            <button
              onClick={onOpenNewAppointment}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-[#8C7B76]">
              Nenhum agendamento encontrado para este filtro{' '}
              {selectedMonth !== 'all' ? `em ${formatMonthKeyToLabel(selectedMonth)}` : ''}.
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              {filterStatus !== 'todos' && (
                <button
                  onClick={() => setFilterStatus('todos')}
                  className="text-xs font-semibold text-[#9E4B52] hover:underline cursor-pointer"
                >
                  Ver todos os status
                </button>
              )}
              {selectedMonth !== currentMonthKey && (
                <button
                  onClick={() => setSelectedMonth(currentMonthKey)}
                  className="text-xs font-semibold text-[#7E6963] hover:underline cursor-pointer ml-3"
                >
                  Voltar ao Mês Atual
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#F7EFEA]">
            {filtered.map((apt) => {
              const isCancelado = apt.status === 'cancelado';
              const isConcluido = apt.status === 'concluido';
              const isConfirmado = apt.status === 'confirmado';

              return (
                <div
                  key={apt.id}
                  className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 transition-colors gap-4 ${
                    isCancelado
                      ? 'bg-rose-50/25 hover:bg-rose-50/40 opacity-80'
                      : 'hover:bg-[#FAF6F4]'
                  }`}
                >
                  {/* Time & Client Info */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex flex-col items-center justify-center w-16 py-2 px-2 rounded-2xl border shrink-0 text-center ${
                        isCancelado
                          ? 'bg-rose-50/60 border-rose-200'
                          : 'bg-[#FAF5F2] border-[#EFE5E0]'
                      }`}
                    >
                      <span className="text-[10px] text-[#9B8983] uppercase font-semibold">
                        {apt.date}
                      </span>
                      <span
                        className={`text-sm font-bold tabular-nums mt-0.5 ${
                          isCancelado ? 'line-through text-[#8C7B76]' : 'text-[#423533]'
                        }`}
                      >
                        {apt.time}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-[#423533]">{apt.clientName}</h3>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            isConcluido
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isConfirmado
                              ? 'bg-sky-50 text-sky-800 border border-sky-200'
                              : isCancelado
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 font-bold'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isConcluido
                            ? 'Concluído'
                            : isConfirmado
                            ? 'Confirmado'
                            : isCancelado
                            ? 'Cancelado'
                            : 'Agendado'}
                        </span>
                      </div>

                      <p className="text-xs text-[#7E6963] mt-0.5 font-medium">
                        {apt.serviceName} · {apt.durationMinutes} minutos
                      </p>

                      {apt.notes && (
                        <p className="text-[11px] text-[#A3928B] mt-1 italic">
                          Observação: {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Zone: Price, Status Selector & WhatsApp Post-care Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-3 sm:gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#F7EFEA]">
                    {/* Price with strikethrough when canceled */}
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-[#A3928B] uppercase font-semibold block">
                        Valor
                      </span>
                      {isCancelado ? (
                        <div>
                          <span className="text-xs line-through text-stone-400 tabular-nums">
                            R$ {apt.price.toFixed(2)}
                          </span>
                          <span className="text-xs font-bold text-rose-600 block tabular-nums">
                            R$ 0,00 (Cancelado)
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-[#423533] tabular-nums">
                          R$ {apt.price.toFixed(2)}
                        </p>
                      )}
                    </div>

                    {/* Interactive Status Selector Bar/Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-[#FAF5F2] rounded-2xl border border-[#EFE5E0] shadow-2xs">
                      {/* Confirmado */}
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(apt.id, 'confirmado')}
                        title="Marcar como Confirmado"
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isConfirmado
                            ? 'bg-sky-600 text-white shadow-2xs'
                            : 'text-[#675753] hover:text-sky-800 hover:bg-sky-50'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirmado</span>
                      </button>

                      {/* Concluído (Triggers status change + opens WhatsApp post-care modal) */}
                      <button
                        type="button"
                        onClick={() => handleMarkConcluido(apt)}
                        title="Marcar como Concluído e Enviar Pós-Procedimento no WhatsApp"
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isConcluido
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-[#675753] hover:text-emerald-800 hover:bg-emerald-50'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Concluído</span>
                      </button>

                      {/* Cancelado */}
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(apt.id, 'cancelado')}
                        title="Marcar como Cancelado (Não soma no total previsto)"
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isCancelado
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'text-[#675753] hover:text-rose-800 hover:bg-rose-50'
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancelado</span>
                      </button>
                    </div>

                    {/* Dedicated WhatsApp Post-Care Trigger Button + Discreet Delete X */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPostCareModal(apt)}
                        title="Enviar orientações de pós-procedimento direto no WhatsApp da cliente"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                          isConcluido
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="whitespace-nowrap">Pós no WhatsApp</span>
                      </button>

                      {/* Discreet Delete Button (only an X) */}
                      <button
                        type="button"
                        onClick={() => setAppointmentToDelete(apt)}
                        title="Excluir atendimento"
                        aria-label="Excluir atendimento"
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Post-Care WhatsApp Modal */}
      {isPostCareModalOpen && postCareAppointment && (
        <PostCareWhatsAppModal
          isOpen={isPostCareModalOpen}
          onClose={() => {
            setIsPostCareModalOpen(false);
            setPostCareAppointment(null);
          }}
          appointment={postCareAppointment}
          client={clients.find(
            (c) =>
              (postCareAppointment.clientId && c.id === postCareAppointment.clientId) ||
              c.name.toLowerCase() === postCareAppointment.clientName.toLowerCase()
          )}
          service={services.find(
            (s) => s.name.trim().toLowerCase() === postCareAppointment.serviceName.trim().toLowerCase()
          )}
          onUpdateClientPhone={onUpdateClientPhone}
          onUpdateServicePostCare={onUpdateServicePostCare}
        />
      )}

      {/* Delete Appointment Confirmation Modal */}
      {appointmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-[#EFE5E0] text-center space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <X className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#423533]">Excluir Atendimento?</h3>
              <p className="text-xs text-[#8C7B76] mt-1.5 leading-relaxed">
                Deseja excluir permanentemente o atendimento de{' '}
                <strong className="text-[#423533]">{appointmentToDelete.clientName}</strong> (
                {appointmentToDelete.date} às {appointmentToDelete.time})?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAppointmentToDelete(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-[#7E6963] hover:bg-[#FAF5F2] rounded-xl border border-[#EFE5E0] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteAppointment(appointmentToDelete.id);
                  setAppointmentToDelete(null);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
