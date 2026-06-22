import { useState } from 'react'
import { TableSummary } from '@/types'
import { BilliardTableSVG } from './BilliardTableSVG'
import { useTimerFromElapsed } from './Timer'
import { cn } from '@/lib/utils'
import { TableDetailModal } from './TableDetailModal'

interface Props {
  table: TableSummary
}

const statusLabel = {
  AVAILABLE: 'Trống',
  PLAYING: 'Đang chơi',
  PAUSED: 'Tạm dừng',
}

const statusDot = {
  AVAILABLE: 'bg-gray-500',
  PLAYING: 'bg-green-500 status-dot-playing',
  PAUSED: 'bg-yellow-400 status-dot-paused',
}

const cardBorder = {
  AVAILABLE: 'border-zinc-700 hover:border-zinc-500',
  PLAYING: 'border-green-800 hover:border-green-600 shadow-[0_0_20px_rgba(34,197,94,0.08)]',
  PAUSED: 'border-yellow-900 hover:border-yellow-700 shadow-[0_0_20px_rgba(234,179,8,0.08)]',
}

export function TableCard({ table }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  const { timerText, amountText } = useTimerFromElapsed(
    table.elapsedMs,
    table.status === 'PAUSED',
    Number(table.pricePerHour)
  )

  return (
    <>
      <div
        className={cn(
          'flex flex-col rounded-2xl border bg-zinc-900 overflow-hidden transition-all duration-300 cursor-pointer select-none',
          cardBorder[table.status]
        )}
        onClick={() => setModalOpen(true)}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          <span className="font-bold text-sm tracking-wide">{table.name}</span>
          <div className="flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-full', statusDot[table.status])} />
            <span className="text-xs text-muted-foreground">{statusLabel[table.status]}</span>
          </div>
        </div>

        {/* Billiard Table Visual */}
        <div className="px-3 py-1">
          <BilliardTableSVG
            status={table.status}
            timerText={table.status !== 'AVAILABLE' ? timerText : undefined}
            amountText={table.status !== 'AVAILABLE' ? amountText : undefined}
          />
        </div>

        {/* Tap hint */}
        <div className="px-3 pb-3">
          <div className={cn(
            'flex items-center justify-center h-7 rounded-lg text-xs font-medium border border-dashed transition-colors',
            table.status === 'AVAILABLE'
              ? 'border-green-800 text-green-600 hover:border-green-500 hover:text-green-400'
              : table.status === 'PLAYING'
              ? 'border-zinc-700 text-zinc-500 hover:border-zinc-500'
              : 'border-yellow-900 text-yellow-700 hover:border-yellow-700'
          )}>
            {table.status === 'AVAILABLE' ? 'Nhấn để mở bàn' : 'Nhấn để xem chi tiết'}
          </div>
        </div>
      </div>

      <TableDetailModal
        table={table}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
