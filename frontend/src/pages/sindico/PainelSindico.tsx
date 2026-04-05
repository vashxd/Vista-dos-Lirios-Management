import { useQuery } from '@tanstack/react-query'
import { MessageSquare, UtensilsCrossed, Package, TrendingUp, TrendingDown, Star } from 'lucide-react'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, timeAgo, statusLabel } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/lib/api'
import { Link } from 'react-router-dom'

export function PainelSindico() {
  const { data, isLoading } = useQuery({
    queryKey: ['sindico-dashboard'],
    queryFn: () => api.get('/sindico/dashboard').then((r) => r.data) as Promise<Record<string, any>>,
  })

  if (isLoading) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Chamados Abertos', value: data?.chamados_abertos ?? 0, icon: MessageSquare, color: 'bg-blue-500', to: '/sindico/chamados' },
          { label: 'Reservas Pendentes', value: data?.reservas_pendentes ?? 0, icon: UtensilsCrossed, color: 'bg-amber-500', to: '/sindico/reservas' },
          { label: 'Encomendas', value: data?.encomendas_pendentes ?? 0, icon: Package, color: 'bg-purple-500', to: '/sindico/encomendas' },
          { label: 'Saldo Mensal', value: formatCurrency(data?.saldo_mensal ?? 0), icon: TrendingUp, color: 'bg-green-600', to: '/tesouraria', isText: true },
        ].map(s => (
          <Link key={s.to} to={s.to} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={16} className="text-white" />
              </div>
              <span className={`font-bold text-gray-900 ${s.isText ? 'text-base' : 'text-2xl'}`}>{s.value}</span>
            </div>
            <p className="text-xs text-gray-500">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Chamados Recentes</h3>
            <Link to="/sindico/chamados" className="text-xs text-[#1B4332] hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-3">
            {(data?.chamados_recentes ?? []).map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.titulo}</p>
                  <p className="text-xs text-gray-400">{c.autor.nome} · {timeAgo(c.created_at)}</p>
                </div>
                <Badge variant={c.prioridade === 'urgente' ? 'red' : c.prioridade === 'alta' ? 'yellow' : 'blue'}>
                  {c.prioridade}
                </Badge>
              </div>
            ))}
            {!data?.chamados_recentes?.length && <p className="text-sm text-gray-400 text-center py-4">Sem chamados recentes</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Desempenho Financeiro</h3>
          {data?.grafico_financeiro ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.grafico_financeiro}>
                <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v as number)} />
                <Bar dataKey="receitas" name="Receitas" fill="#40916C" radius={[3, 3, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-8">Sem dados financeiros</p>}
        </div>
      </div>

      {data?.avaliacao_media !== undefined && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Avaliação Média dos Chamados</h3>
          <div className="flex items-center gap-3">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} className={i < Math.round(data.avaliacao_media) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
              ))}
            </div>
            <span className="text-lg font-bold text-gray-900">{data.avaliacao_media?.toFixed(1)}</span>
            <span className="text-sm text-gray-400">({data.total_avaliacoes} avaliações)</span>
          </div>
        </div>
      )}
    </div>
  )
}
