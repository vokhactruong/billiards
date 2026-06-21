import { useState } from 'react'
import { useTables, useCreateTable, useDeleteTable, useUpdateTableName } from '@/hooks/useTables'
import { TableCard } from '@/components/shared/TableCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Table } from '@/types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

function AddTableDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('60000')
  const createTable = useCreateTable()

  const handleSubmit = async () => {
    if (!name.trim()) return
    await createTable.mutateAsync({ name: name.trim(), pricePerHour: parseFloat(price) })
    setName('')
    setPrice('60000')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Thêm bàn mới</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tên bàn</Label>
            <Input
              placeholder="Ví dụ: Bàn 7"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Giá thuê (VND/giờ)</Label>
            <Input
              type="number"
              min={1000}
              step={1000}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {parseFloat(price) > 0 ? formatCurrency(parseFloat(price)) + '/giờ' : ''}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !price || createTable.isPending}
          >
            {createTable.isPending ? 'Đang tạo...' : 'Tạo bàn'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EditTableDialog({
  table,
  onClose,
}: {
  table: Table | null
  onClose: () => void
}) {
  const [name, setName] = useState(table?.name ?? '')
  const updateName = useUpdateTableName()

  const handleSubmit = async () => {
    if (!table || !name.trim()) return
    await updateName.mutateAsync({ id: table.id, name: name.trim() })
    onClose()
  }

  return (
    <Dialog open={!!table} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Đổi tên bàn</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Tên bàn mới</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || updateName.isPending}>
            {updateName.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DeleteConfirmDialog({
  table,
  onClose,
}: {
  table: Table | null
  onClose: () => void
}) {
  const deleteTable = useDeleteTable()

  const handleDelete = async () => {
    if (!table) return
    await deleteTable.mutateAsync(table.id)
    onClose()
  }

  return (
    <Dialog open={!!table} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Xoá bàn</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Bạn có chắc muốn xoá <span className="font-bold text-foreground">{table?.name}</span>? Hành động này không thể hoàn tác.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteTable.isPending}>
            {deleteTable.isPending ? 'Đang xoá...' : 'Xoá bàn'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function Tables() {
  const { user } = useAuth()
  const { data: tables, isLoading } = useTables()
  const [addOpen, setAddOpen] = useState(false)
  const [editTable, setEditTable] = useState<Table | null>(null)
  const [deleteTable, setDeleteTable] = useState<Table | null>(null)

  const isOwner = user?.role === 'OWNER'

  const available = tables?.filter((t) => t.status === 'AVAILABLE').length ?? 0
  const playing = tables?.filter((t) => t.status === 'PLAYING').length ?? 0
  const paused = tables?.filter((t) => t.status === 'PAUSED').length ?? 0

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Quản lý Bàn Bida</h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            {tables?.length ?? 0} bàn · Mở, đóng, chuyển bàn realtime
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1.5">
            <Badge variant="secondary" className="text-xs">{available} Trống</Badge>
            <Badge variant="success" className="text-xs">{playing} Đang chơi</Badge>
            <Badge variant="warning" className="text-xs">{paused} Dừng</Badge>
          </div>
          {isOwner && (
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Thêm bàn
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-zinc-900 border border-zinc-700 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
          {tables?.map((table) => (
            <div key={table.id} className="relative group">
              <TableCard table={table} />
              {isOwner && table.status === 'AVAILABLE' && (
                <div className="absolute top-10 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditTable(table) }}
                    className="flex h-6 w-6 items-center justify-center rounded bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-600 backdrop-blur-sm"
                    title="Đổi tên"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTable(table) }}
                    className="flex h-6 w-6 items-center justify-center rounded bg-zinc-800/90 hover:bg-red-900 hover:text-red-400 border border-zinc-600 backdrop-blur-sm"
                    title="Xoá bàn"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {isOwner && (
            <button
              onClick={() => setAddOpen(true)}
              className="flex min-h-[11rem] md:min-h-[13rem] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-700 text-zinc-600 hover:border-green-700 hover:text-green-500 transition-all duration-200 hover:bg-green-950/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-current">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium tracking-wide uppercase">Thêm bàn</span>
            </button>
          )}
        </div>
      )}

      <AddTableDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <EditTableDialog table={editTable} onClose={() => setEditTable(null)} />
      <DeleteConfirmDialog table={deleteTable} onClose={() => setDeleteTable(null)} />
    </div>
  )
}
