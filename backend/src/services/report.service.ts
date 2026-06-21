import { prisma } from '../prisma'

export const getDashboardStatsService = async () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const [activeTables, todayRevenue, monthRevenue, lowStockProducts] = await Promise.all([
    prisma.table.count({ where: { status: { in: ['PLAYING', 'PAUSED'] } } }),
    prisma.invoice.aggregate({
      where: { createdAt: { gte: today } },
      _sum: { totalAmount: true },
    }),
    prisma.invoice.aggregate({
      where: { createdAt: { gte: monthStart } },
      _sum: { totalAmount: true },
    }),
    prisma.product.findMany({ where: { isActive: true } }).then((ps) =>
      ps.filter((p) => p.stock <= p.minStock)
    ),
  ])

  return {
    activeTables,
    todayRevenue: Number(todayRevenue._sum.totalAmount || 0),
    monthRevenue: Number(monthRevenue._sum.totalAmount || 0),
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
  }
}

export const getRevenueReportService = async (
  from: Date,
  to: Date,
  groupBy: 'hour' | 'day',
  tzOffsetMinutes: number
) => {
  const invoices = await prisma.invoice.findMany({
    where: { createdAt: { gte: from, lte: to } },
    select: { totalAmount: true, tableAmount: true, foodAmount: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  const summary = {
    total: invoices.reduce((s, i) => s + Number(i.totalAmount), 0),
    tableAmount: invoices.reduce((s, i) => s + Number(i.tableAmount), 0),
    foodAmount: invoices.reduce((s, i) => s + Number(i.foodAmount), 0),
    invoiceCount: invoices.length,
  }

  const tzMs = tzOffsetMinutes * 60 * 1000
  const grouped: Record<string, { label: string; total: number; tableAmount: number; foodAmount: number }> = {}

  for (const inv of invoices) {
    const local = new Date(inv.createdAt.getTime() + tzMs)
    let key: string

    if (groupBy === 'hour') {
      key = `${String(local.getUTCHours()).padStart(2, '0')}:00`
    } else {
      key = local.toISOString().split('T')[0]
    }

    if (!grouped[key]) {
      grouped[key] = { label: key, total: 0, tableAmount: 0, foodAmount: 0 }
    }
    grouped[key].total += Number(inv.totalAmount)
    grouped[key].tableAmount += Number(inv.tableAmount)
    grouped[key].foodAmount += Number(inv.foodAmount)
  }

  const chart = Object.values(grouped).sort((a, b) => a.label.localeCompare(b.label))

  return { summary, chart }
}

export const getProductReportService = async (from?: Date, to?: Date) => {
  const where = from && to ? { invoice: { createdAt: { gte: from, lte: to } } } : {}

  const topProducts = await prisma.invoiceItem.groupBy({
    by: ['productId'],
    where,
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 10,
  })

  const productIds = topProducts.map((p) => p.productId)
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })

  return topProducts.map((tp) => ({
    product: products.find((p) => p.id === tp.productId),
    totalSold: tp._sum.quantity,
  }))
}

export const getInventoryReportService = async () => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  const transactions = await prisma.inventoryTransaction.findMany({
    include: { product: { select: { id: true, name: true, category: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return { products, transactions }
}
