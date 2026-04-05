import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Download, Search } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import type { Documento } from '@/types'

const categorias = ['convencao', 'regimento', 'ata', 'balanco', 'seguro', 'contrato', 'laudo', 'edital']
const catLabel: Record<string, string> = {
  convencao: 'Convenção', regimento: 'Regimento', ata: 'Ata', balanco: 'Balanço',
  seguro: 'Seguro', contrato: 'Contrato', laudo: 'Laudo', edital: 'Edital'
}
const catColor: Record<string, 'blue' | 'green' | 'yellow' | 'gray' | 'gold'> = {
  convencao: 'blue', regimento: 'green', ata: 'yellow', balanco: 'gold',
  seguro: 'gray', contrato: 'gray', laudo: 'gray', edital: 'gray'
}

function formatBytes(bytes?: number) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function Documentos() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('')

  const { data: documentos = [], isLoading } = useQuery<Documento[]>({
    queryKey: ['documentos', search, cat],
    queryFn: () => api.get('/documentos', { params: { search, categoria: cat } }).then(r => r.data),
  })

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar documentos..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" />
        </div>
        <select value={cat} onChange={e => setCat(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]">
          <option value="">Todas categorias</option>
          {categorias.map(c => <option key={c} value={c}>{catLabel[c]}</option>)}
        </select>
      </div>

      {isLoading ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />) :
        documentos.length === 0 ? <EmptyState icon={FileText} title="Nenhum documento" description="Nenhum documento encontrado com esses filtros." /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documentos.map(d => (
              <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
                <div className="w-11 h-11 bg-[#D8F3DC] rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-[#1B4332]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{d.titulo}</p>
                    <Badge variant={catColor[d.categoria] ?? 'gray'}>{catLabel[d.categoria] ?? d.categoria}</Badge>
                  </div>
                  {d.descricao && <p className="text-xs text-gray-500 mb-1">{d.descricao}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{formatDate(d.created_at)}</span>
                    {d.versao > 1 && <span>v{d.versao}</span>}
                    {d.tamanho && <span>{formatBytes(d.tamanho)}</span>}
                  </div>
                </div>
                <a href={`/api/documentos/${d.id}/download`} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#1B4332] transition-colors">
                  <Download size={16} />
                </a>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
