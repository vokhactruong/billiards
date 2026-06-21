import bcrypt from 'bcryptjs'
import { prisma } from '../prisma'
import { signToken } from '../utils/jwt'

export const loginService = async (username: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { username } })

  if (!user || !user.isActive) {
    throw new Error('Invalid credentials')
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error('Invalid credentials')
  }

  const token = signToken({ userId: user.id, username: user.username, role: user.role })

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    },
  }
}

export const getMeService = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, fullName: true, role: true, isActive: true, createdAt: true },
  })

  if (!user) throw new Error('User not found')
  return user
}
