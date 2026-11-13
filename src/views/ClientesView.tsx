import React, { useState } from 'react';
import {
  Search,
  Plus,
  Phone,
  Mail,
  AlertTriangle,
  FileText,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  Users,
  Check,
  X,
  History,
} from 'lucide-react';
import { Appointment, Client } from '../types';
import { EditClientModal } from '../components/EditClientModal';
import { ClientHistoryModal } from '../components/ClientHistoryModal';
import { parseAppointmentDate } from '../utils/monthArchive';

interface ClientesViewProps {
  clients: Client[];
  appointments: Appointment[];
  onOpenNewClient: () => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onToggleArchiveClient: (clientId: string) => void;
}

export const ClientesView: React.FC<ClientesViewProps> = ({
  clients,
  appointments,
  onOpenNewClient,
  onUpdateClient,
  onDeleteClient,
  onToggleArchiveClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkinType, setSelectedSkinType] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<'ativas' | 'arquivadas' | 'todas'>('ativas');

  // Modal states
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [historyClient, setHistoryClient] = useState<Client | null>(null);

  // Counts
  const activeCount = clients.filter((c) => !c.archived).length;
  const archivedCount = clients.filter((c) => Boolean(c.archived)).length;

  const filteredClients = clients.filter((client) => {
    // 1. Status filter (ativas / arquivadas / todas)
    if (statusFilter === 'ativas' && client.archived) return false;
    if (statusFilter === 'arquivadas' && !client.archived) return false;

    // 2. Search term
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      client.name.toLowerCase().includes(term) ||
      client.phone.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(term));

    // 3. Skin type
    const matchesSkin =
      selectedSkinType === 'todos' ||
      client.skinType?.toLowerCase() === selectedSkinType.toLowerCase();

    return matchesSearch && matchesSkin;
  });

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#EFE5E0] shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#423533]">Fichas e Anamnese de Clientes</h2>
          <p className="text-xs text-[#8C7B76]">
            Histórico cutâneo, edição rápida, arquivamento e fichas ativas
          </p>
        </div>

        <button
          onClick={onOpenNewClient}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Cliente</span>
        </button>
      </div>

      {/* Filter and Status Bar */}
      <div className="flex flex-col gap-3">
        {/* Status Tabs: Ativas vs Arquivadas vs Todas */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#EFE5E0] shadow-2xs">
            <button
              onClick={() => setStatusFilter('ativas')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === 'ativas'
                  ? 'bg-[#FDF2F2] text-[#9E4B52] border border-[#F5D8DB] shadow-2xs'
                  : 'text-[#7E6963] hover:text-[#423533] hover:bg-[#FAF5F2]'
              }`}
            >
              <span>Ativas</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  statusFilter === 'ativas'
                    ? 'bg-[#9E4B52] text-white'
                    : 'bg-[#F4EBE6] text-[#7E6963]'
                }`}
              >
                {activeCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('arquivadas')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === 'arquivadas'
                  ? 'bg-[#FDF2F2] text-[#9E4B52] border border-[#F5D8DB] shadow-2xs'
                  : 'text-[#7E6963] hover:text-[#423533] hover:bg-[#FAF5F2]'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Arquivadas</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  statusFilter === 'arquivadas'
                    ? 'bg-[#9E4B52] text-white'
                    : 'bg-[#F4EBE6] text-[#7E6963]'
                }`}
              >
                {archivedCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('todas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === 'todas'
                  ? 'bg-[#FDF2F2] text-[#9E4B52] border border-[#F5D8DB] shadow-2xs'
                  : 'text-[#7E6963] hover:text-[#423533] hover:bg-[#FAF5F2]'
              }`}
            >
              Todas ({clients.length})
            </button>
          </div>
        </div>

        {/* Search and Skin filters */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, telefone ou e-mail..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-[#EFE5E0] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-sm text-[#423533] placeholder:text-stone-400 shadow-2xs"
            />
          </div>

          {/* Skin type filter tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#EFE5E0] shadow-2xs overflow-x-auto">
            {['todos', 'Mista', 'Oleosa', 'Seca', 'Sensível', 'Normal'].map((skin) => (
              <button
                key={skin}
                onClick={() => setSelectedSkinType(skin)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSkinType === skin
                    ? 'bg-[#FDF2F2] text-[#9E4B52] border border-[#F5D8DB]'
                    : 'text-[#7E6963] hover:text-[#423533] hover:bg-[#FAF5F2]'
                }`}
              >
                {skin === 'todos' ? 'Todos os Tipos' : skin}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Client List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-[#EFE5E0]">
            <p className="text-sm font-semibold text-[#423533]">Nenhuma cliente cadastrada ainda.</p>
            <p className="text-xs text-[#8C7B76] mt-1">
              Cadastre as fichas de avaliação facial para iniciar.
            </p>
            <button
              onClick={onOpenNewClient}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeira Cliente</span>
            </button>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-[#EFE5E0]">
            <p className="text-sm text-[#8C7B76]">
              {statusFilter === 'arquivadas'
                ? 'Nenhuma cliente arquivada encontrada.'
                : 'Nenhuma cliente encontrada para essa busca.'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSkinType('todos');
                setStatusFilter('ativas');
              }}
              className="mt-3 text-xs font-semibold text-[#9E4B52] hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          filteredClients.map((client) => (
            <div
              key={client.id}
              className={`flex flex-col justify-between p-5 rounded-3xl bg-white border transition-all ${
                client.archived
                  ? 'border-stone-200 opacity-85 bg-stone-50/40'
                  : 'border-[#EFE5E0] shadow-2xs hover:shadow-sm hover:border-[#E8DDD7]'
              }`}
            >
              <div>
                {/* Header with Title, Skin badge & Discreet Actions */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#423533] truncate">{client.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#8C7B76]">
                      <Phone className="w-3.5 h-3.5 text-[#9E4B52] shrink-0" />
                      <span className="truncate">{client.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {client.skinType && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAF4F2] text-[#9E4B52] border border-[#F5D8DB]">
                        Pele {client.skinType}
                      </span>
                    )}

                    {/* Discreet Action Toolbar */}
                    <div className="flex items-center gap-0.5 bg-[#FAF5F2] p-1 rounded-xl border border-[#EFE5E0]">
                      {/* 0. Histórico de Atendimentos */}
                      <button
                        type="button"
                        onClick={() => setHistoryClient(client)}
                        title="Ver histórico de atendimentos"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-[#9E4B52] hover:bg-white transition-colors"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>

                      {/* 1. Lápis discreto para editar cadastro */}
                      <button
                        type="button"
                        onClick={() => setEditingClient(client)}
                        title="Editar cadastro da cliente"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-[#9E4B52] hover:bg-white transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* 2. Arquivar / Desarquivar */}
                      <button
                        type="button"
                        onClick={() => onToggleArchiveClient(client.id)}
                        title={client.archived ? 'Desarquivar ficha da cliente' : 'Arquivar ficha da cliente'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          client.archived
                            ? 'text-amber-600 hover:text-amber-800 hover:bg-white'
                            : 'text-stone-500 hover:text-stone-800 hover:bg-white'
                        }`}
                      >
                        {client.archived ? (
                          <ArchiveRestore className="w-3.5 h-3.5" />
                        ) : (
                          <Archive className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* 3. Excluir */}
                      <button
                        type="button"
                        onClick={() => setClientToDelete(client)}
                        title="Excluir ficha permanentemente"
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email if available */}
                {client.email && (
                  <div className="flex items-center gap-2 mb-3 text-xs text-[#8C7B76]">
                    <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}

                {/* Allergies and Warnings */}
                <div className="p-3 mb-3 rounded-2xl bg-[#FFF8F8] border border-[#FDE8E8]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Alergias & Restrições</span>
                  </div>
                  <p className="text-xs text-[#675753] leading-relaxed">
                    {client.allergies || 'Nenhuma alergia relatada'}
                  </p>
                </div>

                {/* Anamnese notes */}
                <div className="text-xs text-[#7E6963] line-clamp-3">
                  <span className="font-semibold text-[#544643]">Observações: </span>
                  {client.notes}
                </div>
              </div>

              {/* Bottom footer */}
              {(() => {
                const normalizedName = client.name.trim().toLowerCase();
                const clientApts = appointments
                  .filter(
                    (apt) =>
                      (apt.clientId && apt.clientId === client.id) ||
                      apt.clientName.trim().toLowerCase() === normalizedName
                  )
                  .sort(
                    (a, b) =>
                      parseAppointmentDate(b.date).getTime() -
                      parseAppointmentDate(a.date).getTime()
                  );
                const validCount = clientApts.filter((a) => a.status !== 'cancelado').length;
                const latestDate = clientApts[0]?.date || client.lastVisit || 'Sem visitas';

                return (
                  <div className="pt-4 mt-4 border-t border-[#F7EFEA] flex items-center justify-between gap-2 text-[11px] text-[#A3928B]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate">Última visita: {latestDate}</span>
                      {client.archived && (
                        <span className="px-2 py-0.5 rounded-md font-semibold text-amber-700 bg-amber-50 border border-amber-200 shrink-0">
                          Arquivada
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setHistoryClient(client)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-[#9E4B52] bg-[#FDF2F2] hover:bg-[#FBE5E7] border border-[#F5D8DB] transition-colors shrink-0"
                    >
                      <History className="w-3 h-3" />
                      <span>Histórico ({validCount})</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          ))
        )}
      </div>

      {/* Client Appointment History Modal */}
      {historyClient && (
        <ClientHistoryModal
          isOpen={Boolean(historyClient)}
          onClose={() => setHistoryClient(null)}
          client={historyClient}
          appointments={appointments}
        />
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <EditClientModal
          isOpen={Boolean(editingClient)}
          onClose={() => setEditingClient(null)}
          client={editingClient}
          onSaveClient={(updated) => {
            onUpdateClient(updated);
            setEditingClient(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-[#EFE5E0] text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#423533]">Excluir Cliente?</h3>
              <p className="text-xs text-[#8C7B76] mt-1.5 leading-relaxed">
                Tem certeza que deseja excluir permanentemente o cadastro de{' '}
                <strong className="text-[#423533]">{clientToDelete.name}</strong>? Esta ação
                removerá a ficha da clínica.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-[#7E6963] hover:bg-[#FAF5F2] rounded-xl border border-[#EFE5E0] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteClient(clientToDelete.id);
                  setClientToDelete(null);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs"
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
