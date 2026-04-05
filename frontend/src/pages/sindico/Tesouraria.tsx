import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, TrendingUp, TrendingDown, Upload } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Lancamento } from '@/types'
import { useForm } from 'react-hook-form'

const receitasCats = ['taxa_ordinaria', 'taxa_extraordinaria', 'multa', 'aluguel_espaco', 'rendimento', 'fundo_reserva']
const despesasCats = ['funcionarios', 'manutencao', 'servicos', 'consumo', 'administrativo', 'seguros', 'obras', 'juridico']
const catLabel: Record<string, string> = {
  taxa_ordinaria: 'Taxa Ordinária', taxa_extraordinaria: 'Taxa Extraordinária', multa: 'Multa',
  aluguel_espaco: 'Aluguel de Espaço', rendimento: 'Rendimento', fundo_reserva: 'Fundo de Reserva',
  funcionarios: 'Funcionários', manutencao: 'Manutenção', servicos: 'Serviços',
  consumo: 'Consumo', administrativo: 'Administrativo', seguros: 'Seguros', obras: 'Obras', juridico: 'Jurídico'
}

export function Tesouraria() {
  const qc = useQueryClient()
  const [novoModal, setNovoModal] = useState(false)
  const [tipoNovo, setTipoNovo] = useState<'receita' | 'despesa'>('receita')
  const [filtroTipo, setFiltroTipo] = useState('')
  const { register, handleSubmit, reset } = useForm<any>()

  const { data: lancamentos = [], isLoading } = useQuery<Lancamento[]>({
    queryKey: ['lancamentos-todos', filtroTipo],
    queryFn: () => api.get('/lancamentos', { params: { tipo: filtroTipo, all: true } }).then(r => r.data),
  })

  const criar = useMutation({
    mutationFn: (data: any) => api.post('/lancamentos', { ...data, tipo: tipoNovo }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lancamentos-todos'] }); setNovoModal(false); reset(); toast.success('Lançamento registrado!') },
  })

  const totalReceitas = lancamentos.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0)
  const totalDespesas = lancamentos.filter(l => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-1"><TrendingUp size={16} className="text-green-600" /><span className="text-xs text-gray-500">Receitas</span></div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceitas)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-1"><TrendingDown size={16} className="text-red-500" /><span className="text-xs text-gray-500">Despesas</span></div>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(totalDespesas)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-1"><span className="text-xs text-gray-500">Saldo</span></div>
          <p className={`text-2xl font-bold ${totalReceitas - totalDespesas >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {formatCurrency(totalReceitas - totalDespesas)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]">
            <option value="">Todos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
          <div className="flex-1" />
          <button onClick={() => { setTipoNovo('receita'); setNovoModal(true) }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2">
            <Plus size={14} /> Receita
          </button>
          <button onClick={() => { setTipoNovo('despesa'); setNovoModal(true) }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 flex items-center gap-2">
            <Plus size={14} /> Despesa
          </button>
        </div>

        {isLoading ? <CardSkeleton /> : (
          <div className="space-y-2">
            {lancamentos.map(l => (
              <div key={l.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${l.tipo === 'receita' ? 'bg-green-50' : 'bg-red-50'}`}>
                    {l.tipo === 'receita' ? <TrendingUp size={14} className="text-green-600" /> : <TrendingDown size={14} className="text-red-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{l.descricao}</p>
                    <p className="text-xs text-gray-400">{catLabel[l.categoria] ?? l.categoria} · {formatDate(l.data)}</p>
                    {l.comprovante && (
                      <a href={l.comprovante} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1B4332] hover:underline flex items-center gap-1">
                        <Upload size={10} /> Comprovante
                      </a>
                    )}
                  </div>
                </div>
                <p className={`text-sm font-bold ${l.tipo === 'receita' ? 'text-green-600' : 'text-red-500'}`}>
                  {l.tipo === 'receita' ? '+' : '-'}{formatCurrency(l.valor)}
                </p>
              </div>
            ))}
            {lancamentos.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Nenhum lançamento</p>}
          </div>
        )}
      </div>

      <Modal isOpen={novoModal} onClose={() => setNovoModal(false)} title={`Novo Lançamento — ${tipoNovo === 'receita' ? 'Receita' : 'Despesa'}`}>
        <form onSubmit={handleSubmit(d => criar.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select {...register('categoria')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]">
              {(tipoNovo === 'receita' ? receitasCats : despesasCats).map(c => (
                <option key={c} value={c}>{catLabel[c]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input {...register('descricao', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <input {...register('valor', { required: true, valueAsNumber: true })} type="number" step="0.01" min="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input {...register('data', { required: true })} type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setNovoModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" className={`text-white px-4 py-2 rounded-lg text-sm font-medium ${tipoNovo === 'receita' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}>
              Registrar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
