import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, UtensilsCrossed, Users, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate, statusLabel } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { AreaLazer, Reserva } from '@/types'
import { useForm } from 'react-hook-form'

const statusColors: Record<string, 'yellow' | 'green' | 'red' | 'gray'> = {
  pendente: 'yellow', aprovada: 'green', rejeitada: 'red', cancelada: 'gray'
}

export function Reservas() {
  const qc = useQueryClient()
  const [novaModal, setNovaModal] = useState(false)
  const [areaSel, setAreaSel] = useState<AreaLazer | null>(null)
  const { register, handleSubmit, reset } = useForm<any>()

  const { data: areas = [], isLoading: loadAreas } = useQuery<AreaLazer[]>({
    queryKey: ['areas'],
    queryFn: () => api.get('/areas-lazer').then(r => r.data),
  })

  const { data: reservas = [], isLoading: loadRes } = useQuery<Reserva[]>({
    queryKey: ['reservas'],
    queryFn: () => api.get('/reservas').then(r => r.data),
  })

  const criar = useMutation({
    mutationFn: (data: any) => api.post('/reservas', { ...data, area_id: areaSel?.id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservas'] }); setNovaModal(false); reset(); setAreaSel(null); toast.success('Reserva solicitada!') },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao reservar'),
  })

  const cancelar = useMutation({
    mutationFn: (id: number) => api.patch(`/reservas/${id}/cancelar`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservas'] }); toast.success('Reserva cancelada') },
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Áreas Disponíveis</h3>
        {loadAreas ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {areas.map(a => (
              <div key={a.id} onClick={() => { setAreaSel(a); setNovaModal(true) }}
                className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:border-[#1B4332] hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-[#D8F3DC] rounded-xl flex items-center justify-center mb-3">
                  <UtensilsCrossed size={18} className="text-[#1B4332]" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{a.nome}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                  <Users size={11} /> {a.capacidade} pessoas
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                  <Clock size={11} /> {a.horario_inicio} – {a.horario_fim}
                </div>
                {a.taxa > 0 && <p className="text-xs font-medium text-[#B68D40]">{formatCurrency(a.taxa)}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Minhas Reservas</h3>
        {loadRes ? <CardSkeleton /> : reservas.length === 0 ? (
          <EmptyState icon={UtensilsCrossed} title="Nenhuma reserva" description="Selecione uma área acima para fazer uma reserva." />
        ) : (
          <div className="space-y-3">
            {reservas.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900">{r.area.nome}</p>
                    <Badge variant={statusColors[r.status]}>{statusLabel[r.status]}</Badge>
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(r.data)} · {r.hora_inicio} – {r.hora_fim}</p>
                  {r.motivo_rejeicao && <p className="text-xs text-red-500 mt-1">Motivo: {r.motivo_rejeicao}</p>}
                </div>
                {r.status === 'pendente' && (
                  <button onClick={() => cancelar.mutate(r.id)}
                    className="text-xs text-red-500 font-medium hover:underline">Cancelar</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={novaModal && !!areaSel} onClose={() => { setNovaModal(false); setAreaSel(null) }}
        title={`Reservar — ${areaSel?.nome}`}>
        <form onSubmit={handleSubmit(d => criar.mutate(d))} className="space-y-4">
          <div className="bg-[#D8F3DC] rounded-xl p-3 text-sm text-[#1B4332] space-y-1">
            <p><strong>Horário:</strong> {areaSel?.horario_inicio} – {areaSel?.horario_fim}</p>
            <p><strong>Capacidade:</strong> {areaSel?.capacidade} pessoas</p>
            {areaSel && areaSel.taxa > 0 && <p><strong>Taxa:</strong> {formatCurrency(areaSel.taxa)}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input {...register('data', { required: true })} type="date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora Início</label>
              <input {...register('hora_inicio', { required: true })} type="time"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fim</label>
              <input {...register('hora_fim', { required: true })} type="time"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setNovaModal(false); setAreaSel(null) }}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D6A4F]">Solicitar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
