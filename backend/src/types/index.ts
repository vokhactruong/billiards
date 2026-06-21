import { Role } from '@prisma/client'
import { Request } from 'express'

export interface AuthPayload {
  userId: number
  username: string
  role: Role
}

export interface AuthRequest extends Request {
  user?: AuthPayload
}

export interface PaginationQuery {
  page?: string
  limit?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
