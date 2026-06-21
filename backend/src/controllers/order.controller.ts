import { Response } from 'express'
import { AuthRequest } from '../types'
import { createOrderService, getOrdersBySessionService, updateOrderItemService } from '../services/order.service'
import { sendSuccess, sendError } from '../utils/response'
import { getSocketIO } from '../socket'

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessionId = parseInt(req.params.sessionId)
    const order = await createOrderService(sessionId, req.body.items)
    const io = getSocketIO()
    io.emit('order_created', { sessionId, order })
    sendSuccess(res, order, 'Order created', 201)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}

export const getOrdersBySession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessionId = parseInt(req.params.sessionId)
    const orders = await getOrdersBySessionService(sessionId)
    sendSuccess(res, orders)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

export const updateOrderItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.orderId)
    const { productId, quantity } = req.body
    const order = await updateOrderItemService(orderId, productId, quantity)
    sendSuccess(res, order, 'Order item updated')
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}
