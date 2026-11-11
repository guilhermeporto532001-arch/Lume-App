import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Wallet,
  Package,
  Sparkles,
  LogOut,
  LogIn,
  X,
  ChevronRight,
} from 'lucide-react';
import { TabType } from '../types';
import { useAuth } from '../context/AuthContext';
import avatarImg from '../assets/images/avatar_esthetician_1794335612243.jpg';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  appointmentsCountToday: number;
  studioLogo?: string | null;
  onOpenLogoModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  onOpenAuth,
  appointmentsCountToday,
  studioLogo,
  onOpenLogoModal,
}) => {
  const { user, isGuest, logout } = useAuth();

  const navItems: { id: TabType; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'agendamentos', label: 'Agendamentos', icon: Calendar, badge: appointmentsCountToday },
    { id: 'financeiro', label: 'Financeiro', icon: Wallet },
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'servicos', label: 'Serviços', icon: Sparkles },
  ];

  const handleNavClick = (tab: TabType) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/30 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-[#EFE5E0] shadow-xs transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F4EBE6]">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogoModal}
              title="Clique para alterar ou adicionar o logo da Lume"
              className="relative group focus:outline-hidden"
            >
              {studioLogo ? (
                <img
                  src={studioLogo}
                  alt="Logo Lume"
                  className="w-10 h-10 rounded-2xl object-cover shadow-xs border border-[#EFE5E0] bg-white group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F5D8DB] to-[#E9BEBF] shadow-xs group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-[#9E4B52]" />
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-white text-[#9E4B52] shadow-2xs border border-[#F4EBE6] text-[9px] font-bold group-hover:bg-[#9E4B52] group-hover:text-white transition-colors">
                +
              </span>
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-[#423533] leading-none">
                Lume
              </h1>
              <p className="text-xs text-[#9B8983] mt-1 font-medium tracking-wide">
                Estética Facial
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-[#A3928B] uppercase">
            Navegação Principal
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-[#FDF2F2] text-[#9E4B52] shadow-xs border border-[#F5D8DB]'
                    : 'text-[#675753] hover:bg-[#FAF4F2] hover:text-[#423533]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#F5D8DB] text-[#9E4B52]'
                        : 'bg-stone-100 text-[#8C7B76] group-hover:bg-[#F4ECE8] group-hover:text-[#675753]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 ? (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-[#E9BEBF] text-[#7A363C]'
                        : 'bg-[#F2E7E3] text-[#7E6963]'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight
                    className={`w-3.5 h-3.5 opacity-0 transition-opacity ${
                      isActive ? 'opacity-100 text-[#9E4B52]' : 'group-hover:opacity-40'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile / Auth Card */}
        <div className="p-3 border-t border-[#F4EBE6] bg-[#FCF9F7]">
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#EFE5E0] shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={user.photoURL || avatarImg}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-[#F3DFE2] shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#423533] truncate">
                    {user.displayName || 'Esteticista'}
                  </p>
                  <p className="text-[11px] text-[#9B8983] truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sair da conta"
                className="p-1.5 text-stone-400 hover:text-[#9E4B52] hover:bg-[#FDF2F2] rounded-lg transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-white border border-[#EFE5E0] space-y-2">
              <div className="flex items-center gap-2">
                <img
                  src={avatarImg}
                  alt="Helena"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-[#F3DFE2] shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#423533] truncate">
                    {isGuest ? 'Modo Demonstração' : 'Não conectado'}
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenAuth}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#9E4B52] hover:bg-[#8B3F45] text-white text-xs font-medium rounded-lg transition-colors shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar / Cadastrar</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
