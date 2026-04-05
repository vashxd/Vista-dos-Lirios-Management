import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'admin' | 'sindico' | 'condomino'

export interface User {
  id: number
  nome: string
  sobrenome: string
  email: string
  telefone: string
  cpf: string
  foto?: string
  bloco: string
  apartamento: string
  tipo: UserRole
  status: 'ativo' | 'inativo' | 'pendente'
}

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAdmin: () => boolean
  isSindico: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null })
      },
      isAdmin: () => get().user?.tipo === 'admin',
      isSindico: () => ['admin', 'sindico'].includes(get().user?.tipo ?? ''),
    }),
    { name: 'auth-storage', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
)
