import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'
import { prisma } from '../prisma'
import { getPagination, buildPaginationMeta } from '../utils/response'

export const getUsersService = async (page?: string, limit?: string) => {
  const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit)

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limitNum,
      select: { id: true, username: true, fullName: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ])

  return { users, meta: buildPaginationMeta(total, pageNum, limitNum) }
}

export const createUserService = async (data: {
  username: string
  password: string
  fullName: string
  role: Role
}) => {
  const existing = await prisma.user.findUnique({ where: { username: data.username } })
  if (existing) throw new Error('Username already exists')

  const hashed = await bcrypt.hash(data.password, 10)
  const user = await prisma.user.create({
    data: { ...data, password: hashed },
    select: { id: true, username: true, fullName: true, role: true, isActive: true, createdAt: true },
  })
  return user
}

export const updateUserService = async (
  id: number,
  data: { fullName?: string; role?: Role; isActive?: boolean; password?: string }
) => {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new Error('User not found')

  const updateData: Record<string, unknown> = {}
  if (data.fullName !== undefined) updateData.fullName = data.fullName
  if (data.role !== undefined) updateData.role = data.role
  if (data.isActive !== undefined) updateData.isActive = data.isActive
  if (data.password) updateData.password = await bcrypt.hash(data.password, 10)

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, username: true, fullName: true, role: true, isActive: true, updatedAt: true },
  })
}

export const deleteUserService = async (id: number, requesterId: number) => {
  if (id === requesterId) throw new Error('Cannot delete your own account')
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new Error('User not found')
  await prisma.user.update({ where: { id }, data: { isActive: false } })
}
