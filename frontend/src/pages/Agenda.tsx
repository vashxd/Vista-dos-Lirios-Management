import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Calendar, MapPin, Users, Check } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/store/authStore'
import { formatDateTime } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Evento } from '@/types'
import { useForm } from 'react-hook-form'

const tipoColors: Record<string, 'blue' | 'red' | 'yellow' | 'green' | 'gray' | 'gold'> = {
  ago: 'blue', age: 'red', conselho: 'yellow', manutencao: 'gray',
  social: 'green', dedetizacao: 'gold', vencimento: 'gray'
}
const tipoLabel: Record<string, string> = {
  ago: 'AGO', age: 'AGE', conselho: 'Conselho', manutencao: 'Manutenção',
  social: 'Evento Social', dedetizacao: 'Dedetização', vencimento: 'Vencimento'
}

export function Agenda() {
  const { isSindico } = useAuthStore()
  const qc = useQueryClient()
  const [novoModal, setNovoModal] = useState(false)
  const { register, handleSubmit, reset } = useForm<any>()

  const { data: eventos = [], isLoading } = useQuery<Evento[]>({
    queryKey: ['eventos'],
    queryFn: () => api.get('/eventos').then(r => r.data),
  })

  const criar = useMutation({
    mutationFn: (data: any) => api.post('/eventos', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['eventos'] }); setNovoModal(false); reset(); toast.success('Evento criado!') },
  })

  const confirmar = useMutation({
    mutationFn: (id: number) => api.post(`/eventos/${id}/confirmar`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['eventos'] }); toast.success('Presença confirmada!') },
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{eventos.length} eventos</p>
        {isSindico() && (
          <button onClick={() => setNovoModal(true)} className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D6A4F] flex items-center gap-2">
            <Plus size={15} /> Novo Evento
          </button>
        )}
      </div>

      {isLoading ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />) :
        eventos.length === 0 ? <EmptyState icon={Calendar} title="Nenhum evento agendado" description="A agenda está vazia por enquanto." /> : (
          <div className="space-y-3">
            {eventos.map(e => {
              const dt = new Date(e.data_inicio)
              return (
                <div key={e.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#D8F3DC] rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#1B4332]">{dt.getDate()}</span>
                    <span className="text-[10px] text-[#2D6A4F] uppercase">
                      {dt.toLocaleString('pt-BR', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900">{e.titulo}</p>
                      <Badge variant={tipoColors[e.tipo] ?? 'gray'}>{tipoLabel[e.tipo] ?? e.tipo}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{formatDateTime(e.data_inicio)}</p>
                    {e.local && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                        <MapPin size={11} /> {e.local}
                      </div>
                    )}
                    {e.descricao && <p className="text-sm text-gray-600 mt-2">{e.descricao}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {e.confirmacoes_count !== undefined && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Users size={11} /> {e.confirmacoes_count}
                      </div>
                    )}
                    {!e.minha_confirmacao ? (
                      <button onClick={() => confirmar.mutate(e.id)}
                        className="text-xs text-[#1B4332] font-medium hover:underline">
                        Confirmar presença
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <Check size={12} /> Confirmado
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      }

      <Modal isOpen={novoModal} onClose={() => setNovoModal(false)} title="Novo Evento" size="lg">
        <form onSubmit={handleSubmit(d => criar.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input {...register('titulo', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select {...register('tipo')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]">
                {Object.entries(tipoLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
              <input {...register('local')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data/Hora Início</label>
              <input {...register('data_inicio', { required: true })} type="datetime-local"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data/Hora Fim</label>
              <input {...register('data_fim')} type="datetime-local"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / Pauta</label>
            <textarea {...register('descricao')} rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] resize-none" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setNovoModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D6A4F]">Criar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
