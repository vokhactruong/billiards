import { useTables } from '@/hooks/useTables'
import { useOrders } from '@/hooks/useOrders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { Table } from '@/types'

function SessionOrders({ sessionId }: { sessionId: number }) {
  const { data: orders } = useOrders(sessionId)

  const total = orders?.reduce((sum, o) => {
    return sum + o.orderItems.reduce((s, i) => s + i.quantity * Number(i.unitPrice), 0)
  }, 0) ?? 0

  return (
    <div className="space-y-2">
      {orders?.map((order) => (
        <div key={order.id} className="border rounded p-2 text-xs space-y-1">
          <p className="text-muted-foreground">{format(new Date(order.createdAt), 'HH:mm:ss')}</p>
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.product.name} x{item.quantity}</span>
              <span>{formatCurrency(Number(item.unitPrice) * item.quantity)}</span>
            </div>
          ))}
        </div>
      ))}
      {orders && orders.length > 0 && (
        <div className="flex justify-between font-bold text-sm pt-1 border-t">
          <span>Tổng đồ ăn:</span>
          <span className="text-green-400">{formatCurrency(total)}</span>
        </div>
      )}
      {(!orders || orders.length === 0) && (
        <p className="text-xs text-muted-foreground">Chưa có đơn nào</p>
      )}
    </div>
  )
}

export default function Orders() {
  const { data: tables } = useTables()
  const activeTables = tables?.filter((t): t is Table => t.status !== 'AVAILABLE') ?? []

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Đơn hàng</h1>
        <p className="text-muted-foreground text-xs md:text-sm">Xem đơn hàng theo bàn đang hoạt động</p>
      </div>

      {activeTables.length === 0 ? (
        <div className="flex items-center justify-center h-40 rounded-lg border border-dashed">
          <p className="text-muted-foreground text-sm">Không có bàn nào đang hoạt động</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {activeTables.map((table) => {
            const session = table.sessions?.[0]
            return (
              <Card key={table.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    {table.name}
                    <Badge variant={table.status === 'PLAYING' ? 'success' : 'warning'}>
                      {table.status === 'PLAYING' ? 'Đang chơi' : 'Tạm dừng'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {session ? (
                    <SessionOrders sessionId={session.id} />
                  ) : (
                    <p className="text-xs text-muted-foreground">Không có session</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
