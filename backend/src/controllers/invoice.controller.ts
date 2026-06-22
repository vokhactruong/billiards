import { Response } from 'express'
import { AuthRequest } from '../types'
import { checkoutService, getInvoicesService, getInvoiceByIdService } from '../services/invoice.service'
import { sendSuccess, sendError } from '../utils/response'
import { getSocketIO } from '../socket'

export const checkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessionId = parseInt(req.params.sessionId)
    const { discount } = req.body
    const invoice = await checkoutService(sessionId, discount || 0)
    const io = getSocketIO()
    io.emit('table_closed', {
      tableId: invoice.session.tableId,
      status: 'AVAILABLE',
      elapsedMs: null,
      amount: null,
      currentSessionId: null,
    })
    sendSuccess(res, invoice, 'Checkout successful', 201)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}

export const getInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, search, startDate, endDate } = req.query as Record<string, string>
    const result = await getInvoicesService(page, limit, search, startDate, endDate)
    sendSuccess(res, result.invoices, 'Invoices retrieved', 200, result.meta)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

export const getInvoiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoice = await getInvoiceByIdService(parseInt(req.params.id))
    sendSuccess(res, invoice)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 404)
  }
}
