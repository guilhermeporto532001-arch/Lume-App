import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, AlertTriangle, FileText, Check, Pencil } from 'lucide-react';
import { Client } from '../types';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSaveClient: (client: Client) => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
  isOpen,
  onClose,
  client,
  onSaveClient,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [skinType, setSkinType] = useState<Client['skinType']>('Mista');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (client) {
      setName(client.name || '');
      setPhone(client.phone || '');
      setEmail(client.email || '');
      setSkinType(client.skinType || 'Mista');
      setAllergies(client.allergies || '');
      setNotes(client.notes || '');
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !name.trim()) return;

    const updated: Client = {
      ...client,
      name: name.trim(),
      phone: phone.trim() || '(Não informado)',
      email: email.trim() || undefined,
      skinType,
      allergies: allergies.trim() || 'Nenhuma alergia relatada',
      notes: notes.trim() || 'Ficha atualizada.',
      archived: client.archived,
    };

    onSaveClient(updated);
    onClose();
  };

  // Keep early return after hooks for React 19 safety
  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[#EFE5E0] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-[#FDF5F3] to-white border-b border-[#F4EBE6]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#F5D8DB] text-[#9E4B52]">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#423533]">Editar Cadastro da Cliente</h3>
              <p className="text-xs text-[#8C7B76]">Atualize dados cadastrais e ficha de pele</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-[#544643] mb-1">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Gabriela Duarte"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#544643] mb-1">
                WhatsApp / Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 90000-0000"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#544643] mb-1">
                E-mail (opcional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#544643] mb-1">
              Classificação Cutânea (Tipo de Pele)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['Mista', 'Oleosa', 'Seca', 'Sensível', 'Normal'] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setSkinType(type)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    skinType === type
                      ? 'bg-[#FDF2F2] border-[#9E4B52] text-[#9E4B52] shadow-2xs'
                      : 'border-[#EFE5E0] bg-[#FAF6F4] text-[#7E6963] hover:border-[#D5C2BB]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-rose-800 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Alergias, Sensibilidades ou Restrições</span>
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Ex: Alergia a ácido salicílico, gestante, rosácea ativa..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-rose-200 bg-rose-50/30 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-hidden text-[#423533] placeholder:text-stone-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#544643] mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              <span>Histórico Facial & Observações</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Queixas da paciente, rotina diária de skincare, tratamentos anteriores..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533] resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F4EBE6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#7E6963] hover:text-[#423533] hover:bg-[#FAF5F2] rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
