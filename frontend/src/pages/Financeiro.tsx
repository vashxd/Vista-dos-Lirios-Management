import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Search, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '@/lib/api'
import type { Lancamento } from '@/types'

export function Financeiro() {
  const [tipo, setTipo] = useState('')
  const [search, setSearch] = useState('')

  const { data: lancamentos = [], isLoading } = useQuery<Lancamento[]>({
    queryKey: ['lancamentos', tipo, search],
    queryFn: () => api.get('/lancamentos', { params: { tipo, search } }).then(r => r.data),
  })

  const { data: resumo } = useQuery<{ mes: string; receitas: number; despesas: number }[]>({
    queryKey: ['financeiro-resumo'],
    queryFn: () => api.get('/lancamentos/resumo').then(r => r.data),
  })

  const totalReceitas = lancamentos.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0)
  const totalDespesas = lancamentos.filter(l => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-1"><TrendingUp size={16} className="text-green-600" />
            <span className="text-xs text-gray-500 font-medium">Receitas</span></div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceitas)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-1"><TrendingDown size={16} className="text-red-500" />
            <span className="text-xs text-gray-500 font-medium">Despesas</span></div>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(totalDespesas)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 font-medium">Saldo</span></div>
          <p className={`text-2xl font-bold ${totalReceitas - totalDespesas >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {formatCurrency(totalReceitas - totalDespesas)}
          </p>
        </div>
      </div>

      {resumo && resumo.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Receitas × Despesas (últimos meses)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={resumo}>
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v as number)} />
              <Legend />
              <Bar dataKey="receitas" name="Receitas" fill="#40916C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar lançamento..."
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
          </div>
          <select value={tipo} onChange={e => setTipo(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]">
            <option value="">Todos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
        </div>

        {isLoading ? <CardSkeleton /> : lancamentos.length === 0 ? (
          <EmptyState icon={Filter} title="Nenhum lançamento" />
        ) : (
          <div className="space-y-2">
            {lancamentos.map(l => (
              <div key={l.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${l.tipo === 'receita' ? 'bg-green-50' : 'bg-red-50'}`}>
                    {l.tipo === 'receita' ? <TrendingUp size={14} className="text-green-600" /> : <TrendingDown size={14} className="text-red-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{l.descricao}</p>
                    <p className="text-xs text-gray-400">{l.categoria} · {formatDate(l.data)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${l.tipo === 'receita' ? 'text-green-600' : 'text-red-500'}`}>
                    {l.tipo === 'receita' ? '+' : '-'}{formatCurrency(l.valor)}
                  </p>
                  <Badge variant={l.tipo === 'receita' ? 'green' : 'red'} className="text-[10px]">{l.tipo}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
