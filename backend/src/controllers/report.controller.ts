import { Response } from 'express'
import { AuthRequest } from '../types'
import {
  getDashboardStatsService,
  getRevenueReportService,
  getProductReportService,
  getInventoryReportService,
} from '../services/report.service'
import { sendSuccess, sendError } from '../utils/response'

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await getDashboardStatsService()
    sendSuccess(res, stats)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

export const getRevenueReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      from,
      to,
      groupBy = 'day',
      tz = '0',
    } = req.query as {
      from?: string
      to?: string
      groupBy?: 'hour' | 'day'
      tz?: string
    }

    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    const fromDate = from ? new Date(from) : todayStart
    const toDate = to ? new Date(to) : now
    const tzOffset = parseInt(tz) || 0

    const data = await getRevenueReportService(fromDate, toDate, groupBy, tzOffset)
    sendSuccess(res, data)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

export const getProductReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query as { from?: string; to?: string }
    const fromDate = from ? new Date(from) : undefined
    const toDate = to ? new Date(to) : undefined
    const data = await getProductReportService(fromDate, toDate)
    sendSuccess(res, data)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

export const getInventoryReport = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await getInventoryReportService()
    sendSuccess(res, data)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}
