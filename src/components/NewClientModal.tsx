import React, { useState } from 'react';
import { X, User, Phone, Mail, Sparkles, AlertTriangle, FileText, Check } from 'lucide-react';
import { Client } from '../types';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (client: Client) => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  onAddClient,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [skinType, setSkinType] = useState<Client['skinType']>('Mista');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newClient: Client = {
      id: `cli-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim() || '(Não informado)',
      email: email.trim() || undefined,
      skinType,
      allergies: allergies.trim() || 'Nenhuma alergia relatada',
      notes: notes.trim() || 'Nova cliente cadastrada.',
      createdAt: 'Hoje',
    };

    onAddClient(newClient);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[#EFE5E0] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-[#FDF5F3] to-white border-b border-[#F4EBE6]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#F5D8DB] text-[#9E4B52]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#423533]">Cadastrar Nova Cliente</h3>
              <p className="text-xs text-[#8C7B76]">Ficha de cadastro e dados da pele</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
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
              Classificação do Tipo de Pele
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['Mista', 'Oleosa', 'Seca', 'Sensível', 'Normal'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSkinType(type)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                    skinType === type
                      ? 'bg-[#FDF2F2] border-[#9E4B52] text-[#9E4B52] shadow-2xs font-semibold'
                      : 'border-[#E4D7D2] text-[#7E6963] hover:bg-[#FAF5F2]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#544643] mb-1">
              Alergias ou Contraindicações
            </label>
            <div className="relative">
              <AlertTriangle className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Ex: Alergia a iodo, dipirona ou sensibilidade a ácidos"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#544643] mb-1">
              Queixa Principal ou Observações
            </label>
            <div className="relative">
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Reclamação de manchas solares e poros abertos"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F4EBE6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#7E6963] hover:text-[#423533] hover:bg-stone-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Ficha da Cliente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
