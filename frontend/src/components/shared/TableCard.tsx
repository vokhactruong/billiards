import { useState } from 'react'
import { Table } from '@/types'
import { Button } from '@/components/ui/button'
import { BilliardTableSVG } from './BilliardTableSVG'
import { useTimer } from './Timer'
import { calcOrderTotal, formatCurrency, cn } from '@/lib/utils'
import { useOpenTable, usePauseTable, useResumeTable } from '@/hooks/useTables'
import { OrderDialog } from './OrderDialog'
import { CheckoutDialog } from './CheckoutDialog'
import { TransferDialog } from './TransferDialog'
import { Play, Pause, ShoppingCart, CreditCard, ArrowRightLeft } from 'lucide-react'

interface Props {
  table: Table
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

function ActiveTableCard({ table }: Props) {
  const [orderOpen, setOrderOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)

  const pauseTable = usePauseTable()
  const resumeTable = useResumeTable()

  const session = table.sessions[0]
  const { timerText, amountText } = useTimer(session, table)
  const foodTotal = calcOrderTotal(session.orders || [])
  const foodText = foodTotal > 0 ? `+ ${formatCurrency(foodTotal)} đồ ăn` : undefined

  return (
    <>
      <div
        className={cn(
          'flex flex-col rounded-2xl border bg-zinc-900 overflow-hidden transition-all duration-300',
          cardBorder[table.status]
        )}
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
            timerText={timerText}
            amountText={amountText}
            foodText={foodText}
          />
        </div>

        {/* Action Buttons */}
        <div className="px-3 pb-3 grid grid-cols-3 gap-1.5">
          {table.status === 'PLAYING' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-yellow-800 text-yellow-400 hover:bg-yellow-900/30 hover:text-yellow-300"
                onClick={() => pauseTable.mutate(table.id)}
                disabled={pauseTable.isPending}
              >
                <Pause className="h-3 w-3 mr-1" />
                Dừng
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-blue-800 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300"
                onClick={() => setOrderOpen(true)}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                Món
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-red-800 text-red-400 hover:bg-red-900/30 hover:text-red-300"
                onClick={() => setCheckoutOpen(true)}
              >
                <CreditCard className="h-3 w-3 mr-1" />
                TT
              </Button>
            </>
          )}

          {table.status === 'PAUSED' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-green-800 text-green-400 hover:bg-green-900/30 hover:text-green-300"
                onClick={() => resumeTable.mutate(table.id)}
                disabled={resumeTable.isPending}
              >
                <Play className="h-3 w-3 mr-1" />
                Tiếp
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-purple-800 text-purple-400 hover:bg-purple-900/30 hover:text-purple-300"
                onClick={() => setTransferOpen(true)}
              >
                <ArrowRightLeft className="h-3 w-3 mr-1" />
                Chuyển
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-red-800 text-red-400 hover:bg-red-900/30 hover:text-red-300"
                onClick={() => setCheckoutOpen(true)}
              >
                <CreditCard className="h-3 w-3 mr-1" />
                TT
              </Button>
            </>
          )}
        </div>
      </div>

      <OrderDialog open={orderOpen} onClose={() => setOrderOpen(false)} session={session} />
      <CheckoutDialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} session={session} table={table} />
      <TransferDialog open={transferOpen} onClose={() => setTransferOpen(false)} fromTableId={table.id} />
    </>
  )
}

function AvailableTableCard({ table }: Props) {
  const openTable = useOpenTable()

  return (
    <button
      className={cn(
        'flex flex-col rounded-2xl border bg-zinc-900 overflow-hidden transition-all duration-300 w-full text-left',
        'border-zinc-700 hover:border-green-700 hover:shadow-[0_0_20px_rgba(34,197,94,0.12)]',
        openTable.isPending && 'opacity-60 cursor-wait'
      )}
      onClick={() => !openTable.isPending && openTable.mutate(table.id)}
      disabled={openTable.isPending}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <span className="font-bold text-sm tracking-wide">{table.name}</span>
        <div className="flex items-center gap-1.5">
          <span className={cn('h-2 w-2 rounded-full', statusDot.AVAILABLE)} />
          <span className="text-xs text-muted-foreground">Trống</span>
        </div>
      </div>

      {/* Billiard Table Visual */}
      <div className="px-3 py-1">
        <BilliardTableSVG status="AVAILABLE" />
      </div>

      {/* Open hint */}
      <div className="px-3 pb-3">
        <div className="flex items-center justify-center gap-1.5 h-8 rounded-lg border border-dashed border-green-800 text-green-600 hover:border-green-500 hover:text-green-400 transition-colors text-xs font-medium">
          <Play className="h-3 w-3" />
          {openTable.isPending ? 'Đang mở...' : 'Mở bàn'}
        </div>
      </div>
    </button>
  )
}

export function TableCard({ table }: Props) {
  if (table.status === 'AVAILABLE') {
    return <AvailableTableCard table={table} />
  }
  return <ActiveTableCard table={table} />
}
