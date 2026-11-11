import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Sparkles,
  User,
  DollarSign,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Appointment, Client, ServiceItem } from '../types';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  services: ServiceItem[];
  onAddAppointment: (appointment: Appointment) => void;
}

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  clients,
  services,
  onAddAppointment,
}) => {
  const [selectedClientName, setSelectedClientName] = useState(clients[0]?.name || '');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || 'custom');
  const [customServiceName, setCustomServiceName] = useState('');
  const [customPrice, setCustomPrice] = useState('150.00');
  const [customDuration, setCustomDuration] = useState('60');
  const [date, setDate] = useState('Hoje');
  const [time, setTime] = useState('14:00');
  const [notes, setNotes] = useState('');

  // Interactive Calendar State
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const nativePickerRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  const currentYear = calendarDate.getFullYear();
  const currentMonth = calendarDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const selectDay = (day: number) => {
    const picked = new Date(currentYear, currentMonth, day);
    const now = new Date();
    const isToday =
      picked.getDate() === now.getDate() &&
      picked.getMonth() === now.getMonth() &&
      picked.getFullYear() === now.getFullYear();

    if (isToday) {
      setDate('Hoje');
    } else {
      const dd = String(day).padStart(2, '0');
      const mm = String(currentMonth + 1).padStart(2, '0');
      setDate(`${dd}/${mm}/${currentYear}`);
    }
    setShowCalendar(false);
  };

  const selectToday = () => {
    setDate('Hoje');
    setCalendarDate(new Date());
    setShowCalendar(false);
  };

  const selectTomorrow = () => {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    const dd = String(tmr.getDate()).padStart(2, '0');
    const mm = String(tmr.getMonth() + 1).padStart(2, '0');
    setDate(`${dd}/${mm}/${tmr.getFullYear()}`);
    setCalendarDate(tmr);
    setShowCalendar(false);
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [yyyy, mm, dd] = e.target.value.split('-');
    const now = new Date();
    if (
      parseInt(dd, 10) === now.getDate() &&
      parseInt(mm, 10) === now.getMonth() + 1 &&
      parseInt(yyyy, 10) === now.getFullYear()
    ) {
      setDate('Hoje');
    } else {
      setDate(`${dd}/${mm}/${yyyy}`);
    }
    setCalendarDate(new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10)));
    setShowCalendar(false);
  };

  const isDaySelected = (day: number) => {
    const dd = String(day).padStart(2, '0');
    const mm = String(currentMonth + 1).padStart(2, '0');
    const formatted = `${dd}/${mm}/${currentYear}`;

    if (date === formatted) return true;

    if (date.toLowerCase() === 'hoje') {
      const now = new Date();
      return (
        day === now.getDate() &&
        currentMonth === now.getMonth() &&
        currentYear === now.getFullYear()
      );
    }
    return false;
  };

  const isTodayDay = (day: number) => {
    const now = new Date();
    return (
      day === now.getDate() &&
      currentMonth === now.getMonth() &&
      currentYear === now.getFullYear()
    );
  };

  const currentService = services.find((s) => s.id === selectedServiceId);
  const isCustom = !currentService || selectedServiceId === 'custom';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientName.trim()) return;

    const serviceName = isCustom ? customServiceName.trim() : currentService.name;
    if (!serviceName) return;

    const price = isCustom ? parseFloat(customPrice) || 0 : currentService.price;
    const duration = isCustom ? parseInt(customDuration, 10) || 60 : currentService.durationMinutes;

    const matchedClient = clients.find((c) => c.name.toLowerCase() === selectedClientName.trim().toLowerCase());

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      clientId: matchedClient?.id,
      clientName: selectedClientName.trim(),
      serviceName,
      date,
      time,
      durationMinutes: duration,
      price,
      status: 'confirmado',
      notes: notes.trim() || undefined,
    };

    onAddAppointment(newApt);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[#EFE5E0]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-[#FDF5F3] to-white border-b border-[#F4EBE6]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#F5D8DB] text-[#9E4B52]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#423533]">Novo Agendamento</h3>
              <p className="text-xs text-[#8C7B76]">Marque um procedimento facial na agenda</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Client select or input */}
          <div>
            <label className="block text-xs font-semibold text-[#544643] mb-1.5">
              Nome da Cliente *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                list="client-suggestions"
                required
                value={selectedClientName}
                onChange={(e) => setSelectedClientName(e.target.value)}
                placeholder="Ex: Ana Clara Menezes"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533]"
              />
              {clients.length > 0 && (
                <datalist id="client-suggestions">
                  {clients.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              )}
            </div>
          </div>

          {/* Procedure selection */}
          {services.length > 0 ? (
            <div>
              <label className="block text-xs font-semibold text-[#544643] mb-1.5">
                Procedimento Facial
              </label>
              <div className="relative">
                <Sparkles className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533] bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.isPackage ? '✨ [PACOTE] ' : ''}{s.name} — R$ {s.price.toFixed(2)} ({s.durationMinutes} min)
                    </option>
                  ))}
                  <option value="custom">+ Outro procedimento avulso</option>
                </select>
              </div>
            </div>
          ) : null}

          {/* If custom or services is empty */}
          {(isCustom || services.length === 0) && (
            <div className="p-3.5 rounded-2xl bg-[#FAF5F2] border border-[#F4EBE6] space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#544643] mb-1">
                  Nome do Procedimento *
                </label>
                <input
                  type="text"
                  required
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  placeholder="Ex: Limpeza de Pele Profunda"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533] bg-white"
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
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#544643] mb-1">
                    Duração (min)
                  </label>
                  <input
                    type="number"
                    required
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533] bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative" ref={calendarRef}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#544643]">
                  Data
                </label>
                <button
                  type="button"
                  onClick={() => setShowCalendar((prev) => !prev)}
                  className="text-[11px] text-[#9E4B52] hover:text-[#7D343B] font-medium cursor-pointer"
                >
                  {showCalendar ? 'Fechar' : 'Puxar calendário'}
                </button>
              </div>
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => setShowCalendar((prev) => !prev)}
                  title="Clique para puxar o calendário"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#9E4B52] hover:bg-[#FDF2F2] transition-colors cursor-pointer z-10"
                >
                  <Calendar className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onClick={() => setShowCalendar(true)}
                  placeholder="Hoje ou DD/MM/AAAA"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533] cursor-pointer hover:border-[#D6B5B9] transition-colors"
                />
                <input
                  ref={nativePickerRef}
                  type="date"
                  onChange={handleNativeDateChange}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>

              {/* Interactive Pull-down Calendar Popover */}
              {showCalendar && (
                <div className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-[#EFE5E0] p-3.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F7EFEA]">
                    <span className="text-xs font-bold text-[#423533] capitalize">
                      {monthNames[currentMonth]} {currentYear}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={prevMonth}
                        className="p-1 rounded-lg hover:bg-[#FAF5F2] text-[#7E6963] hover:text-[#423533] transition-colors"
                        title="Mês anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={nextMonth}
                        className="p-1 rounded-lg hover:bg-[#FAF5F2] text-[#7E6963] hover:text-[#423533] transition-colors"
                        title="Próximo mês"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <button
                      type="button"
                      onClick={selectToday}
                      className="flex-1 py-1 text-[11px] font-semibold rounded-lg bg-[#FAF5F2] hover:bg-[#F5D8DB] text-[#9E4B52] border border-[#EFE5E0] transition-colors cursor-pointer"
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      onClick={selectTomorrow}
                      className="flex-1 py-1 text-[11px] font-semibold rounded-lg bg-[#FAF5F2] hover:bg-[#F5D8DB] text-[#9E4B52] border border-[#EFE5E0] transition-colors cursor-pointer"
                    >
                      Amanhã
                    </button>
                    <button
                      type="button"
                      onClick={() => nativePickerRef.current?.showPicker?.()}
                      className="px-2 py-1 text-[11px] font-medium rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                      title="Abrir calendário nativo do sistema"
                    >
                      Nativo
                    </button>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-1">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((w, idx) => (
                      <span key={idx} className="text-[10px] font-bold text-[#A3928B]">
                        {w}
                      </span>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`blank-${i}`} className="h-7 w-7" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const selected = isDaySelected(day);
                      const isToday = isTodayDay(day);

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => selectDay(day)}
                          className={`h-7 w-7 mx-auto flex items-center justify-center text-xs rounded-lg transition-all cursor-pointer ${
                            selected
                              ? 'bg-[#9E4B52] text-white font-bold shadow-2xs'
                              : isToday
                              ? 'border border-[#9E4B52] text-[#9E4B52] font-bold hover:bg-[#FDF2F2]'
                              : 'text-[#423533] hover:bg-[#FAF5F2] hover:text-[#9E4B52]'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer with active date */}
                  <div className="mt-2.5 pt-2 border-t border-[#F7EFEA] flex items-center justify-between text-[11px] text-[#8C7B76]">
                    <span>
                      Data: <strong className="text-[#423533]">{date}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCalendar(false)}
                      className="text-[#9E4B52] font-semibold hover:underline cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#544643] mb-1.5">
                Horário
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533]"
                />
              </div>
            </div>
          </div>

          {/* Quick summary card when using pre-existing service */}
          {currentService && !isCustom && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF5F2] border border-[#EFE5E0] text-xs">
              <div>
                <span className="text-[#8C7B76]">Duração prevista:</span>{' '}
                <span className="font-semibold text-[#423533]">
                  {currentService.durationMinutes} minutos
                </span>
              </div>
              <div>
                <span className="text-[#8C7B76]">Valor:</span>{' '}
                <span className="font-bold text-[#9E4B52] tabular-nums">
                  R$ {currentService.price.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#544643] mb-1.5">
              Observações ou Foco do Tratamento
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Foco em extração de cravos ou cuidados com rosácea"
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533] placeholder:text-stone-400"
            />
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
              <span>Confirmar Agendamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
