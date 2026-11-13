import React, { useMemo, useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  FileText,
  History,
  DollarSign,
} from 'lucide-react';
import { Appointment, Client } from '../types';
import { parseAppointmentDate } from '../utils/monthArchive';

interface ClientHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  appointments: Appointment[];
}

export const ClientHistoryModal: React.FC<ClientHistoryModalProps> = ({
  isOpen,
  onClose,
  client,
  appointments,
}) => {
  const [statusFilter, setStatusFilter] = useState<'todos' | 'concluido' | 'ativos' | 'cancelado'>('todos');

  const clientAppointments = useMemo(() => {
    if (!client) return [];
    const normalizedClientName = client.name.trim().toLowerCase();

    return appointments
      .filter((apt) => {
        if (apt.clientId && apt.clientId === client.id) return true;
        return apt.clientName.trim().toLowerCase() === normalizedClientName;
      })
      .sort((a, b) => {
        const dateA = parseAppointmentDate(a.date).getTime();
        const dateB = parseAppointmentDate(b.date).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return (b.time || '').localeCompare(a.time || '');
      });
  }, [client, appointments]);

  const filteredAppointments = useMemo(() => {
    return clientAppointments.filter((apt) => {
      if (statusFilter === 'todos') return true;
      if (statusFilter === 'concluido') return apt.status === 'concluido';
      if (statusFilter === 'cancelado') return apt.status === 'cancelado';
      return apt.status === 'confirmado' || apt.status === 'agendado';
    });
  }, [clientAppointments, statusFilter]);

  const stats = useMemo(() => {
    const valid = clientAppointments.filter((a) => a.status !== 'cancelado');
    const concluded = clientAppointments.filter((a) => a.status === 'concluido');
    const totalInvested = valid.reduce((sum, a) => sum + (a.price || 0), 0);

    return {
      totalValid: valid.length,
      totalConcluded: concluded.length,
      totalInvested,
    };
  }, [clientAppointments]);

  // Keep early return after hooks for React 19 safety
  if (!isOpen || !client) return null;

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'concluido':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Concluído
          </span>
        );
      case 'confirmado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FDF2F2] text-[#9E4B52] border border-[#F5D8DB]">
            <Clock className="w-3 h-3" />
            Confirmado
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-500 border border-stone-200">
            <XCircle className="w-3 h-3" />
            Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            Agendado
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-[#EFE5E0] overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-[#FDF5F3] to-white border-b border-[#F4EBE6] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F5D8DB] text-[#9E4B52] shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-[#423533] truncate">{client.name}</h3>
                {client.skinType && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF4F2] text-[#9E4B52] border border-[#F5D8DB]">
                    Pele {client.skinType}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8C7B76] mt-0.5">
                Histórico completo de atendimentos e procedimentos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary KPIs */}
        <div className="px-6 py-4 bg-[#FCF9F7] border-b border-[#F4EBE6] grid grid-cols-3 gap-3 shrink-0">
          <div className="p-3 rounded-2xl bg-white border border-[#EFE5E0]">
            <p className="text-[11px] font-medium text-[#8C7B76]">Atendimentos</p>
            <p className="text-lg font-bold text-[#423533] mt-0.5">
              {stats.totalValid}
              <span className="text-[11px] font-normal text-[#8C7B76] ml-1">
                ({stats.totalConcluded} concluídos)
              </span>
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#EFE5E0]">
            <p className="text-[11px] font-medium text-[#8C7B76]">Total Investido</p>
            <p className="text-lg font-bold text-[#9E4B52] mt-0.5">
              R$ {stats.totalInvested.toFixed(2).replace('.', ',')}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#EFE5E0]">
            <p className="text-[11px] font-medium text-[#8C7B76]">Último Registro</p>
            <p className="text-sm font-bold text-[#423533] mt-1 truncate">
              {clientAppointments[0]?.date || client.lastVisit || 'Sem visitas'}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        {clientAppointments.length > 0 && (
          <div className="px-6 pt-4 pb-2 flex items-center gap-1.5 flex-wrap shrink-0">
            {[
              { id: 'todos', label: `Todos (${clientAppointments.length})` },
              { id: 'concluido', label: 'Concluídos' },
              { id: 'ativos', label: 'Agendados / Confirmados' },
              { id: 'cancelado', label: 'Cancelados' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-[#FDF2F2] text-[#9E4B52] border border-[#F5D8DB]'
                    : 'bg-[#FAF5F2] text-[#7E6963] border border-transparent hover:text-[#423533]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* History Timeline List */}
        <div className="p-6 pt-3 overflow-y-auto flex-1 space-y-3">
          {clientAppointments.length === 0 ? (
            <div className="py-12 text-center bg-[#FAF6F4] rounded-2xl border border-[#EFE5E0]">
              <Calendar className="w-8 h-8 text-[#C5A5A2] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#423533]">
                Nenhum atendimento registrado ainda
              </p>
              <p className="text-xs text-[#8C7B76] mt-1 max-w-xs mx-auto">
                Os procedimentos agendados ou concluídos para {client.name} aparecerão aqui automaticamente.
              </p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="py-10 text-center bg-[#FAF6F4] rounded-2xl border border-[#EFE5E0]">
              <p className="text-xs text-[#8C7B76]">
                Nenhum atendimento encontrado com este filtro.
              </p>
            </div>
          ) : (
            filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className={`p-4 rounded-2xl border transition-all ${
                  apt.status === 'cancelado'
                    ? 'bg-stone-50/70 border-stone-200 opacity-75'
                    : 'bg-white border-[#EFE5E0] hover:border-[#E4D5CE] shadow-2xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Sparkles className="w-3.5 h-3.5 text-[#9E4B52] shrink-0" />
                      <h4
                        className={`text-sm font-bold ${
                          apt.status === 'cancelado'
                            ? 'line-through text-stone-500'
                            : 'text-[#423533]'
                        }`}
                      >
                        {apt.serviceName}
                      </h4>
                      {getStatusBadge(apt.status)}
                    </div>

                    <div className="flex items-center gap-4 mt-1.5 text-xs text-[#8C7B76] flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#9E4B52]" />
                        {apt.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {apt.time} ({apt.durationMinutes} min)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-bold ${
                        apt.status === 'cancelado'
                          ? 'line-through text-stone-400'
                          : 'text-[#423533]'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5 text-[#9E4B52]" />
                      R$ {apt.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {apt.notes && (
                  <div className="mt-2.5 pt-2.5 border-t border-[#F7EFEA] flex items-start gap-1.5 text-xs text-[#675753]">
                    <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{apt.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#FCF9F7] border-t border-[#F4EBE6] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#7E6963] hover:text-[#423533] hover:bg-[#FAF0EC] rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
