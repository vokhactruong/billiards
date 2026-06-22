import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProducts } from '@/hooks/useProducts'
import { useCreateOrder } from '@/hooks/useOrders'
import { formatCurrency } from '@/lib/utils'
import { Plus, Minus, ShoppingCart } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  sessionId: number
  tableId: number
}

interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
}

export function OrderDialog({ open, onClose, sessionId, tableId }: Props) {
  const [cart, setCart] = useState<CartItem[]>([])
  const { data: products } = useProducts()
  const createOrder = useCreateOrder()

  const addToCart = (productId: number, name: string, price: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (existing) return prev.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { productId, name, price, quantity: 1 }]
    })
  }

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId))
    } else {
      setCart((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: qty } : i))
    }
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  const handleSubmit = async () => {
    if (cart.length === 0) return
    await createOrder.mutateAsync({
      sessionId,
      tableId,
      items: cart.map(({ productId, quantity }) => ({ productId, quantity })),
    })
    setCart([])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Đặt món
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 sm:max-h-80 overflow-y-auto">
          {products?.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => addToCart(p.id, p.name, Number(p.sellingPrice))}
            >
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(Number(p.sellingPrice))}</p>
                <p className="text-xs text-muted-foreground">Còn: {p.stock}</p>
              </div>
              <Button size="icon" variant="outline" className="h-7 w-7">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="border-t pt-3 space-y-2">
            <p className="text-sm font-semibold">Giỏ hàng:</p>
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center gap-2 text-sm">
                <span className="flex-1">{item.name}</span>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQty(item.productId, item.quantity - 1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    className="h-6 w-12 text-center text-xs px-1"
                    value={item.quantity}
                    onChange={(e) => updateQty(item.productId, parseInt(e.target.value) || 0)}
                  />
                  <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQty(item.productId, item.quantity + 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <span className="w-24 text-right">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-1 border-t">
              <span>Tổng:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={cart.length === 0 || createOrder.isPending}>
            {createOrder.isPending ? 'Đang xử lý...' : 'Xác nhận đặt món'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
