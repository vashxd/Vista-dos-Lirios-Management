import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { User, Car, PawPrint, Plus } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function Perfil() {
  const { user, setAuth, token } = useAuthStore()
  const [tab, setTab] = useState<'dados' | 'veiculos' | 'pets'>('dados')
  const { register, handleSubmit } = useForm({ defaultValues: { nome: user?.nome, sobrenome: user?.sobrenome, telefone: user?.telefone } })

  const salvar = useMutation({
    mutationFn: (data: any) => api.put('/perfil', data),
    onSuccess: (res) => { setAuth(res.data.user, token!); toast.success('Perfil atualizado!') },
  })

  const tabs = [
    { id: 'dados', icon: User, label: 'Dados Pessoais' },
    { id: 'veiculos', icon: Car, label: 'Veículos' },
    { id: 'pets', icon: PawPrint, label: 'Pets' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5">
        <Avatar name={`${user?.nome} ${user?.sobrenome}`} src={user?.foto} size="lg" />
        <div>
          <p className="text-lg font-bold text-gray-900">{user?.nome} {user?.sobrenome}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="green" className="capitalize">{user?.tipo}</Badge>
            <Badge variant="gray">Bloco {user?.bloco} · Apto {user?.apartamento}</Badge>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === t.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'dados' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <form onSubmit={handleSubmit(d => salvar.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input {...register('nome')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                <input {...register('sobrenome')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input {...register('telefone')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input value={user?.email} disabled className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input value={user?.cpf} disabled className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400" />
              </div>
            </div>
            <button type="submit" className="bg-[#1B4332] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#2D6A4F]">
              Salvar alterações
            </button>
          </form>
        </div>
      )}

      {tab === 'veiculos' && <VeiculosTab />}
      {tab === 'pets' && <PetsTab />}
    </div>
  )
}

function VeiculosTab() {
  const { data: veiculos = [] } = useQuery({ queryKey: ['veiculos'], queryFn: () => api.get('/veiculos').then(r => r.data) })
  const [modal, setModal] = useState(false)
  const { register, handleSubmit, reset } = useForm<any>()
  const qc = useQueryClient()
  const criar = useMutation({ mutationFn: (d: any) => api.post('/veiculos', d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['veiculos'] }); setModal(false); reset(); toast.success('Veículo cadastrado!') } })
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Meus Veículos</h3>
        <button onClick={() => setModal(true)} className="bg-[#1B4332] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#2D6A4F] flex items-center gap-1"><Plus size={12} /> Adicionar</button>
      </div>
      {veiculos.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">Nenhum veículo cadastrado</p> : veiculos.map((v: any) => (
        <div key={v.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <Car size={16} className="text-gray-400" />
          <div><p className="text-sm font-medium text-gray-900">{v.modelo} · {v.cor}</p><p className="text-xs text-gray-400">{v.placa}{v.vaga ? ` · Vaga ${v.vaga}` : ''}</p></div>
        </div>
      ))}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Cadastrar Veículo" size="sm">
        <form onSubmit={handleSubmit(d => criar.mutate(d))} className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Placa</label><input {...register('placa', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label><input {...register('modelo', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Cor</label><input {...register('cor', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Vaga</label><input {...register('vaga')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" /></div>
          <div className="flex gap-2 justify-end pt-2"><button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button><button type="submit" className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium">Salvar</button></div>
        </form>
      </Modal>
    </div>
  )
}

function PetsTab() {
  const { data: pets = [] } = useQuery({ queryKey: ['pets'], queryFn: () => api.get('/pets').then(r => r.data) })
  const [modal, setModal] = useState(false)
  const { register, handleSubmit, reset } = useForm<any>()
  const qc = useQueryClient()
  const criar = useMutation({ mutationFn: (d: any) => api.post('/pets', d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['pets'] }); setModal(false); reset(); toast.success('Pet cadastrado!') } })
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Meus Pets</h3>
        <button onClick={() => setModal(true)} className="bg-[#1B4332] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#2D6A4F] flex items-center gap-1"><Plus size={12} /> Adicionar</button>
      </div>
      {pets.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">Nenhum pet cadastrado</p> : pets.map((p: any) => (
        <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <PawPrint size={16} className="text-gray-400" />
          <div><p className="text-sm font-medium text-gray-900">{p.nome} · {p.raca}</p><p className="text-xs text-gray-400 capitalize">{p.porte}</p></div>
        </div>
      ))}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Cadastrar Pet" size="sm">
        <form onSubmit={handleSubmit(d => criar.mutate(d))} className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome</label><input {...register('nome', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Raça</label><input {...register('raca', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Porte</label>
            <select {...register('porte')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]">
              <option value="pequeno">Pequeno</option><option value="medio">Médio</option><option value="grande">Grande</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2"><button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button><button type="submit" className="bg-[#1B4332] text-white px-4 py-2 rounded-lg text-sm font-medium">Salvar</button></div>
        </form>
      </Modal>
    </div>
  )
}

import { useQuery, useQueryClient } from '@tanstack/react-query'
