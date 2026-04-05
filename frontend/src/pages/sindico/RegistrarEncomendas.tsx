import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Package } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { formatDateTime } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Encomenda } from '@/types'
import { useForm } from 'react-hook-form'

export function RegistrarEncomendas() {
  const qc = useQueryClient()
  const [novaModal, setNovaModal] = useState(false)
  const { register, handleSubmit, reset } = useForm<any>()

  const { data: encomendas = [], isLoading } = useQuery<Encomenda[]>({
    queryKey: ['encomendas-todas'],
    queryFn: () => api.get('/sindico/encomendas').then(r => r.data),
  })

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios-lista'],
    queryFn: () => api.get('/usuarios').then(r => r.data),
  })

  const criar = useMutation({
    mutationFn: (data: any) => api.post('/encomendas', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['encomendas-todas'] }); setNovaModal(false); reset(); toast.success('Encomenda registrada!') },
  })

  const pendentes = encomendas.filter(e => e.status === 'aguardando')
  const retiradas = encomendas.filter(e => e.status === 'retirada')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{pendentes.length} aguardando retirada</p>
        <button onClick={() => setNovaModal(true)} className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D6A4F] flex items-center gap-2">
          <Plus size={15} /> Registrar Encomenda
        </button>
      </div>

      {isLoading ? <CardSkeleton /> : (
        <>
          {pendentes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Aguardando Retirada</h3>
              <div className="space-y-2">
                {pendentes.map(e => (
                  <div key={e.id} className="bg-white rounded-2xl border-2 border-amber-200 p-4 flex items-center gap-4">
                    <Package size={18} className="text-[#B68D40]" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{e.descricao}</p>
                      <p className="text-xs text-gray-500">Para: {e.destinatario.nome} {e.destinatario.sobrenome} · {e.destinatario.bloco}/{e.destinatario.apartamento}</p>
                      {e.remetente && <p className="text-xs text-gray-400">De: {e.remetente}</p>}
                      <p className="text-xs text-gray-400">{formatDateTime(e.created_at)}</p>
                    </div>
                    <Badge variant="yellow">Aguardando</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Histórico</h3>
            <div className="space-y-2">
              {retiradas.map(e => (
                <div key={e.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                  <Package size={16} className="text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{e.descricao}</p>
                    <p className="text-xs text-gray-400">{e.destinatario.nome} · Retirada: {e.retirada_em ? formatDateTime(e.retirada_em) : '-'}</p>
                  </div>
                  <Badge variant="green">Retirada</Badge>
                </div>
              ))}
              {retiradas.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nenhuma encomenda no histórico</p>}
            </div>
          </div>
        </>
      )}

      <Modal isOpen={novaModal} onClose={() => setNovaModal(false)} title="Registrar Encomenda">
        <form onSubmit={handleSubmit(d => criar.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destinatário</label>
            <select {...register('user_id', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]">
              <option value="">Selecione...</option>
              {usuarios.map((u: any) => (
                <option key={u.id} value={u.id}>{u.nome} {u.sobrenome} — Bloco {u.bloco}/{u.apartamento}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input {...register('descricao', { required: true })} placeholder="Ex: Caixa Amazon, envelope azul..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remetente (opcional)</label>
            <input {...register('remetente')} placeholder="Nome do remetente"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setNovaModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D6A4F]">Registrar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
