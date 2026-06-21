import { Response } from 'express'
import { AuthRequest } from '../types'
import { loginService, getMeService } from '../services/auth.service'
import { sendSuccess, sendError } from '../utils/response'

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body
    const result = await loginService(username, password)
    sendSuccess(res, result, 'Login successful')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed'
    sendError(res, message, 401)
  }
}

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await getMeService(req.user!.userId)
    sendSuccess(res, user)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get user'
    sendError(res, message, 400)
  }
}
