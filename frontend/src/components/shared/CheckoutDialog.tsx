import { useState, useEffect } from 'react'
import { Table, TableSession } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCheckout } from '@/hooks/useInvoices'
import { calcElapsedMs, calcTableAmount, calcOrderTotal, formatCurrency, formatTimer } from '@/lib/utils'
import { Receipt } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  session: TableSession
  table: Table
}

export function CheckoutDialog({ open, onClose, session, table }: Props) {
  const [discount, setDiscount] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const checkout = useCheckout()

  useEffect(() => {
    if (!open) return
    const update = () => setElapsed(calcElapsedMs(session))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [open, session])

  const tableAmount = calcTableAmount(elapsed, Number(table.pricePerHour))
  const foodAmount = calcOrderTotal(session.orders || [])
  const total = Math.max(0, tableAmount + foodAmount - discount)

  const handleCheckout = async () => {
    await checkout.mutateAsync({ sessionId: session.id, discount })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Thanh toán - {table.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Thời gian chơi:</span>
              <span className="font-mono">{formatTimer(elapsed)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tiền bàn ({formatCurrency(Number(table.pricePerHour))}/h):</span>
              <span className="font-semibold">{formatCurrency(tableAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tiền đồ ăn:</span>
              <span className="font-semibold">{formatCurrency(foodAmount)}</span>
            </div>

            <div className="space-y-1 pt-2 border-t">
              <Label>Giảm giá (VND)</Label>
              <Input
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>

            <div className="flex justify-between text-base font-bold pt-2 border-t">
              <span>Tổng cộng:</span>
              <span className="text-green-400 text-lg">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Hủy</Button>
          <Button className="flex-1" onClick={handleCheckout} disabled={checkout.isPending}>
            {checkout.isPending ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
