import { cn } from '@/lib/utils'

interface GoldFrameProps {
  children: React.ReactNode
  className?: string
}

export function GoldFrame({ children, className }: GoldFrameProps) {
  return (
    <div
      className={cn('rounded-sm p-3 shadow-xl', className)}
      style={{
        background: 'linear-gradient(145deg, #d4a843, #b8860b, #daa520, #cd950c, #b8860b)',
      }}
    >
      <div
        className="h-full rounded-[1px] p-1"
        style={{
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.2)',
        }}
      >
        <div
          className="h-full bg-white"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
