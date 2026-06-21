import { useState, useMemo } from 'react'
import { useRevenueReport, useProductReport } from '@/hooks/useReports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { RevenueParams } from '@/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import { Calendar, TrendingUp, DollarSign, Receipt, Utensils } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

type Preset = 'today' | 'yesterday' | 'week' | 'month' | 'custom'

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'today', label: 'Hôm nay' },
  { key: 'yesterday', label: 'Hôm qua' },
  { key: 'week', label: 'Tuần này' },
  { key: 'month', label: 'Tháng này' },
  { key: 'custom', label: 'Tùy chỉnh' },
]

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function getRange(preset: Preset): { from: string; to: string; groupBy: 'hour' | 'day' } {
  const now = new Date()
  const today = new Date(now)
  today.setHours(23, 59, 59, 999)
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  switch (preset) {
    case 'today':
      return { from: todayStart.toISOString(), to: today.toISOString(), groupBy: 'hour' }

    case 'yesterday': {
      const y = new Date(todayStart)
      y.setDate(y.getDate() - 1)
      const yEnd = new Date(y)
      yEnd.setHours(23, 59, 59, 999)
      return { from: y.toISOString(), to: yEnd.toISOString(), groupBy: 'hour' }
    }

    case 'week': {
      const d = new Date(todayStart)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      d.setDate(diff)
      return { from: d.toISOString(), to: today.toISOString(), groupBy: 'day' }
    }

    case 'month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      return { from: first.toISOString(), to: today.toISOString(), groupBy: 'day' }
    }

    default:
      return { from: todayStart.toISOString(), to: today.toISOString(), groupBy: 'day' }
  }
}

function formatChartLabel(label: string, groupBy: 'hour' | 'day'): string {
  if (groupBy === 'hour') return label
  try {
    return format(parseISO(label), 'dd/MM', { locale: vi })
  } catch {
    return label
  }
}

function formatTooltipLabel(label: string, groupBy: 'hour' | 'day'): string {
  if (groupBy === 'hour') return `${label}`
  try {
    return format(parseISO(label), 'EEEE dd/MM/yyyy', { locale: vi })
  } catch {
    return label
  }
}

function getPeriodLabel(preset: Preset, customFrom: string, customTo: string): string {
  switch (preset) {
    case 'today': return `Hôm nay (${format(new Date(), 'dd/MM/yyyy')})`
    case 'yesterday': {
      const y = new Date()
      y.setDate(y.getDate() - 1)
      return `Hôm qua (${format(y, 'dd/MM/yyyy')})`
    }
    case 'week': return `Tuần này`
    case 'month': return `Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`
    case 'custom':
      if (customFrom && customTo)
        return `${format(new Date(customFrom), 'dd/MM/yyyy')} — ${format(new Date(customTo), 'dd/MM/yyyy')}`
      return 'Tùy chỉnh'
  }
}

