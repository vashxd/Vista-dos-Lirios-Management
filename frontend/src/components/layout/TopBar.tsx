import { Menu, Bell, LogOut, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'

interface TopBarProps {
  onMenuClick: () => void
  title: string
}

export function TopBar({ onMenuClick, title }: TopBarProps) {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const [dark, setDark] = useState(false)

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {}
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-4 sticky top-0 z-20">
      <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100 lg:hidden">
        <Menu size={20} className="text-gray-600" />
      </button>
      <h1 className="text-base font-semibold text-gray-900 flex-1">{title}</h1>
      <div className="flex items-center gap-1">
        <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Sair">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
