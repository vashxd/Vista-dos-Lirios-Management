import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, HelpCircle, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Enquete } from '@/types'
import { useForm } from 'react-hook-form'

export function Enquetes() {
  const { isSindico } = useAuthStore()
  const qc = useQueryClient()
  const [novaModal, setNovaModal] = useState(false)
  const [opcoes, setOpcoes] = useState(['', ''])
  const { register, handleSubmit, reset, watch } = useForm<any>({ defaultValues: { tipo: 'multipla', anonima: false } })
  const tipo = watch('tipo')

  const { data: enquetes = [], isLoading } = useQuery<Enquete[]>({
    queryKey: ['enquetes'],
    queryFn: () => api.get('/enquetes').then(r => r.data),
  })

  const criar = useMutation({
    mutationFn: (data: any) => api.post('/enquetes', { ...data, opcoes: tipo === 'simnao' ? ['Sim', 'Não'] : opcoes.filter(Boolean) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['enquetes'] }); setNovaModal(false); reset(); setOpcoes(['', '']); toast.success('Enquete criada!') },
  })

  const votar = useMutation({
    mutationFn: ({ enqueteId, opcaoId }: { enqueteId: number; opcaoId: number }) =>
      api.post(`/enquetes/${enqueteId}/votar`, { opcao_id: opcaoId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['enquetes'] }); toast.success('Voto registrado!') },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao votar'),
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{enquetes.length} enquetes</p>
        {isSindico() && (
          <button onClick={() => setNovaModal(true)} className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D6A4F] flex items-center gap-2">
            <Plus size={15} /> Nova Enquete
          </button>
        )}
      </div>

      {isLoading ? Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />) :
        enquetes.length === 0 ? <EmptyState icon={HelpCircle} title="Nenhuma enquete ativa" /> : (
          <div className="space-y-4">
            {enquetes.map(e => {
              const encerrada = e.encerrada || new Date(e.prazo) < new Date()
              const totalVotos = e.total_votos
              return (
                <div key={e.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{e.titulo}</p>
                        {encerrada ? <Badge variant="gray">Encerrada</Badge> : <Badge variant="green">Ativa</Badge>}
                        {e.anonima && <Badge variant="blue">Anônima</Badge>}
                      </div>
                      {e.descricao && <p className="text-xs text-gray-500 mb-1">{e.descricao}</p>}
                      <p className="text-xs text-gray-400">Prazo: {formatDate(e.prazo)} · {totalVotos} votos</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {e.opcoes.map(o => {
                      const pct = totalVotos > 0 ? Math.round((o.votos / totalVotos) * 100) : 0
                      const voted = e.meu_voto === o.id
                      return (
                        <div key={o.id}>
                          {!encerrada && !e.meu_voto ? (
                            <button onClick={() => votar.mutate({ enqueteId: e.id, opcaoId: o.id })}
                              className="w-full text-left px-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm hover:border-[#1B4332] transition-colors font-medium text-gray-800">
                              {o.texto}
                            </button>
                          ) : (
                            <div className={`relative px-4 py-2.5 rounded-xl overflow-hidden ${voted ? 'border-2 border-[#1B4332]' : 'border border-gray-100'}`}>
                              <div className="absolute inset-0 bg-[#D8F3DC]" style={{ width: `${pct}%`, opacity: 0.6 }} />
                              <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {voted && <CheckCircle2 size={14} className="text-[#1B4332]" />}
                                  <span className="text-sm font-medium text-gray-800">{o.texto}</span>
                                </div>
                                <span className="text-xs font-bold text-gray-600">{pct}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )
      }

      <Modal isOpen={novaModal} onClose={() => setNovaModal(false)} title="Nova Enquete" size="lg">
        <form onSubmit={handleSubmit(d => criar.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input {...register('titulo', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea {...register('descricao')} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select {...register('tipo')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]">
                <option value="multipla">Múltipla escolha</option>
                <option value="simnao">Sim / Não</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
              <input {...register('prazo', { required: true })} type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
            </div>
          </div>
          {tipo === 'multipla' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Opções</label>
              <div className="space-y-2">
                {opcoes.map((op, i) => (
                  <input key={i} value={op} onChange={e => setOpcoes(prev => prev.map((o, j) => j === i ? e.target.value : o))}
                    placeholder={`Opção ${i + 1}`}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
                ))}
                <button type="button" onClick={() => setOpcoes(prev => [...prev, ''])}
                  className="text-sm text-[#1B4332] font-medium hover:underline">+ Adicionar opção</button>
              </div>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" {...register('anonima')} className="rounded" /> Votação anônima
          </label>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setNovaModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D6A4F]">Criar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
