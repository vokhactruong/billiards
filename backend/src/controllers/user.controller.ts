import { Response } from 'express'
import { Role } from '@prisma/client'
import { AuthRequest } from '../types'
import { getUsersService, createUserService, updateUserService, deleteUserService } from '../services/user.service'
import { sendSuccess, sendError } from '../utils/response'

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query as { page?: string; limit?: string }
    const result = await getUsersService(page, limit)
    sendSuccess(res, result.users, 'Users retrieved', 200, result.meta)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 500)
  }
}

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await createUserService({ ...req.body, role: req.body.role as Role })
    sendSuccess(res, user, 'User created', 201)
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id)
    const user = await updateUserService(id, req.body)
    sendSuccess(res, user, 'User updated')
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id)
    await deleteUserService(id, req.user!.userId)
    sendSuccess(res, null, 'User deactivated')
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed', 400)
  }
}
