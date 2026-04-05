import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  if (src) return <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size], className)} />
  return (
    <div className={cn('rounded-full bg-[#1B4332] text-white flex items-center justify-center font-semibold flex-shrink-0', sizes[size], className)}>
      {initials}
    </div>
  )
}
