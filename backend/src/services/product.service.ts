import { ProductCategory } from '@prisma/client'
import { prisma } from '../prisma'
import { getPagination, buildPaginationMeta } from '../utils/response'

export const getProductsService = async (page?: string, limit?: string, category?: string) => {
  const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit)
  const where = {
    isActive: true,
    ...(category ? { category: category as ProductCategory } : {}),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: limitNum, orderBy: { name: 'asc' } }),
    prisma.product.count({ where }),
  ])

  return { products, meta: buildPaginationMeta(total, pageNum, limitNum) }
}

export const getProductByIdService = async (id: number) => {
  const product = await prisma.product.findUnique({ where: { id, isActive: true } })
  if (!product) throw new Error('Product not found')
  return product
}

export const createProductService = async (data: {
  name: string
  category: ProductCategory
  costPrice: number
  sellingPrice: number
  stock?: number
  minStock?: number
  imageUrl?: string
}) => {
  return prisma.product.create({ data })
}

export const updateProductService = async (
  id: number,
  data: { name?: string; category?: ProductCategory; costPrice?: number; sellingPrice?: number; minStock?: number; imageUrl?: string }
) => {
  const product = await prisma.product.findUnique({ where: { id, isActive: true } })
  if (!product) throw new Error('Product not found')
  return prisma.product.update({ where: { id }, data })
}

export const deleteProductService = async (id: number) => {
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) throw new Error('Product not found')
  await prisma.product.update({ where: { id }, data: { isActive: false } })
}

export const getLowStockProductsService = async () => {
  const products = await prisma.product.findMany({ where: { isActive: true } })
  return products.filter((p) => p.stock <= p.minStock)
}
