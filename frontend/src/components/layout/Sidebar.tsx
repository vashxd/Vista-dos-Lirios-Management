import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import {
  LayoutDashboard, Megaphone, MessageSquare, Calendar, UtensilsCrossed,
  Wallet, HelpCircle, Package, FileText, Phone, User,
  Settings, Users, Building2, ClipboardList, Shield, Menu, X, Flower2
} from 'lucide-react'

const condominoMenu = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/mural', icon: Megaphone, label: 'Mural de Avisos' },
  { to: '/chamados', icon: MessageSquare, label: 'Meus Chamados' },
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/reservas', icon: UtensilsCrossed, label: 'Reservas' },
  { to: '/financeiro', icon: Wallet, label: 'Financeiro' },
  { to: '/enquetes', icon: HelpCircle, label: 'Enquetes' },
  { to: '/encomendas', icon: Package, label: 'Minhas Encomendas' },
  { to: '/documentos', icon: FileText, label: 'Documentos' },
  { to: '/contatos', icon: Phone, label: 'Contatos' },
  { to: '/perfil', icon: User, label: 'Meu Perfil' },
]

const sindicoMenu = [
  { to: '/sindico', icon: ClipboardList, label: 'Painel do Síndico' },
  { to: '/sindico/chamados', icon: MessageSquare, label: 'Gerenciar Chamados' },
  { to: '/sindico/reservas', icon: UtensilsCrossed, label: 'Gerenciar Reservas' },
  { to: '/tesouraria', icon: Wallet, label: 'Tesouraria' },
  { to: '/sindico/encomendas', icon: Package, label: 'Registrar Encomendas' },
  { to: '/sindico/documentos', icon: FileText, label: 'Upload Documentos' },
]

const adminMenu = [
  { to: '/admin', icon: Shield, label: 'Painel Administrativo' },
  { to: '/admin/usuarios', icon: Users, label: 'Gerenciar Usuários' },
  { to: '/admin/condominio', icon: Building2, label: 'Configurar Condomínio' },
  { to: '/admin/logs', icon: ClipboardList, label: 'Logs e Auditoria' },
  { to: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, isSindico, isAdmin } = useAuthStore()

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        'fixed top-0 left-0 h-screen w-64 bg-[#1B4332] text-white z-40 flex flex-col transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-[#B68D40] rounded-xl flex items-center justify-center">
            <Flower2 size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Vista dos Lírios</p>
            <p className="text-xs text-white/60">Management</p>
          </div>
          <button className="ml-auto lg:hidden p-1" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {condominoMenu.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}

          {isSindico() && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Síndico</p>
              </div>
              {sindicoMenu.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} onClick={onClose}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}>
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </>
          )}

          {isAdmin() && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Administração</p>
              </div>
              {adminMenu.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} onClick={onClose}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}>
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#B68D40] rounded-full flex items-center justify-center text-xs font-bold">
              {user?.nome?.[0]}{user?.sobrenome?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.nome} {user?.sobrenome}</p>
              <p className="text-xs text-white/50 capitalize">{user?.tipo}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
