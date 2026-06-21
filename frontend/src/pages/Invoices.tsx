import { useState } from 'react'
import { useInvoices, useInvoice } from '@/hooks/useInvoices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency, formatDuration } from '@/lib/utils'
import { format } from 'date-fns'
import { Eye, Printer, Search } from 'lucide-react'

function InvoiceDetailDialog({ invoiceId, onClose }: { invoiceId: number | null; onClose: () => void }) {
  const { data: invoice } = useInvoice(invoiceId)

  if (!invoice) return null

  return (
    <Dialog open={!!invoiceId} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hóa đơn #{invoice.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="rounded-lg border p-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bàn:</span>
              <span className="font-medium">{invoice.session.table.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Thời gian chơi:</span>
              <span>{formatDuration(invoice.duration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ngày:</span>
              <span>{format(new Date(invoice.createdAt), 'dd/MM/yyyy HH:mm')}</span>
            </div>
          </div>

          {invoice.invoiceItems.length > 0 && (
            <div>
              <p className="font-semibold mb-2">Chi tiết đồ ăn:</p>
              <div className="space-y-1">
                {invoice.invoiceItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>{formatCurrency(Number(item.unitPrice) * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border p-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tiền bàn:</span>
              <span>{formatCurrency(Number(invoice.tableAmount))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tiền đồ ăn:</span>
              <span>{formatCurrency(Number(invoice.foodAmount))}</span>
            </div>
            {Number(invoice.discount) > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Giảm giá:</span>
                <span>-{formatCurrency(Number(invoice.discount))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t pt-1 mt-1">
              <span>Tổng cộng:</span>
              <span className="text-green-400">{formatCurrency(Number(invoice.totalAmount))}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> In hóa đơn
          </Button>
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function Invoices() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { data, isLoading } = useInvoices()

  const invoices = data?.data ?? []
  const filtered = invoices.filter((inv) =>
    inv.session.table.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Hóa đơn</h1>
        <p className="text-muted-foreground text-xs md:text-sm">Lịch sử thanh toán</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên bàn..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tổng: {filtered.length} hóa đơn</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filtered.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-4 md:px-6 py-3 hover:bg-accent/30 transition-colors">
                  <div>
                    <p className="font-medium text-sm">
                      #{inv.id} · {inv.session.table.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(inv.createdAt), 'dd/MM/yyyy HH:mm')} · {formatDuration(inv.duration)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-green-400">{formatCurrency(Number(inv.totalAmount))}</span>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSelectedId(inv.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  Không có hóa đơn nào
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <InvoiceDetailDialog invoiceId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}