export default function Reports() {
  const [preset, setPreset] = useState<Preset>('today')
  const [customFrom, setCustomFrom] = useState(isoDate(new Date()))
  const [customTo, setCustomTo] = useState(isoDate(new Date()))
  const [appliedCustom, setAppliedCustom] = useState<{ from: string; to: string } | null>(null)

  const params = useMemo((): RevenueParams => {
    if (preset === 'custom') {
      if (!appliedCustom) return getRange('today')
      const from = new Date(appliedCustom.from)
      from.setHours(0, 0, 0, 0)
      const to = new Date(appliedCustom.to)
      to.setHours(23, 59, 59, 999)
      return { from: from.toISOString(), to: to.toISOString(), groupBy: 'day' }
    }
    return getRange(preset)
  }, [preset, appliedCustom])

  const { data: report, isLoading } = useRevenueReport(params)
  const { data: topProducts } = useProductReport(
    preset !== 'custom'
      ? { from: params.from, to: params.to }
      : appliedCustom
        ? { from: params.from, to: params.to }
        : undefined
  )

  const applyCustom = () => {
    if (customFrom && customTo && customFrom <= customTo) {
      setAppliedCustom({ from: customFrom, to: customTo })
    }
  }

  const summary = report?.summary
  const chart = report?.chart ?? []

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Báo cáo doanh thu</h1>
        <p className="text-muted-foreground text-xs md:text-sm">Phân tích theo thời gian</p>
      </div>

      {/* Period Selector */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.key}
                size="sm"
                variant={preset === p.key ? 'default' : 'outline'}
                onClick={() => setPreset(p.key)}
                className="h-8 text-xs"
              >
                {p.key === 'custom' && <Calendar className="h-3 w-3 mr-1" />}
                {p.label}
              </Button>
            ))}
          </div>

          {preset === 'custom' && (
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Từ ngày</p>
                <Input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-8 text-sm w-36"
                  max={customTo || isoDate(new Date())}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Đến ngày</p>
                <Input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-8 text-sm w-36"
                  min={customFrom}
                  max={isoDate(new Date())}
                />
              </div>
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={applyCustom}
                disabled={!customFrom || !customTo || customFrom > customTo}
              >
                Xem báo cáo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-zinc-700">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Tổng doanh thu</p>
              <TrendingUp className="h-3.5 w-3.5 text-green-500 shrink-0" />
            </div>
            {isLoading ? (
              <div className="h-6 w-24 rounded bg-zinc-800 animate-pulse" />
            ) : (
              <p className="text-base md:text-xl font-bold text-green-400 truncate">
                {summary ? formatCurrency(summary.total) : '—'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-700">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Tiền bàn</p>
              <DollarSign className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            </div>
            {isLoading ? (
              <div className="h-6 w-24 rounded bg-zinc-800 animate-pulse" />
            ) : (
              <p className="text-base md:text-xl font-bold text-blue-400 truncate">
                {summary ? formatCurrency(summary.tableAmount) : '—'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-700">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Tiền đồ ăn</p>
              <Utensils className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
            </div>
            {isLoading ? (
              <div className="h-6 w-24 rounded bg-zinc-800 animate-pulse" />
            ) : (
              <p className="text-base md:text-xl font-bold text-yellow-400 truncate">
                {summary ? formatCurrency(summary.foodAmount) : '—'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-700">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Số hóa đơn</p>
              <Receipt className="h-3.5 w-3.5 text-purple-500 shrink-0" />
            </div>
            {isLoading ? (
              <div className="h-6 w-12 rounded bg-zinc-800 animate-pulse" />
            ) : (
              <p className="text-base md:text-xl font-bold text-purple-400">
                {summary?.invoiceCount ?? '—'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="p-3 md:p-4 pb-0">
          <CardTitle className="text-sm md:text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Doanh thu — {getPeriodLabel(preset, customFrom, customTo)}
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {params.groupBy === 'hour' ? 'Theo giờ' : 'Theo ngày'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-1 pt-3 md:p-4 md:pt-4">
          {isLoading ? (
            <div className="h-56 flex items-center justify-center">
              <div className="h-40 w-full rounded bg-zinc-900 animate-pulse" />
            </div>
          ) : chart.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Receipt className="h-8 w-8 opacity-30" />
              <p className="text-sm">Không có dữ liệu trong khoảng thời gian này</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={chart}
                margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  stroke="#64748b"
                  tickFormatter={(v) => formatChartLabel(v, params.groupBy)}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="#64748b"
                  tickFormatter={(v) => {
                    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
                    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`
                    return String(v)
                  }}
                  width={45}
                />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                  labelFormatter={(label) => formatTooltipLabel(label, params.groupBy)}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'tableAmount' ? 'Tiền bàn' : 'Tiền đồ ăn',
                  ]}
                />
                <Legend
                  formatter={(v) => (
                    <span className="text-xs">{v === 'tableAmount' ? 'Tiền bàn' : 'Tiền đồ ăn'}</span>
                  )}
                />
                <Bar dataKey="tableAmount" name="tableAmount" stackId="a" fill="#22c55e" />
                <Bar dataKey="foodAmount" name="foodAmount" stackId="a" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-sm md:text-base">
            Top sản phẩm bán chạy — {getPeriodLabel(preset, customFrom, customTo)}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 md:px-4 md:pb-4 pt-0">
          {(!topProducts || topProducts.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-6">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-2.5">
              {topProducts.slice(0, 8).map((p, i) => (
                <div key={p.product?.id} className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs w-5 shrink-0 text-right">{i + 1}.</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${((p.totalSold ?? 0) / (topProducts[0]?.totalSold ?? 1)) * 100}%`,
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  <span className="text-sm flex-1 min-w-0 truncate">{p.product?.name}</span>
                  <span className="text-sm font-bold shrink-0">{p.totalSold}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
