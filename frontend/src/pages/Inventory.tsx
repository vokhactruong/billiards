import { useState } from 'react'
import { Product } from '@/types'
import { useProducts } from '@/hooks/useProducts'
import { useInventoryHistory, useImportStock, useAdjustStock } from '@/hooks/useInventory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { PackagePlus, SlidersHorizontal, AlertTriangle } from 'lucide-react'

type ActionType = 'import' | 'adjust'

export default function Inventory() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [action, setAction] = useState<ActionType>('import')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [open, setOpen] = useState(false)

  const { data: products } = useProducts()
  const { data: history } = useInventoryHistory()
  const importStock = useImportStock()
  const adjustStock = useAdjustStock()

  const lowStock = products?.filter((p) => p.stock <= p.minStock)

  const openAction = (p: Product, type: ActionType) => {
    setSelectedProduct(p)
    setAction(type)
    setQuantity('')
    setNote('')
    setOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedProduct || !quantity) return
    const qty = parseInt(quantity)
    if (action === 'import') {
      await importStock.mutateAsync({ id: selectedProduct.id, quantity: qty, note })
    } else {
      await adjustStock.mutateAsync({ id: selectedProduct.id, quantity: qty, note })
    }
    setOpen(false)
  }

  const typeLabel: Record<string, string> = {
    IMPORT: 'Nhập kho',
    ADJUSTMENT: 'Điều chỉnh',
    SALE: 'Bán hàng',
  }
  const typeVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
    IMPORT: 'success',
    ADJUSTMENT: 'warning',
    SALE: 'destructive',
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Kho hàng</h1>
        <p className="text-muted-foreground text-xs md:text-sm">Quản lý tồn kho và lịch sử nhập/xuất</p>
      </div>

      {lowStock && lowStock.length > 0 && (
        <Card className="border-red-800">
          <CardHeader className="pb-2 p-3 md:p-4">
            <CardTitle className="text-sm text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Cảnh báo hàng sắp hết ({lowStock.length} sản phẩm)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-4 md:pb-4 pt-0">
            <div className="flex flex-wrap gap-2">
              {lowStock.map((p) => (
                <div key={p.id} className="rounded border border-red-800 px-2 py-1 text-xs">
                  {p.name}: <span className="text-red-400 font-bold">{p.stock}</span>/{p.minStock}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Danh sách sản phẩm</h2>
          <div className="space-y-2">
            {products?.map((p) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 rounded-lg border p-3 ${p.stock <= p.minStock ? 'border-red-800' : ''}`}
              >
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-md object-cover shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-md bg-zinc-800 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Giá vốn: {formatCurrency(Number(p.costPrice))} · Bán: {formatCurrency(Number(p.sellingPrice))}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <p className={`font-bold text-sm ${p.stock <= p.minStock ? 'text-red-400' : ''}`}>{p.stock}</p>
                    <p className="text-xs text-muted-foreground">tồn kho</p>
                  </div>
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => openAction(p, 'import')}>
                    <PackagePlus className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => openAction(p, 'adjust')}>
                    <SlidersHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Lịch sử giao dịch</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {history?.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">{tx.product?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(tx.createdAt), 'dd/MM HH:mm')} · {tx.note || '-'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={typeVariant[tx.type]} className="text-xs">{typeLabel[tx.type]}</Badge>
                  <span className={`font-bold ${tx.quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {action === 'import' ? 'Nhập kho' : 'Điều chỉnh tồn kho'} - {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Số lượng {action === 'adjust' && '(âm để giảm)'}</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={action === 'adjust' ? 'Ví dụ: -5 hoặc 10' : 'Số lượng nhập...'}
              />
            </div>
            <div className="space-y-2">
              <Label>Ghi chú (tuỳ chọn)</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nhập ghi chú..." />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Hủy</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={!quantity || importStock.isPending || adjustStock.isPending}>
              Xác nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
