import { useQuery } from '@tanstack/react-query'
import { Phone, AlertCircle } from 'lucide-react'
import { CardSkeleton } from '@/components/ui/Skeleton'
import api from '@/lib/api'
import type { Contato } from '@/types'

const catLabel: Record<string, string> = {
  sindico: 'Síndico', administradora: 'Administradora', portaria: 'Portaria',
  emergencia: 'Emergência', concessionaria: 'Concessionária', prestador: 'Prestador'
}

export function Contatos() {
  const { data: contatos = [], isLoading } = useQuery<Contato[]>({
    queryKey: ['contatos'],
    queryFn: () => api.get('/contatos').then(r => r.data),
  })

  const emergencias = contatos.filter(c => c.emergencia)
  const outros = contatos.filter(c => !c.emergencia)

  return (
    <div className="space-y-6">
      {emergencias.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-red-500" />
            <h3 className="text-sm font-semibold text-gray-700">Emergências</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {emergencias.map(c => (
              <a key={c.id} href={`tel:${c.telefone}`}
                className="bg-white rounded-2xl border-2 border-red-100 p-4 hover:border-red-300 transition-colors flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone size={16} className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{c.nome}</p>
                  <p className="text-sm font-bold text-red-600">{c.telefone}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Contatos do Condomínio</h3>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {outros.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-[#D8F3DC] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone size={14} className="text-[#1B4332]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{c.nome}</p>
                    <p className="text-xs text-gray-400">{catLabel[c.categoria] ?? c.categoria}</p>
                  </div>
                </div>
                <a href={`tel:${c.telefone}`} className="text-sm font-medium text-[#1B4332] hover:underline">{c.telefone}</a>
                {c.descricao && <p className="text-xs text-gray-500 mt-1">{c.descricao}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
