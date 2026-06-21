import { TableStatus } from '@prisma/client'
import { prisma } from '../prisma'
import { getPagination, buildPaginationMeta } from '../utils/response'

export const checkoutService = async (sessionId: number, discount = 0) => {
  const session = await prisma.tableSession.findUnique({
    where: { id: sessionId, isActive: true },
    include: {
      table: true,
      orders: { include: { orderItems: { include: { product: true } } } },
    },
  })

  if (!session) throw new Error('Session not found or already closed')

  const now = new Date()
  const startMs = session.startedAt.getTime()
  const totalElapsedMs = now.getTime() - startMs - Number(session.totalPausedMs)
  const durationMinutes = Math.ceil(totalElapsedMs / 60000)
  const durationHours = durationMinutes / 60

  const pricePerHour = Number(session.table.pricePerHour)
  const tableAmount = Math.ceil(durationHours * pricePerHour)

  let foodAmount = 0
  const allItems: { productId: number; quantity: number; unitPrice: number }[] = []

  for (const order of session.orders) {
    for (const item of order.orderItems) {
      foodAmount += Number(item.unitPrice) * item.quantity
      const existing = allItems.find((i) => i.productId === item.productId)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        allItems.push({ productId: item.productId, quantity: item.quantity, unitPrice: Number(item.unitPrice) })
      }
    }
  }

  const totalAmount = tableAmount + foodAmount - discount

  const invoice = await prisma.$transaction(async (tx) => {
    const created = await tx.invoice.create({
      data: {
        sessionId,
        tableAmount,
        foodAmount,
        discount,
        totalAmount: Math.max(0, totalAmount),
        duration: durationMinutes,
        invoiceItems: {
          create: allItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        invoiceItems: { include: { product: true } },
        session: { include: { table: true } },
      },
    })

    await tx.tableSession.update({ where: { id: sessionId }, data: { isActive: false, closedAt: now } })
    await tx.table.update({ where: { id: session.tableId }, data: { status: TableStatus.AVAILABLE } })

    return created
  })

  return invoice
}

export const getInvoicesService = async (
  page?: string,
  limit?: string,
  search?: string,
  startDate?: string,
  endDate?: string
) => {
  const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit)

  const where = {
    ...(search
      ? { session: { table: { name: { contains: search, mode: 'insensitive' as const } } } }
      : {}),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        }
      : {}),
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        invoiceItems: { include: { product: true } },
        session: { include: { table: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invoice.count({ where }),
  ])

  return { invoices, meta: buildPaginationMeta(total, pageNum, limitNum) }
}

export const getInvoiceByIdService = async (id: number) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      invoiceItems: { include: { product: true } },
      session: { include: { table: true } },
    },
  })
  if (!invoice) throw new Error('Invoice not found')
  return invoice
}
