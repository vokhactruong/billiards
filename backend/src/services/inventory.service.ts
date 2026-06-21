import { TransactionType } from '@prisma/client'
import { prisma } from '../prisma'
import { getPagination, buildPaginationMeta } from '../utils/response'

export const importStockService = async (productId: number, quantity: number, note?: string) => {
  const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } })
  if (!product) throw new Error('Product not found')

  await prisma.$transaction([
    prisma.product.update({ where: { id: productId }, data: { stock: { increment: quantity } } }),
    prisma.inventoryTransaction.create({
      data: { productId, type: TransactionType.IMPORT, quantity, note },
    }),
  ])

  return prisma.product.findUnique({ where: { id: productId } })
}

export const adjustStockService = async (productId: number, quantity: number, note?: string) => {
  const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } })
  if (!product) throw new Error('Product not found')

  const newStock = product.stock + quantity
  if (newStock < 0) throw new Error('Stock cannot be negative')

  await prisma.$transaction([
    prisma.product.update({ where: { id: productId }, data: { stock: newStock } }),
    prisma.inventoryTransaction.create({
      data: { productId, type: TransactionType.ADJUSTMENT, quantity, note },
    }),
  ])

  return prisma.product.findUnique({ where: { id: productId } })
}

export const getInventoryHistoryService = async (
  productId?: number,
  type?: string,
  page?: string,
  limit?: string
) => {
  const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit)
  const where = {
    ...(productId ? { productId } : {}),
    ...(type ? { type: type as TransactionType } : {}),
  }

  const [transactions, total] = await Promise.all([
    prisma.inventoryTransaction.findMany({
      where,
      skip,
      take: limitNum,
      include: { product: { select: { id: true, name: true, category: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.inventoryTransaction.count({ where }),
  ])

  return { transactions, meta: buildPaginationMeta(total, pageNum, limitNum) }
}

export const getLowStockService = async () => {
  const products = await prisma.product.findMany({ where: { isActive: true } })
  return products.filter((p) => p.stock <= p.minStock)
}
