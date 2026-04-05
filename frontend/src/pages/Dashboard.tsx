import { useQuery } from '@tanstack/react-query'
import { MessageSquare, Calendar, UtensilsCrossed, Package, TrendingUp, TrendingDown } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, timeAgo } from '@/lib/utils'
import api from '@/lib/api'
import type { DashboardStats } from '@/types'
import { Link } from 'react-router-dom'

function StatCard({ icon: Icon, label, value, color, to }: {
  icon: React.ElementType; label: string; value: number; color: string; to: string
}) {
  return (
    <Link to={to} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-sm text-gray-500">{label}</p>
    </Link>
  )
}

const categoriaLabel: Record<string, string> = {
  geral: 'Geral', manutencao: 'Manutenção', seguranca: 'Segurança',
  eventos: 'Eventos', obras: 'Obras', regulamento: 'Regulamento'
}

export function Dashboard() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then(r => r.data),
  })

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Olá, {user?.nome}! 👋
        </h2>
        <p className="text-sm text-gray-500 mt-1">Aqui está um resumo do condomínio</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MessageSquare} label="Chamados Abertos" value={data?.chamados_abertos ?? 0} color="bg-blue-500" to="/chamados" />
        <StatCard icon={UtensilsCrossed} label="Reservas Pendentes" value={data?.reservas_pendentes ?? 0} color="bg-amber-500" to="/reservas" />
        <StatCard icon={MessageSquare} label="Enquetes Ativas" value={data?.enquetes_ativas ?? 0} color="bg-purple-500" to="/enquetes" />
        <StatCard icon={Package} label="Encomendas" value={data?.encomendas_aguardando ?? 0} color="bg-green-600" to="/encomendas" />
      </div>

      {data?.financeiro_resumo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-xs font-medium text-gray-500">Receitas do Mês</span>
            </div>
            <p className="text-xl font-bold text-green-600">{formatCurrency(data.financeiro_resumo.receitas)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={16} className="text-red-500" />
              <span className="text-xs font-medium text-gray-500">Despesas do Mês</span>
            </div>
            <p className="text-xl font-bold text-red-500">{formatCurrency(data.financeiro_resumo.despesas)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500">Saldo</span>
            </div>
            <p className={`text-xl font-bold ${data.financeiro_resumo.saldo >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {formatCurrency(data.financeiro_resumo.saldo)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Avisos Recentes</h3>
            <Link to="/mural" className="text-xs text-[#1B4332] font-medium hover:underline">Ver todos</Link>
          </div>
          {data?.avisos_recentes?.length ? (
            <div className="space-y-3">
              {data.avisos_recentes.map(aviso => (
                <div key={aviso.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{aviso.titulo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="green" className="text-[10px]">{categoriaLabel[aviso.categoria]}</Badge>
                      <span className="text-xs text-gray-400">{timeAgo(aviso.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">Nenhum aviso recente</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Próximos Eventos</h3>
            <Link to="/agenda" className="text-xs text-[#1B4332] font-medium hover:underline">Ver agenda</Link>
          </div>
          {data?.proximos_eventos?.length ? (
            <div className="space-y-3">
              {data.proximos_eventos.map(evento => (
                <div key={evento.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-[#D8F3DC] rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[#1B4332]">
                      {new Date(evento.data_inicio).getDate()}
                    </span>
                    <span className="text-[9px] text-[#2D6A4F] uppercase">
                      {new Date(evento.data_inicio).toLocaleString('pt-BR', { month: 'short' })}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{evento.titulo}</p>
                    <p className="text-xs text-gray-400">{evento.local}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">Nenhum evento próximo</p>
          )}
        </div>
      </div>
    </div>
  )
}
