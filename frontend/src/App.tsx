import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { AppLayout } from '@/components/layout/AppLayout'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Mural } from '@/pages/Mural'
import { Chamados } from '@/pages/Chamados'
import { Agenda } from '@/pages/Agenda'
import { Reservas } from '@/pages/Reservas'
import { Financeiro } from '@/pages/Financeiro'
import { Enquetes } from '@/pages/Enquetes'
import { Encomendas } from '@/pages/Encomendas'
import { Documentos } from '@/pages/Documentos'
import { Contatos } from '@/pages/Contatos'
import { Perfil } from '@/pages/Perfil'
import { PainelSindico } from '@/pages/sindico/PainelSindico'
import { GerenciarReservas } from '@/pages/sindico/GerenciarReservas'
import { Tesouraria } from '@/pages/sindico/Tesouraria'
import { RegistrarEncomendas } from '@/pages/sindico/RegistrarEncomendas'
import { GerenciarUsuarios } from '@/pages/admin/GerenciarUsuarios'

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.tipo)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mural" element={<Mural />} />
            <Route path="/chamados" element={<Chamados />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/reservas" element={<Reservas />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/enquetes" element={<Enquetes />} />
            <Route path="/encomendas" element={<Encomendas />} />
            <Route path="/documentos" element={<Documentos />} />
            <Route path="/contatos" element={<Contatos />} />
            <Route path="/perfil" element={<Perfil />} />

            {/* Síndico */}
            <Route path="/sindico" element={<ProtectedRoute roles={['sindico', 'admin']}><PainelSindico /></ProtectedRoute>} />
            <Route path="/sindico/chamados" element={<ProtectedRoute roles={['sindico', 'admin']}><Chamados /></ProtectedRoute>} />
            <Route path="/sindico/reservas" element={<ProtectedRoute roles={['sindico', 'admin']}><GerenciarReservas /></ProtectedRoute>} />
            <Route path="/tesouraria" element={<ProtectedRoute roles={['sindico', 'admin']}><Tesouraria /></ProtectedRoute>} />
            <Route path="/sindico/encomendas" element={<ProtectedRoute roles={['sindico', 'admin']}><RegistrarEncomendas /></ProtectedRoute>} />
            <Route path="/sindico/documentos" element={<ProtectedRoute roles={['sindico', 'admin']}><Documentos /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><GerenciarUsuarios /></ProtectedRoute>} />
            <Route path="/admin/usuarios" element={<ProtectedRoute roles={['admin']}><GerenciarUsuarios /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: '12px', fontSize: '14px' },
        success: { iconTheme: { primary: '#1B4332', secondary: '#fff' } },
      }} />
    </QueryClientProvider>
  )
}
