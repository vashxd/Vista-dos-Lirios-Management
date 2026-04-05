import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(date))
}

export function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'agora mesmo'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min atrás`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`
  return `${Math.floor(seconds / 86400)}d atrás`
}

export const prioridadeColor: Record<string, string> = {
  baixa: 'green', media: 'blue', alta: 'yellow', urgente: 'red'
}

export const statusColor: Record<string, string> = {
  aberto: 'blue', em_andamento: 'yellow', aguardando: 'gray',
  resolvido: 'green', fechado: 'gray',
  pendente: 'yellow', aprovada: 'green', rejeitada: 'red', cancelada: 'gray',
  aguardando_retirada: 'yellow', retirada: 'green',
}

export const statusLabel: Record<string, string> = {
  aberto: 'Aberto', em_andamento: 'Em Andamento', aguardando: 'Aguardando',
  resolvido: 'Resolvido', fechado: 'Fechado',
  pendente: 'Pendente', aprovada: 'Aprovada', rejeitada: 'Rejeitada', cancelada: 'Cancelada',
  aguardando_retirada: 'Aguardando', retirada: 'Retirada',
  ativo: 'Ativo', inativo: 'Inativo',
}
