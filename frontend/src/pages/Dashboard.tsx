import { useDashboardStats } from '@/hooks/useReports'
import { useTables } from '@/hooks/useTables'
import { TableCard } from '@/components/shared/TableCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Table2, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'

export default function Dashboard() {
  const { data: stats } = useDashboardStats()
  const { data: tables, isLoading } = useTables()

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-xs md:text-sm">Quản lý bàn bida realtime</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-3 md:p-4 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground leading-tight">Bàn đang chơi</CardTitle>
            <Table2 className="h-4 w-4 text-green-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-4 md:pb-4 pt-0">
            {stats != null ? (
              <p className="text-2xl font-bold">{stats.activeTables}</p>
            ) : (
              <div className="h-8 w-10 bg-zinc-800 rounded animate-pulse" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-3 md:p-4 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground leading-tight">Hôm nay</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-4 md:pb-4 pt-0">
            {stats != null ? (
              <p className="text-lg md:text-2xl font-bold truncate">{formatCurrency(stats.todayRevenue)}</p>
            ) : (
              <div className="h-8 w-24 bg-zinc-800 rounded animate-pulse" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-3 md:p-4 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground leading-tight">Tháng này</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-4 md:pb-4 pt-0">
            {stats != null ? (
              <p className="text-lg md:text-2xl font-bold truncate">{formatCurrency(stats.monthRevenue)}</p>
            ) : (
              <div className="h-8 w-24 bg-zinc-800 rounded animate-pulse" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-3 md:p-4 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground leading-tight">Sắp hết hàng</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-4 md:pb-4 pt-0">
            {stats != null ? (
              <p className="text-2xl font-bold text-red-400">{stats.lowStockCount}</p>
            ) : (
              <div className="h-8 w-10 bg-zinc-800 rounded animate-pulse" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table Grid */}
      <div>
        <h2 className="text-base md:text-lg font-semibold mb-3">Trạng thái bàn</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[11rem] rounded-2xl bg-zinc-900 border border-zinc-700 animate-pulse p-3">
                <div className="h-3 w-16 bg-zinc-800 rounded mb-3" />
                <div className="h-20 bg-zinc-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
            {tables?.map((table, i) => (
              <div key={table.id} className="card-enter" style={{ animationDelay: `${i * 35}ms` }}>
                <TableCard table={table} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low Stock Warning */}
      {stats && stats.lowStockProducts.length > 0 && (
        <Card className="border-red-800">
          <CardHeader className="pb-2 p-3 md:p-4">
            <CardTitle className="text-sm text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Cảnh báo hàng sắp hết ({stats.lowStockProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-4 md:pb-4 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {stats.lowStockProducts.map((p) => (
                <div key={p.id} className="rounded border border-red-800 p-2 text-sm">
                  <p className="font-medium text-xs md:text-sm">{p.name}</p>
                  <p className="text-red-400 text-xs">Còn {p.stock} / min {p.minStock}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
