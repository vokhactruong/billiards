import { Response } from 'express'
import { ProductCategory } from '@prisma/client'
import { AuthRequest } from '../types'
import {
  getProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
} from '../services/product.service'
import { sendSuccess, sendError } from '../utils/response'

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, category } = req.query as { page?: string; limit?: string; category?: string }
    const result = await getProductsService(page, limit, category)
    sendSuccess(res, result.products, 'Products retrieved', 200, result.meta)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await getProductByIdService(parseInt(req.params.id))
    sendSuccess(res, product)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 404)
  }
}

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await createProductService({ ...req.body, category: req.body.category as ProductCategory })
    sendSuccess(res, product, 'Product created', 201)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await updateProductService(parseInt(req.params.id), req.body)
    sendSuccess(res, product, 'Product updated')
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await deleteProductService(parseInt(req.params.id))
    sendSuccess(res, null, 'Product deleted')
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}
