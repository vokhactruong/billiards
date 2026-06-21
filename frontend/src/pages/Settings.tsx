import { useState } from 'react'
import { useTables } from '@/hooks/useTables'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/axios'
import { useQueryClient } from '@tanstack/react-query'

export default function Settings() {
  const { data: tables } = useTables()
  const qc = useQueryClient()
  const [prices, setPrices] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState<number | null>(null)

  const savePrice = async (tableId: number) => {
    const price = prices[tableId]
    if (!price) return
    setSaving(tableId)
    try {
      await api.put(`/tables/${tableId}/price`, { pricePerHour: parseFloat(price) })
      qc.invalidateQueries({ queryKey: ['tables'] })
      setPrices((prev) => ({ ...prev, [tableId]: '' }))
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Cài đặt</h1>
        <p className="text-muted-foreground text-xs md:text-sm">Cấu hình giá bàn và thông số hệ thống</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Giá thuê bàn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {tables?.map((table) => (
              <div key={table.id} className="rounded-lg border p-4 space-y-3">
                <div>
                  <p className="font-semibold">{table.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Hiện tại: <span className="text-foreground font-medium">{formatCurrency(Number(table.pricePerHour))}/giờ</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Giá mới (VND/giờ)</Label>
                    <Input
                      type="number"
                      placeholder="Nhập giá mới..."
                      value={prices[table.id] || ''}
                      onChange={(e) => setPrices((prev) => ({ ...prev, [table.id]: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={() => savePrice(table.id)}
                      disabled={!prices[table.id] || saving === table.id}
                    >
                      {saving === table.id ? '...' : 'Lưu'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin hệ thống</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Phiên bản</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Tổng số bàn</span>
            <span>{tables?.length ?? 0} bàn</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Tech stack</span>
            <span className="text-muted-foreground">React + Node.js + PostgreSQL</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
