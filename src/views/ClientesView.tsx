import React, { useState } from 'react';
import { Search, Plus, Phone, Mail, AlertTriangle, FileText, Sparkles, Filter } from 'lucide-react';
import { Client } from '../types';

interface ClientesViewProps {
  clients: Client[];
  onOpenNewClient: () => void;
}

export const ClientesView: React.FC<ClientesViewProps> = ({
  clients,
  onOpenNewClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkinType, setSelectedSkinType] = useState<string>('todos');

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()));

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
            Histórico cutâneo, queixas principais e contatos rápidos
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

      {/* Filter and Search Bar */}
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

      {/* Client List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-[#EFE5E0]">
            <p className="text-sm font-semibold text-[#423533]">Nenhuma cliente cadastrada ainda.</p>
            <p className="text-xs text-[#8C7B76] mt-1">Cadastre as fichas de avaliação facial para iniciar.</p>
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
            <p className="text-sm text-[#8C7B76]">Nenhuma cliente encontrada para essa busca.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSkinType('todos');
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
              className="flex flex-col justify-between p-5 rounded-3xl bg-white border border-[#EFE5E0] shadow-2xs hover:shadow-sm hover:border-[#E8DDD7] transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#423533]">{client.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#8C7B76]">
                      <Phone className="w-3.5 h-3.5 text-[#9E4B52]" />
                      <span>{client.phone}</span>
                    </div>
                  </div>

                  {client.skinType && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAF4F2] text-[#9E4B52] border border-[#F5D8DB]">
                      Pele {client.skinType}
                    </span>
                  )}
                </div>

                {/* Email if available */}
                {client.email && (
                  <div className="flex items-center gap-2 mb-3 text-xs text-[#8C7B76]">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}

                {/* Allergies and Warnings */}
                <div className="p-3 mb-3 rounded-2xl bg-[#FFF8F8] border border-[#FDE8E8]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
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
              <div className="pt-4 mt-4 border-t border-[#F7EFEA] flex items-center justify-between text-[11px] text-[#A3928B]">
                <span>Última visita: {client.lastVisit || 'Recente'}</span>
                <span className="font-medium text-[#9E4B52]">Ficha ativa</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
