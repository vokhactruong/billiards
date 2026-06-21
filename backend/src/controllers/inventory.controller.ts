import { Response } from 'express'
import { AuthRequest } from '../types'
import {
  importStockService,
  adjustStockService,
  getInventoryHistoryService,
  getLowStockService,
} from '../services/inventory.service'
import { sendSuccess, sendError } from '../utils/response'
import { getSocketIO } from '../socket'

export const importStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.id)
    const { quantity, note } = req.body
    const product = await importStockService(productId, quantity, note)
    const io = getSocketIO()
    io.emit('inventory_updated', { productId, product })
    sendSuccess(res, product, 'Stock imported')
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}

export const adjustStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.id)
    const { quantity, note } = req.body
    const product = await adjustStockService(productId, quantity, note)
    const io = getSocketIO()
    io.emit('inventory_updated', { productId, product })
    sendSuccess(res, product, 'Stock adjusted')
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}

export const getInventoryHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, type, page, limit } = req.query as Record<string, string>
    const result = await getInventoryHistoryService(
      productId ? parseInt(productId) : undefined,
      type,
      page,
      limit
    )
    sendSuccess(res, result.transactions, 'History retrieved', 200, result.meta)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

export const getLowStock = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await getLowStockService()
    sendSuccess(res, products)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}
