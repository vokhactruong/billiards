import { prisma } from '../prisma'
import { TransactionType } from '@prisma/client'

interface OrderItem {
  productId: number
  quantity: number
}

export const createOrderService = async (sessionId: number, items: OrderItem[]) => {
  const session = await prisma.tableSession.findUnique({
    where: { id: sessionId, isActive: true },
  })
  if (!session) throw new Error('Session not found or inactive')

  const productIds = items.map((i) => i.productId)
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } })

  if (products.length !== productIds.length) {
    throw new Error('One or more products not found')
  }

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`)
    }
  }

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        sessionId,
        orderItems: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!
            return { productId: item.productId, quantity: item.quantity, unitPrice: product.sellingPrice }
          }),
        },
      },
      include: { orderItems: { include: { product: true } } },
    })

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
      await tx.inventoryTransaction.create({
        data: {
          productId: item.productId,
          type: TransactionType.SALE,
          quantity: -item.quantity,
          note: `Sale - Session #${sessionId}`,
        },
      })
    }

    return created
  })

  return order
}

export const getOrdersBySessionService = async (sessionId: number) => {
  return prisma.order.findMany({
    where: { sessionId },
    include: { orderItems: { include: { product: true } } },
    orderBy: { createdAt: 'asc' },
  })
}

export const updateOrderItemService = async (
  orderId: number,
  productId: number,
  quantity: number
) => {
  const orderItem = await prisma.orderItem.findFirst({ where: { orderId, productId } })
  if (!orderItem) throw new Error('Order item not found')

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) throw new Error('Product not found')

  const diff = quantity - orderItem.quantity

  if (diff > 0 && product.stock < diff) {
    throw new Error('Insufficient stock')
  }

  await prisma.$transaction(async (tx) => {
    if (quantity === 0) {
      await tx.orderItem.delete({ where: { id: orderItem.id } })
    } else {
      await tx.orderItem.update({ where: { id: orderItem.id }, data: { quantity } })
    }

    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: diff } },
    })
  })

  return prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: { include: { product: true } } },
  })
}
