import { Response } from 'express'
import { AuthRequest } from '../types'
import {
  getTablesService,
  getTableDetailService,
  openTableService,
  pauseTableService,
  resumeTableService,
  transferTableService,
  getSessionService,
  updateTablePriceService,
  createTableService,
  deleteTableService,
  updateTableNameService,
  computeElapsed,
  computeAmount,
} from '../services/table.service'
import { sendSuccess, sendError } from '../utils/response'
import { getSocketIO } from '../socket'

export const getTables = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tables = await getTablesService()
    sendSuccess(res, tables)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

export const getTableDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tableId = parseInt(req.params.id)
    const detail = await getTableDetailService(tableId)
    sendSuccess(res, detail)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 404)
  }
}

export const openTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tableId = parseInt(req.params.id)
    const session = await openTableService(tableId)
    const io = getSocketIO()
    io.emit('table_opened', {
      tableId,
      status: 'PLAYING',
      elapsedMs: 0,
      amount: 0,
      currentSessionId: session.id,
    })
    sendSuccess(res, session, 'Table opened', 201)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}

export const pauseTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tableId = parseInt(req.params.id)
    const { session, table } = await pauseTableService(tableId)
    const elapsed = computeElapsed(session)
    const io = getSocketIO()
    io.emit('table_paused', {
      tableId,
      status: 'PAUSED',
      elapsedMs: elapsed,
      amount: computeAmount(elapsed, Number(table.pricePerHour)),
    })
    sendSuccess(res, session, 'Table paused')
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}

export const resumeTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tableId = parseInt(req.params.id)
    const { session, table } = await resumeTableService(tableId)
    const elapsed = computeElapsed(session)
    const io = getSocketIO()
    io.emit('table_resumed', {
      tableId,
      status: 'PLAYING',
      elapsedMs: elapsed,
      amount: computeAmount(elapsed, Number(table.pricePerHour)),
    })
    sendSuccess(res, session, 'Table resumed')
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}

export const transferTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const fromTableId = parseInt(req.params.id)
    const { targetTableId } = req.body
    const toId = parseInt(targetTableId)
    const { session, fromTable, toTable } = await transferTableService(fromTableId, toId)
    const elapsed = computeElapsed(session)
    const io = getSocketIO()
    io.emit('table_transferred', {
      fromTableId,
      toTableId: toId,
      from: { status: 'AVAILABLE', elapsedMs: null, amount: null, currentSessionId: null },
      to: {
        status: fromTable.status,
        elapsedMs: elapsed,
        amount: computeAmount(elapsed, Number(toTable.pricePerHour)),
        currentSessionId: session.id,
      },
    })
    sendSuccess(res, { message: `Transferred from ${fromTable.name} to ${toTable.name}` }, 'Table transferred')
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}

export const getSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessionId = parseInt(req.params.sessionId)
    const session = await getSessionService(sessionId)
    sendSuccess(res, session)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 404)
  }
}

export const updateTablePrice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tableId = parseInt(req.params.id)
    const table = await updateTablePriceService(tableId, req.body.pricePerHour)
    sendSuccess(res, table, 'Price updated')
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}

export const createTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, pricePerHour } = req.body
    const table = await createTableService(name.trim(), parseFloat(pricePerHour))
    const io = getSocketIO()
    io.emit('table_created', { table })
    sendSuccess(res, table, 'Tạo bàn thành công', 201)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}

export const deleteTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tableId = parseInt(req.params.id)
    await deleteTableService(tableId)
    const io = getSocketIO()
    io.emit('table_deleted', { tableId })
    sendSuccess(res, null, 'Xoá bàn thành công')
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}

export const updateTableName = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tableId = parseInt(req.params.id)
    const table = await updateTableNameService(tableId, req.body.name.trim())
    const io = getSocketIO()
    io.emit('table_updated', { table })
    sendSuccess(res, table, 'Cập nhật tên bàn thành công')
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}
