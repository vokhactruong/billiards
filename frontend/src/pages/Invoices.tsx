import { useState, useEffect, useCallback } from 'react'
import { useInvoices, useInvoice, useUpdateInvoice, useDeleteInvoice } from '@/hooks/useInvoices'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency, formatDuration } from '@/lib/utils'
import { Invoice } from '@/types'
import { format } from 'date-fns'
import { Eye, Printer, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const PAGE_SIZE_OPTIONS = [10, 20, 50]

// ─── Invoice Detail Dialog ─────────────────────────────────────────────────────

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
          <div className="rounded-lg border p-3 space-y-1.5">
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
              <div className="space-y-1 rounded-lg border p-3">
                {invoice.invoiceItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-muted-foreground">{item.product.name} ×{item.quantity}</span>
                    <span>{formatCurrency(Number(item.unitPrice) * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border p-3 space-y-1.5">
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
                <span>−{formatCurrency(Number(invoice.discount))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t pt-2 mt-1">
              <span>Tổng cộng:</span>
              <span className="text-green-400">{formatCurrency(Number(invoice.totalAmount))}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> In
          </Button>
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Discount Dialog ──────────────────────────────────────────────────────

function EditDiscountDialog({ invoice, onClose }: { invoice: Invoice | null; onClose: () => void }) {
  const [discount, setDiscount] = useState('')
  const updateInvoice = useUpdateInvoice()

  useEffect(() => {
    if (invoice) setDiscount(String(Number(invoice.discount)))
  }, [invoice])

  if (!invoice) return null

  const discountNum = Math.max(0, parseFloat(discount) || 0)
  const newTotal = Math.max(0, Number(invoice.tableAmount) + Number(invoice.foodAmount) - discountNum)

  const handleSave = async () => {
    await updateInvoice.mutateAsync({ id: invoice.id, discount: discountNum })
    onClose()
  }

  return (
    <Dialog open={!!invoice} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Sửa hóa đơn #{invoice.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="rounded-lg border p-3 space-y-1.5 text-muted-foreground">
            <div className="flex justify-between">
              <span>Bàn:</span>
              <span className="text-foreground font-medium">{invoice.session.table.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Tiền bàn:</span>
              <span>{formatCurrency(Number(invoice.tableAmount))}</span>
            </div>
            <div className="flex justify-between">
              <span>Tiền đồ ăn:</span>
              <span>{formatCurrency(Number(invoice.foodAmount))}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="discount">Giảm giá (đ)</Label>
            <Input
              id="discount"
              type="number"
              min={0}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Tổng cộng mới:</span>
            <span className="text-green-400">{formatCurrency(newTotal)}</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button onClick={handleSave} disabled={updateInvoice.isPending}>
            {updateInvoice.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete Confirm Dialog ─────────────────────────────────────────────────────

function DeleteConfirmDialog({ invoice, onClose }: { invoice: Invoice | null; onClose: () => void }) {
  const deleteInvoice = useDeleteInvoice()

  if (!invoice) return null

  const handleDelete = async () => {
    await deleteInvoice.mutateAsync(invoice.id)
    onClose()
  }

  return (
    <Dialog open={!!invoice} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Xoá hóa đơn #{invoice.id}?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Hóa đơn bàn <span className="font-medium text-foreground">{invoice.session.table.name}</span> —{' '}
          <span className="text-green-400 font-semibold">{formatCurrency(Number(invoice.totalAmount))}</span>.
          Thao tác này không thể hoàn tác.
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteInvoice.isPending}>
            {deleteInvoice.isPending ? 'Đang xoá...' : 'Xoá'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Pagination Component ──────────────────────────────────────────────────────

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  isLoading: boolean
  onPageChange: (p: number) => void
  onLimitChange: (l: number) => void
}

function Pagination({ page, totalPages, total, limit, isLoading, onPageChange, onLimitChange }: PaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  // Generate page number buttons with ellipsis
  const getPages = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages]
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', page - 1, page, page + 1, '...', totalPages]
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      {/* Info + page size */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className={cn('transition-opacity', isLoading && 'opacity-40')}>
          {total === 0 ? 'Không có kết quả' : `${start}–${end} / ${total} hóa đơn`}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs">Hiển thị:</span>
          <div className="flex gap-1">
            {PAGE_SIZE_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { onLimitChange(s); onPageChange(1) }}
                className={cn(
                  'h-6 min-w-6 px-1.5 rounded text-xs transition-colors',
                  limit === s
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Page buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            disabled={page === 1 || isLoading}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            disabled={page === 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          {/* Desktop: numbered pages */}
          <div className="hidden sm:flex items-center gap-1">
            {getPages().map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  disabled={isLoading}
                  className={cn(
                    'h-7 min-w-7 px-2 rounded text-xs font-medium transition-colors',
                    page === p
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  )}
                >
                  {p}
                </button>
              )
            )}
          </div>

          {/* Mobile: page indicator */}
          <span className="sm:hidden text-xs text-muted-foreground px-2">
            {page} / {totalPages}
          </span>

          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            disabled={page === totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            disabled={page === totalPages || isLoading}
            onClick={() => onPageChange(totalPages)}
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Skeleton Row ──────────────────────────────────────────────────────────────

function SkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border last:border-0">
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-zinc-800 animate-pulse" />
            <div className="h-3 w-48 rounded bg-zinc-800 animate-pulse opacity-60" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3.5 w-20 rounded bg-zinc-800 animate-pulse" />
            <div className="h-7 w-7 rounded bg-zinc-800 animate-pulse" />
          </div>
        </div>
      ))}
    </>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Invoices() {
  const { user } = useAuth()
  const isOwner = user?.role === 'OWNER'

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null)

  // Debounce search → reset to page 1
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading, isFetching } = useInvoices({
    page,
    limit,
    search: debouncedSearch || undefined,
  })

  const invoices = data?.data ?? []
  const meta = data?.meta

  const handlePageChange = useCallback((p: number) => setPage(p), [])
  const handleLimitChange = useCallback((l: number) => setLimit(l), [])

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Hóa đơn</h1>
        <p className="text-muted-foreground text-xs md:text-sm">Lịch sử thanh toán</p>
      </div>

      {/* Search bar */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Tìm theo tên bàn..."
          className="pl-9 pr-8 h-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Table */}
      <Card className={cn('transition-opacity duration-150', isFetching && !isLoading && 'opacity-70')}>
        <CardHeader className="p-3 md:p-4 pb-0">
          <CardTitle className="text-sm text-muted-foreground font-normal">
            {meta
              ? `${meta.total} hóa đơn${debouncedSearch ? ` · tìm kiếm "${debouncedSearch}"` : ''}`
              : 'Đang tải...'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-2">
          <div className="divide-y divide-border">
            {isLoading ? (
              <SkeletonRows count={limit} />
            ) : invoices.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground space-y-1">
                <p className="text-sm">Không có hóa đơn nào</p>
                {debouncedSearch && (
                  <p className="text-xs">Thử tìm kiếm với từ khóa khác</p>
                )}
              </div>
            ) : (
              invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between px-4 md:px-6 py-3 hover:bg-accent/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm">
                      <span className="text-muted-foreground">#{inv.id}</span>
                      {' · '}
                      {inv.session.table.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(inv.createdAt), 'dd/MM/yyyy HH:mm')}
                      {' · '}
                      {formatDuration(inv.duration)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-3">
                    <span className="font-bold text-green-400 text-sm mr-1.5">
                      {formatCurrency(Number(inv.totalAmount))}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setSelectedId(inv.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {isOwner && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditingInvoice(inv)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeletingInvoice(inv)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {(meta && (meta.totalPages > 1 || invoices.length > 0)) && (
            <div className="px-4 md:px-6 py-3 border-t border-border">
              <Pagination
                page={page}
                totalPages={meta.totalPages}
                total={meta.total}
                limit={limit}
                isLoading={isFetching}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <InvoiceDetailDialog invoiceId={selectedId} onClose={() => setSelectedId(null)} />
      <EditDiscountDialog invoice={editingInvoice} onClose={() => setEditingInvoice(null)} />
      <DeleteConfirmDialog invoice={deletingInvoice} onClose={() => setDeletingInvoice(null)} />
    </div>
  )
}
