import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, MessageSquare, Star } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/authStore'
import { timeAgo, statusLabel } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Chamado, Resposta } from '@/types'
import { useForm } from 'react-hook-form'

const priorColors: Record<string, 'green' | 'blue' | 'yellow' | 'red'> = {
  baixa: 'green', media: 'blue', alta: 'yellow', urgente: 'red'
}
const statusColors: Record<string, 'blue' | 'yellow' | 'gray' | 'green' | 'red'> = {
  aberto: 'blue', em_andamento: 'yellow', aguardando: 'gray', resolvido: 'green', fechado: 'gray'
}

export function Chamados() {
  const { isSindico } = useAuthStore()
  const qc = useQueryClient()
  const [selected, setSelected] = useState<Chamado | null>(null)
  const [novoModal, setNovoModal] = useState(false)
  const { register, handleSubmit, reset } = useForm<any>()
  const { register: regResp, handleSubmit: subResp, reset: resetResp } = useForm<{ corpo: string }>()

  const { data: chamados = [], isLoading } = useQuery<Chamado[]>({
    queryKey: ['chamados'],
    queryFn: () => api.get('/chamados').then(r => r.data),
  })

  const { data: respostas = [] } = useQuery<Resposta[]>({
    queryKey: ['respostas', selected?.id],
    queryFn: () => selected ? api.get(`/chamados/${selected.id}/respostas`).then(r => r.data) : [],
    enabled: !!selected,
  })

  const criar = useMutation({
    mutationFn: (data: any) => api.post('/chamados', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['chamados'] }); setNovoModal(false); reset(); toast.success('Chamado aberto!') },
  })

  const responder = useMutation({
    mutationFn: (data: { corpo: string }) => api.post(`/chamados/${selected!.id}/respostas`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['respostas', selected?.id] }); resetResp() },
  })

  const mudarStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/chamados/${id}/status`, { status }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['chamados'] })
      if (selected?.id === v.id) setSelected(prev => prev ? { ...prev, status: v.status as any } : null)
      toast.success('Status atualizado')
    },
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{chamados.length} chamados</p>
        <button onClick={() => setNovoModal(true)} className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D6A4F] flex items-center gap-2">
          <Plus size={15} /> Abrir Chamado
        </button>
      </div>

      {isLoading ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />) :
        chamados.length === 0 ? <EmptyState icon={MessageSquare} title="Nenhum chamado" description="Abra um chamado para comunicar problemas ao síndico." action={
          <button onClick={() => setNovoModal(true)} className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium">Abrir Chamado</button>
        } /> : (
          <div className="space-y-3">
            {chamados.map(c => (
              <div key={c.id} onClick={() => setSelected(c)}
                className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 font-mono">{c.protocolo}</span>
                      <Badge variant={priorColors[c.prioridade]}>{c.prioridade}</Badge>
                      <Badge variant={statusColors[c.status]}>{statusLabel[c.status]}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{c.titulo}</p>
                    <p className="text-xs text-gray-500 mt-1">{c.autor.nome} {c.autor.sobrenome} · {c.autor.bloco}/{c.autor.apartamento} · {timeAgo(c.created_at)}</p>
                  </div>
                  {c.avaliacao && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: c.avaliacao }).map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }

      <Modal isOpen={novoModal} onClose={() => setNovoModal(false)} title="Abrir Chamado" size="lg">
        <form onSubmit={handleSubmit(d => criar.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input {...register('titulo', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select {...register('categoria')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]">
                {['manutencao', 'barulho', 'seguranca', 'sugestao', 'financeiro', 'outros'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <select {...register('prioridade')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]">
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea {...register('descricao', { required: true })} rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] resize-none" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setNovoModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D6A4F]">Enviar</button>
          </div>
        </form>
      </Modal>

      {selected && (
        <Modal isOpen onClose={() => setSelected(null)} title={`Chamado ${selected.protocolo}`} size="xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={priorColors[selected.prioridade]}>{selected.prioridade}</Badge>
              <Badge variant={statusColors[selected.status]}>{statusLabel[selected.status]}</Badge>
              <span className="text-xs text-gray-500">{selected.categoria}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{selected.titulo}</p>
              <p className="text-sm text-gray-600 mt-2">{selected.descricao}</p>
            </div>
            {isSindico() && (
              <div className="flex gap-2 flex-wrap">
                {['em_andamento', 'aguardando', 'resolvido', 'fechado'].map(s => (
                  <button key={s} onClick={() => mudarStatus.mutate({ id: selected.id, status: s })}
                    className="px-3 py-1 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 font-medium">
                    {statusLabel[s]}
                  </button>
                ))}
              </div>
            )}
            <div className="border-t pt-4 space-y-3 max-h-48 overflow-y-auto">
              {respostas.map(r => (
                <div key={r.id} className="flex gap-3">
                  <Avatar name={`${r.autor.nome} ${r.autor.sobrenome}`} size="sm" />
                  <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold text-gray-800">{r.autor.nome} · <span className="font-normal text-gray-400 capitalize">{r.autor.tipo}</span></p>
                    <p className="text-sm text-gray-700 mt-0.5">{r.corpo}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(r.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={subResp(d => responder.mutate(d))} className="flex gap-2">
              <input {...regResp('corpo', { required: true })} placeholder="Responder chamado..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
              <button type="submit" className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D6A4F]">
                Enviar
              </button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  )
}
