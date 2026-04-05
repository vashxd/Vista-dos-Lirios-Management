import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pin, MessageCircle, Filter, Search } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/store/authStore'
import { timeAgo } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Aviso, Comentario } from '@/types'
import { useForm } from 'react-hook-form'

const categorias = ['geral', 'manutencao', 'seguranca', 'eventos', 'obras', 'regulamento']
const categoriaLabel: Record<string, string> = {
  geral: 'Geral', manutencao: 'Manutenção', seguranca: 'Segurança',
  eventos: 'Eventos', obras: 'Obras', regulamento: 'Regulamento'
}
const categoriaColor: Record<string, 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'gold'> = {
  geral: 'blue', manutencao: 'yellow', seguranca: 'red',
  eventos: 'green', obras: 'gold', regulamento: 'gray'
}

function AvisoCard({ aviso, onComment }: { aviso: Aviso; onComment: (a: Aviso) => void }) {
  const { isSindico } = useAuthStore()
  const qc = useQueryClient()

  const del = useMutation({
    mutationFn: () => api.delete(`/avisos/${aviso.id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['avisos'] }); toast.success('Aviso excluído') },
  })

  return (
    <div className={`bg-white rounded-2xl border p-5 ${aviso.fixado ? 'border-[#B68D40] shadow-md' : 'border-gray-100'}`}>
      {aviso.fixado && (
        <div className="flex items-center gap-1 text-[#B68D40] text-xs font-medium mb-2">
          <Pin size={12} /> Fixado
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Avatar name={`${aviso.autor.nome} ${aviso.autor.sobrenome}`} src={aviso.autor.foto} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-semibold text-gray-900">{aviso.titulo}</span>
              <Badge variant={categoriaColor[aviso.categoria]}>{categoriaLabel[aviso.categoria]}</Badge>
            </div>
            <p className="text-xs text-gray-500">
              {aviso.autor.nome} {aviso.autor.sobrenome} · {timeAgo(aviso.created_at)}
            </p>
          </div>
        </div>
        {isSindico() && (
          <button onClick={() => del.mutate()} className="text-xs text-red-400 hover:text-red-600">Excluir</button>
        )}
      </div>
      <div className="mt-3 text-sm text-gray-700 whitespace-pre-line">{aviso.corpo}</div>
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-3">
        <button onClick={() => onComment(aviso)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1B4332] transition-colors">
          <MessageCircle size={14} />
          {aviso.comentarios_count > 0 ? `${aviso.comentarios_count} comentários` : 'Comentar'}
        </button>
      </div>
    </div>
  )
}

function ComentariosModal({ aviso, onClose }: { aviso: Aviso; onClose: () => void }) {
  const { register, handleSubmit, reset } = useForm<{ corpo: string }>()
  const qc = useQueryClient()

  const { data: comentarios = [], isLoading } = useQuery<Comentario[]>({
    queryKey: ['comentarios', aviso.id],
    queryFn: () => api.get(`/avisos/${aviso.id}/comentarios`).then(r => r.data),
  })

  const add = useMutation({
    mutationFn: (data: { corpo: string }) => api.post(`/avisos/${aviso.id}/comentarios`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['comentarios', aviso.id] }); qc.invalidateQueries({ queryKey: ['avisos'] }); reset() },
  })

  return (
    <Modal isOpen title={`Comentários — ${aviso.titulo}`} onClose={onClose} size="lg">
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {isLoading ? <CardSkeleton /> : comentarios.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum comentário ainda</p>
        ) : comentarios.map(c => (
          <div key={c.id} className="flex gap-3">
            <Avatar name={`${c.autor.nome} ${c.autor.sobrenome}`} src={c.autor.foto} size="sm" />
            <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-xs font-semibold text-gray-800">{c.autor.nome} {c.autor.sobrenome}</p>
              <p className="text-sm text-gray-700 mt-0.5">{c.corpo}</p>
              <p className="text-xs text-gray-400 mt-1">{timeAgo(c.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit(d => add.mutate(d))} className="mt-4 flex gap-2">
        <input {...register('corpo', { required: true })} placeholder="Escreva um comentário..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
        <button type="submit" className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D6A4F]">
          Enviar
        </button>
      </form>
    </Modal>
  )
}

export function Mural() {
  const { isSindico } = useAuthStore()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [novoModal, setNovoModal] = useState(false)
  const [comentModal, setComentModal] = useState<Aviso | null>(null)
  const { register, handleSubmit, reset } = useForm<{ titulo: string; corpo: string; categoria: string; fixado: boolean }>()

  const { data: avisos = [], isLoading } = useQuery<Aviso[]>({
    queryKey: ['avisos', search, catFilter],
    queryFn: () => api.get('/avisos', { params: { search, categoria: catFilter } }).then(r => r.data),
  })

  const criar = useMutation({
    mutationFn: (data: any) => api.post('/avisos', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['avisos'] }); setNovoModal(false); reset(); toast.success('Aviso publicado!') },
  })

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar avisos..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]">
          <option value="">Todas</option>
          {categorias.map(c => <option key={c} value={c}>{categoriaLabel[c]}</option>)}
        </select>
        {isSindico() && (
          <button onClick={() => setNovoModal(true)} className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D6A4F] flex items-center gap-2">
            <Plus size={15} /> Novo
          </button>
        )}
      </div>

      {isLoading ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />) :
        avisos.length === 0 ? <EmptyState icon={Filter} title="Nenhum aviso encontrado" description="Tente outros filtros ou aguarde novos avisos." /> :
        avisos.map(a => <AvisoCard key={a.id} aviso={a} onComment={setComentModal} />)
      }

      <Modal isOpen={novoModal} onClose={() => setNovoModal(false)} title="Novo Aviso">
        <form onSubmit={handleSubmit(d => criar.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input {...register('titulo', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select {...register('categoria')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]">
              {categorias.map(c => <option key={c} value={c}>{categoriaLabel[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
            <textarea {...register('corpo', { required: true })} rows={5}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] resize-none" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" {...register('fixado')} className="rounded" />
            Fixar no topo do mural
          </label>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setNovoModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D6A4F]">Publicar</button>
          </div>
        </form>
      </Modal>

      {comentModal && <ComentariosModal aviso={comentModal} onClose={() => setComentModal(null)} />}
    </div>
  )
}
