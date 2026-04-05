import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { formatDate, statusLabel } from '@/lib/utils'
import { UtensilsCrossed } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Reserva } from '@/types'
import { useForm } from 'react-hook-form'

export function GerenciarReservas() {
  const qc = useQueryClient()
  const [rejModal, setRejModal] = useState<Reserva | null>(null)
  const { register, handleSubmit, reset } = useForm<{ motivo: string }>()

  const { data: reservas = [], isLoading } = useQuery<Reserva[]>({
    queryKey: ['reservas-todas'],
    queryFn: () => api.get('/sindico/reservas').then(r => r.data),
  })

  const aprovar = useMutation({
    mutationFn: (id: number) => api.patch(`/reservas/${id}/aprovar`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservas-todas'] }); toast.success('Reserva aprovada!') },
  })

  const rejeitar = useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) => api.patch(`/reservas/${id}/rejeitar`, { motivo }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservas-todas'] }); setRejModal(null); reset(); toast.success('Reserva rejeitada') },
  })

  const pendentes = reservas.filter(r => r.status === 'pendente')
  const demais = reservas.filter(r => r.status !== 'pendente')

  return (
    <div className="space-y-6">
      {pendentes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Aguardando Aprovação ({pendentes.length})</h3>
          <div className="space-y-3">
            {pendentes.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border-2 border-amber-200 p-5 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{r.area.nome}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {r.solicitante.nome} {r.solicitante.sobrenome} · {r.solicitante.bloco}/{r.solicitante.apartamento}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(r.data)} · {r.hora_inicio} – {r.hora_fim}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => aprovar.mutate(r.id)}
                    className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600">
                    <Check size={12} /> Aprovar
                  </button>
                  <button onClick={() => setRejModal(r)}
                    className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600">
                    <X size={12} /> Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Histórico</h3>
        {isLoading ? <CardSkeleton /> : demais.length === 0 ? (
          <EmptyState icon={UtensilsCrossed} title="Sem reservas no histórico" />
        ) : (
          <div className="space-y-2">
            {demais.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.area.nome}</p>
                  <p className="text-xs text-gray-500">{r.solicitante.nome} {r.solicitante.sobrenome} · {formatDate(r.data)}</p>
                </div>
                <Badge variant={r.status === 'aprovada' ? 'green' : r.status === 'rejeitada' ? 'red' : 'gray'}>
                  {statusLabel[r.status]}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={!!rejModal} onClose={() => setRejModal(null)} title="Rejeitar Reserva" size="sm">
        <form onSubmit={handleSubmit(d => rejeitar.mutate({ id: rejModal!.id, motivo: d.motivo }))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da rejeição</label>
            <textarea {...register('motivo', { required: true })} rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] resize-none" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setRejModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600">Rejeitar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
