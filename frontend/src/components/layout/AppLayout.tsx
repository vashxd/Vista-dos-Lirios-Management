import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/mural': 'Mural de Avisos',
  '/chamados': 'Chamados',
  '/agenda': 'Agenda',
  '/reservas': 'Reservas de Áreas de Lazer',
  '/financeiro': 'Financeiro',
  '/enquetes': 'Enquetes e Votações',
  '/encomendas': 'Minhas Encomendas',
  '/documentos': 'Documentos',
  '/contatos': 'Contatos de Emergência',
  '/perfil': 'Meu Perfil',
  '/sindico': 'Painel do Síndico',
  '/sindico/chamados': 'Gerenciar Chamados',
  '/sindico/reservas': 'Gerenciar Reservas',
  '/tesouraria': 'Tesouraria',
  '/sindico/encomendas': 'Registrar Encomendas',
  '/sindico/documentos': 'Upload de Documentos',
  '/admin': 'Painel Administrativo',
  '/admin/usuarios': 'Gerenciar Usuários',
  '/admin/condominio': 'Configurar Condomínio',
  '/admin/logs': 'Logs e Auditoria',
  '/admin/configuracoes': 'Configurações do Sistema',
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = titles[location.pathname] ?? 'Vista dos Lírios'

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
