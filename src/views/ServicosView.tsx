import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Clock,
  ArrowRight,
  Layers,
  Check,
  Percent,
  X,
  AlertCircle,
  FileText,
  MessageCircle,
  Edit3,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Archive,
  ArchiveRestore,
} from 'lucide-react';
import { ServiceItem } from '../types';
import { compressImageFile } from '../utils/imageHelper';

interface ServicosViewProps {
  services: ServiceItem[];
  onAddService: (service: ServiceItem) => void;
  onSelectForAppointment: (serviceId: string) => void;
  onUpdateService?: (service: ServiceItem) => void;
  onDeleteService?: (serviceId: string) => void;
  onToggleArchiveService?: (serviceId: string) => void;
}

export const ServicosView: React.FC<ServicosViewProps> = ({
  services,
  onAddService,
  onSelectForAppointment,
  onUpdateService,
  onDeleteService,
  onToggleArchiveService,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ativos' | 'arquivados' | 'todos'>('ativos');
  const [filterType, setFilterType] = useState<'todos' | 'avulsos' | 'pacotes'>('todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);

  // Single Service Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Limpeza & Higienização');
  const [duration, setDuration] = useState('60');
  const [price, setPrice] = useState('180.00');
  const [description, setDescription] = useState('');
  const [postCareInstructions, setPostCareInstructions] = useState('');
  const [postCareImageUrl, setPostCareImageUrl] = useState<string | null>(null);

  // Package Form
  const [packageName, setPackageName] = useState('');
  const [packageCategory, setPackageCategory] = useState('Pacotes & Combos');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [customPackagePrice, setCustomPackagePrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('15');
  const [discountAmount, setDiscountAmount] = useState('');
  const [customPackageDuration, setCustomPackageDuration] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [packagePostCareInstructions, setPackagePostCareInstructions] = useState('');
  const [packagePostCareImageUrl, setPackagePostCareImageUrl] = useState<string | null>(null);

  // Editing post care on existing service
  const [editingPostCareService, setEditingPostCareService] = useState<ServiceItem | null>(null);
  const [editingPostCareText, setEditingPostCareText] = useState('');
  const [editingPostCareImageUrl, setEditingPostCareImageUrl] = useState<string | null>(null);

  const handleImageFileChange = async (file: File, setter: (val: string | null) => void) => {
    if (!file.type.startsWith('image/')) {
      return;
    }
    try {
      const compressedDataUrl = await compressImageFile(file, 1080, 0.85);
      setter(compressedDataUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        setter(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const activeServices = services.filter((s) => !s.archived);
  const archivedServices = services.filter((s) => Boolean(s.archived));
  const individualServices = activeServices.filter((s) => !s.isPackage);

  const servicesInStatus =
    statusFilter === 'ativos'
      ? activeServices
      : statusFilter === 'arquivados'
      ? archivedServices
      : services;

  const individualInStatusCount = servicesInStatus.filter((s) => !s.isPackage).length;
  const packageInStatusCount = servicesInStatus.filter((s) => s.isPackage).length;

  const filtered = servicesInStatus.filter((srv) => {
    if (filterType === 'avulsos') return !srv.isPackage;
    if (filterType === 'pacotes') return srv.isPackage;
    return true;
  });

  // Calculate sum of selected services in the package builder
  const selectedServices = individualServices.filter((s) =>
    selectedServiceIds.includes(s.id)
  );
  const totalOriginalPrice = selectedServices.reduce((acc, curr) => acc + curr.price, 0);
  const totalOriginalDuration = selectedServices.reduce(
    (acc, curr) => acc + curr.durationMinutes,
    0
  );

  const packagePriceNum = parseFloat(customPackagePrice) || 0;
  const savings = totalOriginalPrice > packagePriceNum ? totalOriginalPrice - packagePriceNum : 0;

  // 3-Way Synchronized Pricing Calculators
  const handleUpdateFromPercent = (pctStr: string, basePrice = totalOriginalPrice) => {
    setDiscountPercent(pctStr);
    const pct = parseFloat(pctStr);
    if (isNaN(pct) || pct <= 0) {
      setDiscountAmount('0.00');
      setCustomPackagePrice(basePrice > 0 ? basePrice.toFixed(2) : '');
      return;
    }
    const disc = (basePrice * pct) / 100;
    const finalPrice = Math.max(0, basePrice - disc);
    setDiscountAmount(disc.toFixed(2));
    setCustomPackagePrice(finalPrice.toFixed(2));
  };

  const handleUpdateFromDiscountAmount = (amountStr: string, basePrice = totalOriginalPrice) => {
    setDiscountAmount(amountStr);
    const disc = parseFloat(amountStr);
    if (isNaN(disc) || disc <= 0) {
      setDiscountPercent('0');
      setCustomPackagePrice(basePrice > 0 ? basePrice.toFixed(2) : '');
      return;
    }
    const finalPrice = Math.max(0, basePrice - disc);
    const pct = basePrice > 0 ? (disc / basePrice) * 100 : 0;
    setDiscountPercent(pct > 0 ? (Number.isInteger(pct) ? String(pct) : pct.toFixed(1)) : '0');
    setCustomPackagePrice(finalPrice.toFixed(2));
  };

  const handleUpdateFromFinalPrice = (priceStr: string, basePrice = totalOriginalPrice) => {
    setCustomPackagePrice(priceStr);
    const finalPrice = parseFloat(priceStr);
    if (isNaN(finalPrice) || finalPrice < 0) {
      setDiscountPercent('0');
      setDiscountAmount('0.00');
      return;
    }
    const disc = Math.max(0, basePrice - finalPrice);
    const pct = basePrice > 0 ? (disc / basePrice) * 100 : 0;
    setDiscountAmount(disc.toFixed(2));
    setDiscountPercent(pct > 0 ? (Number.isInteger(pct) ? String(pct) : pct.toFixed(1)) : '0');
  };

  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      const next = prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId];

      const updatedSelected = individualServices.filter((s) => next.includes(s.id));
      const sumDur = updatedSelected.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      const sumPr = updatedSelected.reduce((acc, curr) => acc + curr.price, 0);

      setCustomPackageDuration(String(sumDur));

      // Re-apply active discount percentage
      const activePct = parseFloat(discountPercent) || 15;
      const disc = (sumPr * activePct) / 100;
      const finalPrice = Math.max(0, sumPr - disc);

      setDiscountAmount(disc.toFixed(2));
      setCustomPackagePrice(finalPrice.toFixed(2));
      setDiscountPercent(String(activePct));

      return next;
    });
  };

  const handleCreateSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSrv: ServiceItem = {
      id: `srv-${Date.now()}`,
      name: name.trim(),
      category: category.trim() || 'Estética Facial',
      durationMinutes: parseInt(duration, 10) || 60,
      price: parseFloat(price) || 0,
      description: description.trim() || 'Procedimento estético facial especializado.',
      isPackage: false,
      postCareInstructions: postCareInstructions.trim() || undefined,
      postCareImageUrl: postCareImageUrl || undefined,
    };

    onAddService(newSrv);
    setName('');
    setDescription('');
    setPostCareInstructions('');
    setPostCareImageUrl(null);
    setShowAddModal(false);
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName.trim() || selectedServiceIds.length < 2) return;

    const includedNames = selectedServices.map((s) => s.name);

    const newPackage: ServiceItem = {
      id: `pkg-${Date.now()}`,
      name: packageName.trim(),
      category: packageCategory.trim() || 'Pacotes & Combos',
      durationMinutes: parseInt(customPackageDuration, 10) || totalOriginalDuration,
      price: packagePriceNum || totalOriginalPrice,
      originalPrice: totalOriginalPrice,
      description:
        packageDescription.trim() ||
        `Combo exclusivo combinando: ${includedNames.join(' + ')}.`,
      isPackage: true,
      includedServiceIds: selectedServiceIds,
      includedServiceNames: includedNames,
      postCareInstructions: packagePostCareInstructions.trim() || undefined,
      postCareImageUrl: packagePostCareImageUrl || undefined,
    };

    onAddService(newPackage);
    setPackageName('');
    setSelectedServiceIds([]);
    setCustomPackagePrice('');
    setCustomPackageDuration('');
    setPackageDescription('');
    setPackagePostCareInstructions('');
    setPackagePostCareImageUrl(null);
    setShowPackageModal(false);
  };

  const handleOpenEditPostCare = (srv: ServiceItem) => {
    setEditingPostCareService(srv);
    setEditingPostCareText(srv.postCareInstructions || '');
    setEditingPostCareImageUrl(srv.postCareImageUrl || null);
  };

  const handleSaveEditedPostCare = () => {
    if (!editingPostCareService) return;
    const updated: ServiceItem = {
      ...editingPostCareService,
      postCareInstructions: editingPostCareText.trim() || undefined,
      postCareImageUrl: editingPostCareImageUrl || undefined,
    };
    if (onUpdateService) {
      onUpdateService(updated);
    }
    setEditingPostCareService(null);
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#EFE5E0] shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#423533]">Catálogo de Procedimentos & Pacotes</h2>
          <p className="text-xs text-[#8C7B76]">
            Protocolos individuais e combos combinados com valores promocionais personalizados
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-[#FAF5F2] text-[#544643] text-xs sm:text-sm font-semibold rounded-xl border border-[#E8DDD7] transition-colors"
          >
            <Plus className="w-4 h-4 text-[#9E4B52]" />
            <span>Novo Procedimento</span>
          </button>

          <button
            onClick={() => setShowPackageModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs"
          >
            <Layers className="w-4 h-4" />
            <span>Mesclar em Pacote</span>
          </button>
        </div>
      </div>

      {/* Filter tabs: Status (Ativos / Arquivados / Todos) & Type */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#EFE5E0] shadow-2xs w-fit">
          <button
            type="button"
            onClick={() => setStatusFilter('ativos')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'ativos'
                ? 'bg-[#FDF2F2] text-[#9E4B52] border border-[#F5D8DB] shadow-2xs'
                : 'text-[#7E6963] hover:text-[#423533] hover:bg-[#FAF5F2]'
            }`}
          >
            <span>Ativos</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'ativos'
                  ? 'bg-[#9E4B52] text-white'
                  : 'bg-[#F4EBE6] text-[#7E6963]'
              }`}
            >
              {activeServices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('arquivados')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'arquivados'
                ? 'bg-[#FDF2F2] text-[#9E4B52] border border-[#F5D8DB] shadow-2xs'
                : 'text-[#7E6963] hover:text-[#423533] hover:bg-[#FAF5F2]'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Arquivados</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'arquivados'
                  ? 'bg-[#9E4B52] text-white'
                  : 'bg-[#F4EBE6] text-[#7E6963]'
              }`}
            >
              {archivedServices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'todos'
                ? 'bg-[#FDF2F2] text-[#9E4B52] border border-[#F5D8DB] shadow-2xs'
                : 'text-[#7E6963] hover:text-[#423533] hover:bg-[#FAF5F2]'
            }`}
          >
            Todos ({services.length})
          </button>
        </div>

        {/* Category Type Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#EFE5E0] shadow-2xs w-fit overflow-x-auto">
          {[
            { id: 'todos', label: `Todos (${servicesInStatus.length})` },
            { id: 'avulsos', label: `Procedimentos Avulsos (${individualInStatusCount})` },
            { id: 'pacotes', label: `Pacotes & Combos (${packageInStatusCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-[#FDF2F2] text-[#9E4B52] border border-[#F5D8DB]'
                  : 'text-[#7E6963] hover:text-[#423533] hover:bg-[#FAF5F2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-[#EFE5E0]">
            <p className="text-sm font-semibold text-[#423533]">Nenhum procedimento cadastrado no catálogo.</p>
            <p className="text-xs text-[#8C7B76] mt-1">
              Cadastre seus procedimentos individuais para depois poder mesclá-los em combos e pacotes.
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Procedimento Avulso</span>
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-[#EFE5E0]">
            <p className="text-sm text-[#8C7B76]">
              {statusFilter === 'arquivados'
                ? 'Nenhum procedimento arquivado encontrado.'
                : 'Nenhum item encontrado nesta categoria.'}
            </p>
            {statusFilter === 'arquivados' ? (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('ativos');
                  setFilterType('todos');
                }}
                className="mt-3 text-xs font-semibold text-[#9E4B52] hover:underline cursor-pointer"
              >
                Ver procedimentos ativos
              </button>
            ) : (
              filterType === 'pacotes' &&
              individualServices.length >= 2 && (
                <button
                  onClick={() => setShowPackageModal(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#9E4B52] text-white text-xs font-semibold rounded-xl"
                >
                  <Layers className="w-4 h-4" />
                  <span>Criar Primeiro Pacote Combinado</span>
                </button>
              )
            )}
          </div>
        ) : (
          filtered.map((srv) => {
            const isPkg = srv.isPackage;

            return (
              <div
                key={srv.id}
                className={`flex flex-col justify-between p-5 rounded-3xl bg-white border transition-all ${
                  srv.archived
                    ? 'border-stone-200 opacity-85 bg-stone-50/40'
                    : isPkg
                    ? 'border-[#E8DDD7] shadow-xs bg-gradient-to-b from-[#FDF8F6] to-white ring-1 ring-[#F5D8DB]/60'
                    : 'border-[#EFE5E0] shadow-2xs hover:shadow-sm hover:border-[#E8DDD7]'
                }`}
              >
                <div>
                  {/* Category, duration and discreet actions header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider truncate ${
                        isPkg
                          ? 'bg-[#FDF2F2] text-[#9E4B52] border border-[#F5D8DB]'
                          : 'bg-[#FAF4F2] text-[#7E6963] border border-[#EFE5E0]'
                      }`}
                    >
                      {isPkg ? '✨ Pacote Combinado' : srv.category}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center gap-1 text-xs text-[#8C7B76]">
                        <Clock className="w-3.5 h-3.5 text-[#9E4B52]" />
                        <span>{srv.durationMinutes} min</span>
                      </div>

                      {/* Discreet Action Toolbar (matching ClientesView) */}
                      {(onToggleArchiveService || onDeleteService) && (
                        <div className="flex items-center gap-0.5 bg-[#FAF5F2] p-0.5 rounded-xl border border-[#EFE5E0]">
                          {onToggleArchiveService && (
                            <button
                              type="button"
                              onClick={() => onToggleArchiveService(srv.id)}
                              title={
                                srv.archived
                                  ? 'Desarquivar procedimento'
                                  : 'Arquivar procedimento'
                              }
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                srv.archived
                                  ? 'text-amber-600 hover:text-amber-800 hover:bg-white'
                                  : 'text-stone-500 hover:text-stone-800 hover:bg-white'
                              }`}
                            >
                              {srv.archived ? (
                                <ArchiveRestore className="w-3.5 h-3.5" />
                              ) : (
                                <Archive className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          {onDeleteService && (
                            <button
                              type="button"
                              onClick={() => setServiceToDelete(srv)}
                              title="Excluir procedimento permanentemente"
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#423533] mb-1.5">{srv.name}</h3>

                  {/* Included services list if it's a package */}
                  {isPkg && srv.includedServiceNames && srv.includedServiceNames.length > 0 && (
                    <div className="p-3 my-2.5 rounded-2xl bg-[#FAF5F2] border border-[#EFE5E0] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#A3928B] tracking-wider block">
                        Procedimentos Inclusos:
                      </span>
                      <ul className="text-xs text-[#544643] space-y-0.5">
                        {srv.includedServiceNames.map((name, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9E4B52] shrink-0" />
                            <span className="truncate">{name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs text-[#7E6963] leading-relaxed line-clamp-2 mb-2.5">
                    {srv.description}
                  </p>

                  {/* Post-Care Pamphlet badge and action */}
                  <div className="p-2 mb-3.5 rounded-2xl bg-[#FAF5F2] border border-[#EFE5E0] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileText
                        className={`w-3.5 h-3.5 shrink-0 ${
                          srv.postCareInstructions ? 'text-emerald-700' : 'text-stone-400'
                        }`}
                      />
                      <span className="truncate text-[11px] text-[#544643]">
                        {srv.postCareInstructions
                          ? 'Pós no WhatsApp configurado'
                          : 'Sem pós-procedimento'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenEditPostCare(srv)}
                      className="text-[11px] font-semibold text-[#9E4B52] hover:underline shrink-0 ml-1.5 cursor-pointer"
                    >
                      {srv.postCareInstructions ? 'Ver / Editar' : '+ Configurar'}
                    </button>
                  </div>
                </div>

                {/* Price and Schedule CTA */}
                <div className="pt-4 border-t border-[#F7EFEA] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    {isPkg && srv.originalPrice && srv.originalPrice > srv.price && (
                      <span className="text-[11px] text-[#A3928B] line-through block tabular-nums">
                        De R$ {srv.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-[#A3928B] uppercase font-semibold">
                        {isPkg ? 'Valor do Pacote' : 'Valor da sessão'}
                      </span>
                      {srv.archived && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200">
                          Arquivado
                        </span>
                      )}
                    </div>
                    <p className="text-base font-extrabold text-[#423533] tabular-nums">
                      R$ {srv.price.toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectForAppointment(srv.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#FDF2F2] hover:bg-[#FBE5E7] text-[#9E4B52] border border-[#F5D8DB] transition-colors shrink-0"
                  >
                    <span>Agendar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal 1: Novo Procedimento Avulso */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#EFE5E0] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F4EBE6] pb-3">
              <h3 className="text-base font-bold text-[#423533]">Cadastrar Novo Procedimento</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingle} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#544643] mb-1">
                  Nome do Procedimento *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Peeling de Diamante com Hidratação"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#544643] mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Limpeza, Rejuvenescimento ou Clareamento"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#544643] mb-1">
                    Duração (minutos)
                  </label>
                  <input
                    type="number"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#544643] mb-1">
                    Valor Individual (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#544643] mb-1">
                  Descrição do Protocolo
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva as etapas e benefícios do procedimento"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#544643] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#9E4B52]" />
                    <span>Orientações de Pós-Procedimento (WhatsApp)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setPostCareInstructions(
                        `• Evite exposição solar direta nas próximas 48 horas.\n• Use protetor solar FPS 50+ e reaplique a cada 3 horas.\n• Higienize suavemente com sabonete neutro e água fresca.\n• Hidrate a pele com sérum calmante ou água termal.\n• Não use ácidos, esfoliantes ou maquiagem pesada hoje.`
                      )
                    }
                    className="text-[11px] text-[#9E4B52] hover:underline font-semibold cursor-pointer"
                  >
                    🪄 Preencher modelo
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={postCareInstructions}
                  onChange={(e) => setPostCareInstructions(e.target.value)}
                  placeholder="Orientações e cuidados home care que serão puxados automaticamente ao concluir este procedimento e enviados via WhatsApp..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533] leading-relaxed"
                />

                {/* Image attachment */}
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#544643] flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-[#9E4B52]" />
                      Anexar Imagem / Arte do Panfleto (Opcional)
                    </span>
                    {postCareImageUrl && (
                      <button
                        type="button"
                        onClick={() => setPostCareImageUrl(null)}
                        className="text-[10px] text-rose-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remover
                      </button>
                    )}
                  </div>

                  {postCareImageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-[#EFE5E0] bg-[#FAF5F2] max-h-36 flex items-center justify-center p-2 group">
                      <img
                        src={postCareImageUrl}
                        alt="Panfleto Pós-Procedimento"
                        className="max-h-32 object-contain rounded-xl shadow-2xs"
                      />
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <span className="px-3 py-1.5 bg-white text-[#423533] text-xs font-semibold rounded-xl shadow-xs">
                          Trocar Imagem
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            handleImageFileChange(e.target.files[0], setPostCareImageUrl)
                          }
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-[#E4D7D2] hover:border-[#9E4B52] bg-[#FAF5F2]/60 hover:bg-[#FAF5F2] transition-colors cursor-pointer text-xs text-[#7E6963]">
                      <UploadCloud className="w-4 h-4 text-[#9E4B52]" />
                      <span>Anexar panfleto ou foto (PNG, JPG, WEBP)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleImageFileChange(e.target.files[0], setPostCareImageUrl)
                        }
                      />
                    </label>
                  )}
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
                  Salvar Procedimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Mesclar Serviços em Pacote / Combo */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[#EFE5E0] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F4EBE6] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F5D8DB] text-[#9E4B52]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#423533]">Mesclar Serviços em Pacote</h3>
                  <p className="text-xs text-[#8C7B76]">Crie um combo personalizado com valor especial</p>
                </div>
              </div>
              <button
                onClick={() => setShowPackageModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {individualServices.length < 2 ? (
              <div className="p-6 text-center bg-[#FAF5F2] rounded-2xl border border-[#EFE5E0] space-y-3">
                <AlertCircle className="w-8 h-8 text-[#9E4B52] mx-auto" />
                <p className="text-xs font-semibold text-[#423533]">
                  Você precisa ter pelo menos 2 procedimentos avulsos cadastrados para poder mesclá-los em um pacote.
                </p>
                <button
                  onClick={() => {
                    setShowPackageModal(false);
                    setShowAddModal(true);
                  }}
                  className="px-4 py-2 bg-[#9E4B52] text-white text-xs font-semibold rounded-xl"
                >
                  Cadastrar Procedimento Agora
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreatePackage} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#544643] mb-1">
                    Nome do Pacote / Combo *
                  </label>
                  <input
                    type="text"
                    required
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="Ex: Combo Glow: Limpeza Profunda + Peeling Químico"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533]"
                  />
                </div>

                {/* Services Checkboxes */}
                <div>
                  <label className="block text-xs font-semibold text-[#544643] mb-1.5">
                    Selecione os procedimentos inclusos no pacote (mínimo 2) *
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto p-2 rounded-2xl bg-[#FAF5F2] border border-[#EFE5E0]">
                    {individualServices.map((srv) => {
                      const isSelected = selectedServiceIds.includes(srv.id);

                      return (
                        <div
                          key={srv.id}
                          onClick={() => handleToggleService(srv.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-white border-[#9E4B52] shadow-2xs'
                              : 'bg-white/60 border-[#EFE5E0] hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div
                              className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                                isSelected
                                  ? 'bg-[#9E4B52] border-[#9E4B52] text-white'
                                  : 'border-[#D8C7BF] bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#423533] truncate">
                                {srv.name}
                              </p>
                              <p className="text-[10px] text-[#8C7B76]">
                                {srv.durationMinutes} min · {srv.category}
                              </p>
                            </div>
                          </div>

                          <span className="text-xs font-bold text-[#423533] tabular-nums shrink-0">
                            R$ {srv.price.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Calculation breakdown */}
                {selectedServices.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-[#FDF4F2] border border-[#F5D8DB] space-y-2 text-xs">
                    <div className="flex justify-between text-[#7E6963]">
                      <span>Soma dos valores avulsos:</span>
                      <span className="font-semibold tabular-nums">
                        R$ {totalOriginalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#7E6963]">
                      <span>Duração total somada:</span>
                      <span className="font-semibold">{totalOriginalDuration} minutos</span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-[#9E4B52] font-bold pt-1 border-t border-[#F5D8DB]">
                        <span>Economia para a cliente:</span>
                        <span className="tabular-nums">
                          R$ {savings.toFixed(2)} (
                          {Math.round((savings / totalOriginalPrice) * 100)}% off)
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* 3-Way Synchronized Pricing & Discount Panel */}
                <div className="p-4 rounded-2xl bg-[#FAF5F2] border border-[#EFE5E0] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#423533] flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-[#9E4B52]" />
                      Condições de Desconto & Valor do Pacote
                    </span>
                    {totalOriginalPrice > 0 && (
                      <span className="text-[11px] text-[#8C7B76]">
                        Soma avulsa: <strong className="text-[#423533] tabular-nums">R$ {totalOriginalPrice.toFixed(2)}</strong>
                      </span>
                    )}
                  </div>

                  {/* Quick percentage shortcuts */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A3928B] tracking-wider block mb-1.5">
                      Atalhos Rápidos de Desconto:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[0, 5, 10, 15, 20, 25, 30, 40, 50].map((pct) => {
                        const isCurrent = parseFloat(discountPercent) === pct;
                        return (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => handleUpdateFromPercent(String(pct))}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                              isCurrent
                                ? 'bg-[#9E4B52] text-white shadow-2xs'
                                : 'bg-white text-[#675753] border border-[#E4D7D2] hover:bg-[#FDF2F2] hover:text-[#9E4B52]'
                            }`}
                          >
                            {pct === 0 ? 'Sem Desconto' : `${pct}%`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3 Synchronized Typable Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {/* 1. Porcentagem de Desconto (%) */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#544643] mb-1">
                        Desconto em %
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="100"
                          value={discountPercent}
                          onChange={(e) => handleUpdateFromPercent(e.target.value)}
                          placeholder="0"
                          className="w-full pl-3 pr-7 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533] bg-white font-semibold"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-stone-400 font-bold">%</span>
                      </div>
                    </div>

                    {/* 2. Valor do Desconto em R$ */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#544643] mb-1">
                        Valor do Desconto (R$)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-stone-400 font-bold">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={totalOriginalPrice || undefined}
                          value={discountAmount}
                          onChange={(e) => handleUpdateFromDiscountAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533] bg-white font-semibold"
                        />
                      </div>
                    </div>

                    {/* 3. Valor Total Final do Pacote em R$ */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#544643] mb-1">
                        Valor Final do Pacote (R$) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-[#9E4B52] font-bold">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          min="0"
                          value={customPackagePrice}
                          onChange={(e) => handleUpdateFromFinalPrice(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border-2 border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533] bg-white font-extrabold shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Real-time Summary Bar */}
                  {totalOriginalPrice > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-white border border-[#EFE5E0] text-xs gap-2">
                      <div className="text-[#7E6963]">
                        <span>Preço Avulso: </span>
                        <span className="line-through tabular-nums font-semibold">
                          R$ {totalOriginalPrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {parseFloat(discountAmount) > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold tabular-nums">
                            Economia: R$ {parseFloat(discountAmount || '0').toFixed(2)} ({parseFloat(discountPercent || '0').toFixed(0)}% OFF)
                          </span>
                        )}
                        <span className="font-extrabold text-[#9E4B52] text-sm tabular-nums">
                          Total: R$ {parseFloat(customPackagePrice || '0').toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Duration input */}
                <div>
                  <label className="block text-xs font-semibold text-[#544643] mb-1">
                    Duração da Sessão Conjunta (minutos) *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input
                      type="number"
                      required
                      value={customPackageDuration}
                      onChange={(e) => setCustomPackageDuration(e.target.value)}
                      placeholder={String(totalOriginalDuration || 60)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533]"
                    />
                  </div>
                  <span className="text-[10px] text-[#A3928B] mt-1 block">
                    Pré-preenchido com a soma das durações ({totalOriginalDuration} min), mas você pode ajustar conforme o tempo real na cabine.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#544643] mb-1">
                    Descrição ou Diferenciais do Pacote
                  </label>
                  <textarea
                    rows={2}
                    value={packageDescription}
                    onChange={(e) => setPackageDescription(e.target.value)}
                    placeholder="Ex: Protocolo completo para renovação celular e luminosidade em uma única sessão"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#544643] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#9E4B52]" />
                      <span>Orientações de Pós-Procedimento do Pacote (WhatsApp)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setPackagePostCareInstructions(
                          `• Evite exposição solar direta e calor intenso por 48 horas.\n• Aplique protetor solar FPS 50+ a cada 3 horas.\n• Mantenha a pele abundantemente hidratada com sérum ou hidratante suave.\n• Não utilize ácidos ou produtos abrasivos nos próximos 5 dias.\n• Beba bastante água para potencializar o viço da pele.`
                        )
                      }
                      className="text-[11px] text-[#9E4B52] hover:underline font-semibold cursor-pointer"
                    >
                      🪄 Preencher modelo
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={packagePostCareInstructions}
                    onChange={(e) => setPackagePostCareInstructions(e.target.value)}
                    placeholder="Cuidados pós-procedimento combinados para enviar no WhatsApp da cliente após este pacote..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533] leading-relaxed"
                  />

                  {/* Image attachment in Package Modal */}
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#544643] flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-[#9E4B52]" />
                        Anexar Imagem / Arte do Panfleto (Opcional)
                      </span>
                      {packagePostCareImageUrl && (
                        <button
                          type="button"
                          onClick={() => setPackagePostCareImageUrl(null)}
                          className="text-[10px] text-rose-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remover
                        </button>
                      )}
                    </div>

                    {packagePostCareImageUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border border-[#EFE5E0] bg-[#FAF5F2] max-h-36 flex items-center justify-center p-2 group">
                        <img
                          src={packagePostCareImageUrl}
                          alt="Panfleto Pós-Procedimento"
                          className="max-h-32 object-contain rounded-xl shadow-2xs"
                        />
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <span className="px-3 py-1.5 bg-white text-[#423533] text-xs font-semibold rounded-xl shadow-xs">
                            Trocar Imagem
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              handleImageFileChange(e.target.files[0], setPackagePostCareImageUrl)
                            }
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-[#E4D7D2] hover:border-[#9E4B52] bg-[#FAF5F2]/60 hover:bg-[#FAF5F2] transition-colors cursor-pointer text-xs text-[#7E6963]">
                        <UploadCloud className="w-4 h-4 text-[#9E4B52]" />
                        <span>Anexar panfleto ou foto (PNG, JPG, WEBP)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            handleImageFileChange(e.target.files[0], setPackagePostCareImageUrl)
                          }
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#F4EBE6]">
                  <button
                    type="button"
                    onClick={() => setShowPackageModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#7E6963] hover:text-[#423533]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={selectedServiceIds.length < 2 || !customPackagePrice}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-all shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Pacote de Serviços</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal 3: Visualizar / Editar Pós-Procedimento WhatsApp de Serviço Existente */}
      {editingPostCareService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#EFE5E0] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F4EBE6] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#423533]">Panfleto Pós-Procedimento</h3>
                  <p className="text-xs text-[#8C7B76] truncate">{editingPostCareService.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPostCareService(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#544643]">
                  Texto das Orientações Home Care:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setEditingPostCareText(
                      `• Evite exposição solar direta nas próximas 48 horas.\n• Use protetor solar FPS 50+ e reaplique a cada 3 horas.\n• Higienize suavemente com sabonete neutro indicado.\n• Mantenha a pele hidratada com sérum ou água termal.\n• Não cutuque ou retire descamações da pele.`
                    )
                  }
                  className="text-[11px] text-[#9E4B52] hover:underline font-semibold cursor-pointer"
                >
                  🪄 Modelo Padrão
                </button>
              </div>

              <textarea
                rows={5}
                value={editingPostCareText}
                onChange={(e) => setEditingPostCareText(e.target.value)}
                placeholder="Insira as orientações que serão enviadas pelo WhatsApp..."
                className="w-full p-3 text-xs rounded-2xl border border-[#E4D7D2] focus:border-[#9E4B52] outline-hidden text-[#423533] leading-relaxed font-sans"
              />

              {/* Image attachment in Modal 3 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#544643] flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-[#9E4B52]" />
                    Imagem / Arte do Panfleto (Opcional):
                  </span>
                  {editingPostCareImageUrl && (
                    <button
                      type="button"
                      onClick={() => setEditingPostCareImageUrl(null)}
                      className="text-[10px] text-rose-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remover foto
                    </button>
                  )}
                </div>

                {editingPostCareImageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#EFE5E0] bg-[#FAF5F2] max-h-36 flex items-center justify-center p-2 group">
                    <img
                      src={editingPostCareImageUrl}
                      alt="Panfleto Pós-Procedimento"
                      className="max-h-32 object-contain rounded-xl shadow-2xs"
                    />
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <span className="px-3 py-1.5 bg-white text-[#423533] text-xs font-semibold rounded-xl shadow-xs">
                        Trocar Imagem
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleImageFileChange(e.target.files[0], setEditingPostCareImageUrl)
                        }
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-[#E4D7D2] hover:border-[#9E4B52] bg-[#FAF5F2]/60 hover:bg-[#FAF5F2] transition-colors cursor-pointer text-xs text-[#7E6963]">
                    <UploadCloud className="w-4 h-4 text-[#9E4B52]" />
                    <span>Anexar panfleto ou foto (PNG, JPG, WEBP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleImageFileChange(e.target.files[0], setEditingPostCareImageUrl)
                      }
                    />
                  </label>
                )}
              </div>

              <p className="text-[11px] text-[#8C7B76] leading-relaxed">
                💡 Este panfleto é puxado automaticamente na conclusão do atendimento na agenda para envio direto no WhatsApp da cliente.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F4EBE6]">
                <button
                  type="button"
                  onClick={() => setEditingPostCareService(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#7E6963] hover:text-[#423533] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedPostCare}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#9E4B52] hover:bg-[#883B41] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Panfleto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Confirmar Exclusão de Procedimento */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-[#EFE5E0] text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#423533]">
                {serviceToDelete.isPackage ? 'Excluir Pacote?' : 'Excluir Procedimento?'}
              </h3>
              <p className="text-xs text-[#8C7B76] mt-1.5 leading-relaxed">
                Tem certeza que deseja excluir permanentemente{' '}
                <strong className="text-[#423533]">{serviceToDelete.name}</strong> do catálogo?
                Esta ação não remove agendamentos já registrados.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-[#7E6963] hover:bg-[#FAF5F2] rounded-xl border border-[#EFE5E0] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteService?.(serviceToDelete.id);
                  setServiceToDelete(null);
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
