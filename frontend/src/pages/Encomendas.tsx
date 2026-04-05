import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, Check } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { formatDateTime } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Encomenda } from '@/types'

export function Encomendas() {
  const qc = useQueryClient()

  const { data: encomendas = [], isLoading } = useQuery<Encomenda[]>({
    queryKey: ['encomendas-minhas'],
    queryFn: () => api.get('/encomendas/minhas').then(r => r.data),
  })

  const retirar = useMutation({
    mutationFn: (id: number) => api.patch(`/encomendas/${id}/retirar`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['encomendas-minhas'] }); toast.success('Retirada confirmada!') },
  })

  const pendentes = encomendas.filter(e => e.status === 'aguardando')
  const retiradas = encomendas.filter(e => e.status === 'retirada')

  return (
    <div className="space-y-6">
      {pendentes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Aguardando Retirada ({pendentes.length})</h3>
          <div className="space-y-3">
            {pendentes.map(e => (
              <div key={e.id} className="bg-white rounded-2xl border-2 border-[#B68D40] p-5 flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Package size={20} className="text-[#B68D40]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900">{e.descricao}</p>
                    <Badge variant="yellow">Aguardando</Badge>
                  </div>
                  {e.remetente && <p className="text-xs text-gray-500">De: {e.remetente}</p>}
                  <p className="text-xs text-gray-400 mt-1">Recebida em {formatDateTime(e.created_at)}</p>
                </div>
                <button onClick={() => retirar.mutate(e.id)}
                  className="bg-[#1B4332] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#2D6A4F] flex items-center gap-1">
                  <Check size={12} /> Confirmar retirada
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? <CardSkeleton /> : encomendas.length === 0 ? (
        <EmptyState icon={Package} title="Nenhuma encomenda" description="Você não possui encomendas na portaria." />
      ) : (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Histórico ({retiradas.length})</h3>
          <div className="space-y-2">
            {retiradas.map(e => (
              <div key={e.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Package size={16} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{e.descricao}</p>
                  <p className="text-xs text-gray-400">Retirada em {e.retirada_em ? formatDateTime(e.retirada_em) : '-'}</p>
                </div>
                <Badge variant="green">Retirada</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
