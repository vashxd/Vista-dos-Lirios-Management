import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { CardSkeleton } from '@/components/ui/Skeleton'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { User } from '@/store/authStore'
import { useForm } from 'react-hook-form'

const tipoColor: Record<string, 'red' | 'gold' | 'blue'> = { admin: 'red', sindico: 'gold', condomino: 'blue' }
const statusColor: Record<string, 'green' | 'gray' | 'yellow'> = { ativo: 'green', inativo: 'gray', pendente: 'yellow' }

export function GerenciarUsuarios() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [editUser, setEditUser] = useState<User | null>(null)
  const [novoModal, setNovoModal] = useState(false)
  const { register, handleSubmit, reset } = useForm<any>()
  const { register: regEdit, handleSubmit: subEdit, reset: resetEdit } = useForm<any>()

  const { data: usuarios = [], isLoading } = useQuery<User[]>({
    queryKey: ['admin-usuarios', search],
    queryFn: () => api.get('/admin/usuarios', { params: { search } }).then(r => r.data),
  })

  const criar = useMutation({
    mutationFn: (data: any) => api.post('/admin/usuarios', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-usuarios'] }); setNovoModal(false); reset(); toast.success('Usuário criado!') },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro'),
  })

  const atualizar = useMutation({
    mutationFn: ({ id, ...data }: any) => api.put(`/admin/usuarios/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-usuarios'] }); setEditUser(null); toast.success('Usuário atualizado!') },
  })

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/admin/usuarios/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-usuarios'] }); toast.success('Status atualizado') },
  })

  const handleEdit = (u: User) => {
    setEditUser(u)
    resetEdit({ nome: u.nome, sobrenome: u.sobrenome, email: u.email, telefone: u.telefone, bloco: u.bloco, apartamento: u.apartamento, tipo: u.tipo, status: u.status })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuário..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
        </div>
        <span className="text-sm text-gray-400">{usuarios.length} usuários</span>
        <button onClick={() => setNovoModal(true)} className="ml-auto bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D6A4F] flex items-center gap-2">
          <Plus size={15} /> Novo Usuário
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : usuarios.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum usuário encontrado" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Usuário</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 hidden md:table-cell">Unidade</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Tipo</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr></thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={`${u.nome} ${u.sobrenome}`} src={u.foto} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.nome} {u.sobrenome}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <p className="text-sm text-gray-600">Bl. {u.bloco} / Ap. {u.apartamento}</p>
                  </td>
                  <td className="px-5 py-3"><Badge variant={tipoColor[u.tipo]}>{u.tipo}</Badge></td>
                  <td className="px-5 py-3"><Badge variant={statusColor[u.status]}>{u.status}</Badge></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => handleEdit(u)} className="text-xs text-[#1B4332] hover:underline font-medium">Editar</button>
                      <button onClick={() => toggleStatus.mutate({ id: u.id, status: u.status === 'ativo' ? 'inativo' : 'ativo' })}
                        className="text-xs text-gray-400 hover:text-gray-600">
                        {u.status === 'ativo' ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={novoModal} onClose={() => setNovoModal(false)} title="Novo Usuário" size="lg">
        <form onSubmit={handleSubmit(d => criar.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome</label><input {...register('nome', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label><input {...register('sobrenome', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label><input {...register('email', { required: true })} type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">CPF</label><input {...register('cpf', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label><input {...register('telefone', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Bloco</label><input {...register('bloco', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Apartamento</label><input {...register('apartamento', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select {...register('tipo')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]">
                <option value="condomino">Condômino</option><option value="sindico">Síndico</option><option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Senha</label><input {...register('password', { required: true })} type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" /></div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setNovoModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D6A4F]">Criar</button>
          </div>
        </form>
      </Modal>

      {editUser && (
        <Modal isOpen onClose={() => setEditUser(null)} title="Editar Usuário" size="lg">
          <form onSubmit={subEdit(d => atualizar.mutate({ id: editUser.id, ...d }))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome</label><input {...regEdit('nome')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label><input {...regEdit('sobrenome')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select {...regEdit('tipo')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]">
                  <option value="condomino">Condômino</option><option value="sindico">Síndico</option><option value="admin">Admin</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select {...regEdit('status')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]">
                  <option value="ativo">Ativo</option><option value="inativo">Inativo</option><option value="pendente">Pendente</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2D6A4F]">Salvar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
