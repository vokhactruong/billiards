import { useState } from 'react'
import { TableSummary } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTableDetail } from '@/hooks/useTableDetail'
import { useTimerFromElapsed } from './Timer'
import { useOpenTable, usePauseTable, useResumeTable } from '@/hooks/useTables'
import { calcOrderTotal, formatCurrency, cn } from '@/lib/utils'
import { OrderDialog } from './OrderDialog'
import { CheckoutDialog } from './CheckoutDialog'
import { TransferDialog } from './TransferDialog'
import { Play, Pause, ShoppingCart, CreditCard, ArrowRightLeft } from 'lucide-react'

interface Props {
  table: TableSummary
  open: boolean
  onClose: () => void
}

const statusLabel = {
  AVAILABLE: 'Trống',
  PLAYING: 'Đang chơi',
  PAUSED: 'Tạm dừng',
}

const statusDot = {
  AVAILABLE: 'bg-gray-500',
  PLAYING: 'bg-green-500 animate-pulse',
  PAUSED: 'bg-yellow-400',
}

export function TableDetailModal({ table, open, onClose }: Props) {
  const isActive = table.status !== 'AVAILABLE'
  const { data: detail, isLoading } = useTableDetail(table.id, open && isActive)

  const { elapsed, timerText, amountText } = useTimerFromElapsed(
    table.elapsedMs,
    table.status === 'PAUSED',
    Number(table.pricePerHour)
  )

  const [orderOpen, setOrderOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)

  const openTable = useOpenTable()
  const pauseTable = usePauseTable()
  const resumeTable = useResumeTable()

  const foodTotal = detail ? calcOrderTotal(detail.orders) : 0

  const handleOpen = () => {
    openTable.mutate(table.id)
    onClose()
  }

  const handlePause = () => {
    pauseTable.mutate(table.id)
    onClose()
  }

  const handleResume = () => {
    resumeTable.mutate(table.id)
    onClose()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          className="max-w-md max-h-[90vh] overflow-y-auto"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', statusDot[table.status])} />
              {table.name}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {statusLabel[table.status]}
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* Timer + amount for active tables */}
          {isActive && (
            <div className="rounded-lg border bg-zinc-900/50 p-4 text-center space-y-1">
              <p className="text-3xl font-mono font-bold tracking-wider text-green-400">
                {timerText}
              </p>
              <p className="text-sm font-semibold text-yellow-400">{amountText}</p>
              {foodTotal > 0 && (
                <p className="text-xs text-muted-foreground">
                  + {formatCurrency(foodTotal)} đồ ăn
                </p>
              )}
            </div>
          )}

          {/* Orders section — lazy loaded */}
          {isActive && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Đồ ăn & thức uống
              </p>
              {isLoading ? (
                <p className="text-sm text-muted-foreground py-3 text-center">Đang tải chi tiết...</p>
              ) : detail && detail.orders.length > 0 ? (
                <div className="space-y-0.5 max-h-36 overflow-y-auto rounded border p-2">
                  {detail.orders.map(order =>
                    order.orderItems.map(item => (
                      <div key={item.id} className="flex justify-between text-sm py-0.5">
                        <span className="text-muted-foreground">
                          {item.product.name} <span className="text-xs">×{item.quantity}</span>
                        </span>
                        <span className="font-medium">
                          {formatCurrency(item.quantity * Number(item.unitPrice))}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-3 text-center">Chưa có đồ ăn</p>
              )}
            </div>
          )}

          {/* Action buttons */}
          {table.status === 'AVAILABLE' && (
            <Button
              className="w-full"
              onClick={handleOpen}
              disabled={openTable.isPending}
            >
              <Play className="h-4 w-4 mr-2" />
              {openTable.isPending ? 'Đang mở...' : 'Mở bàn'}
            </Button>
          )}

          {table.status === 'PLAYING' && (
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="border-yellow-800 text-yellow-400 hover:bg-yellow-900/30 hover:text-yellow-300"
                onClick={handlePause}
                disabled={pauseTable.isPending}
              >
                <Pause className="h-3.5 w-3.5 mr-1" />
                Dừng
              </Button>
              <Button
                variant="outline"
                className="border-blue-800 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300"
                onClick={() => setOrderOpen(true)}
              >
                <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                Món
              </Button>
              <Button
                variant="outline"
                className="border-red-800 text-red-400 hover:bg-red-900/30 hover:text-red-300"
                onClick={() => setCheckoutOpen(true)}
              >
                <CreditCard className="h-3.5 w-3.5 mr-1" />
                TT
              </Button>
            </div>
          )}

          {table.status === 'PAUSED' && (
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="border-green-800 text-green-400 hover:bg-green-900/30 hover:text-green-300"
                onClick={handleResume}
                disabled={resumeTable.isPending}
              >
                <Play className="h-3.5 w-3.5 mr-1" />
                Tiếp
              </Button>
              <Button
                variant="outline"
                className="border-purple-800 text-purple-400 hover:bg-purple-900/30 hover:text-purple-300"
                onClick={() => setTransferOpen(true)}
              >
                <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
                Chuyển
              </Button>
              <Button
                variant="outline"
                className="border-red-800 text-red-400 hover:bg-red-900/30 hover:text-red-300"
                onClick={() => setCheckoutOpen(true)}
              >
                <CreditCard className="h-3.5 w-3.5 mr-1" />
                TT
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs rendered outside the main Dialog to avoid nesting issues */}
      <OrderDialog
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        sessionId={table.currentSessionId!}
        tableId={table.id}
      />

      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => { setCheckoutOpen(false); onClose() }}
        sessionId={table.currentSessionId!}
        elapsed={elapsed}
        orders={detail?.orders ?? []}
        table={table}
      />

      <TransferDialog
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        fromTableId={table.id}
      />
    </>
  )
}
