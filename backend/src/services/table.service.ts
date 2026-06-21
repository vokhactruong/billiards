import { TableStatus } from '@prisma/client'
import { prisma } from '../prisma'

export const getTablesService = async () => {
  const tables = await prisma.table.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' },
    include: {
      sessions: {
        where: { isActive: true },
        take: 1,
        include: {
          orders: {
            include: { orderItems: { include: { product: true } } },
          },
        },
      },
    },
  })
  return tables
}

export const openTableService = async (tableId: number) => {
  const table = await prisma.table.findUnique({ where: { id: tableId } })
  if (!table) throw new Error('Table not found')
  if (table.status !== TableStatus.AVAILABLE) throw new Error('Table is not available')

  const [session] = await prisma.$transaction([
    prisma.tableSession.create({ data: { tableId } }),
    prisma.table.update({ where: { id: tableId }, data: { status: TableStatus.PLAYING } }),
  ])

  return session
}

export const pauseTableService = async (tableId: number) => {
  const table = await prisma.table.findUnique({ where: { id: tableId } })
  if (!table) throw new Error('Table not found')
  if (table.status !== TableStatus.PLAYING) throw new Error('Table is not playing')

  const session = await prisma.tableSession.findFirst({
    where: { tableId, isActive: true },
  })
  if (!session) throw new Error('No active session')

  const [updatedSession] = await prisma.$transaction([
    prisma.tableSession.update({
      where: { id: session.id },
      data: { pausedAt: new Date() },
    }),
    prisma.table.update({ where: { id: tableId }, data: { status: TableStatus.PAUSED } }),
  ])

  return updatedSession
}

export const resumeTableService = async (tableId: number) => {
  const table = await prisma.table.findUnique({ where: { id: tableId } })
  if (!table) throw new Error('Table not found')
  if (table.status !== TableStatus.PAUSED) throw new Error('Table is not paused')

  const session = await prisma.tableSession.findFirst({
    where: { tableId, isActive: true },
  })
  if (!session || !session.pausedAt) throw new Error('No paused session')

  const additionalPausedMs = Date.now() - session.pausedAt.getTime()
  const newTotalPaused = Number(session.totalPausedMs) + additionalPausedMs

  const [updatedSession] = await prisma.$transaction([
    prisma.tableSession.update({
      where: { id: session.id },
      data: { pausedAt: null, resumedAt: new Date(), totalPausedMs: newTotalPaused },
    }),
    prisma.table.update({ where: { id: tableId }, data: { status: TableStatus.PLAYING } }),
  ])

  return updatedSession
}

export const transferTableService = async (fromTableId: number, toTableId: number) => {
  const fromTable = await prisma.table.findUnique({ where: { id: fromTableId } })
  if (!fromTable || fromTable.status === TableStatus.AVAILABLE) {
    throw new Error('Source table is not active')
  }

  const toTable = await prisma.table.findUnique({ where: { id: toTableId } })
  if (!toTable || toTable.status !== TableStatus.AVAILABLE) {
    throw new Error('Target table is not available')
  }

  const session = await prisma.tableSession.findFirst({
    where: { tableId: fromTableId, isActive: true },
  })
  if (!session) throw new Error('No active session on source table')

  await prisma.$transaction([
    prisma.tableSession.update({ where: { id: session.id }, data: { tableId: toTableId } }),
    prisma.table.update({ where: { id: fromTableId }, data: { status: TableStatus.AVAILABLE } }),
    prisma.table.update({ where: { id: toTableId }, data: { status: fromTable.status } }),
  ])

  return { message: `Transferred from ${fromTable.name} to ${toTable.name}` }
}

export const getSessionService = async (sessionId: number) => {
  const session = await prisma.tableSession.findUnique({
    where: { id: sessionId },
    include: {
      table: true,
      orders: {
        include: { orderItems: { include: { product: true } } },
      },
    },
  })
  if (!session) throw new Error('Session not found')
  return session
}

export const updateTablePriceService = async (tableId: number, pricePerHour: number) => {
  const table = await prisma.table.findUnique({ where: { id: tableId } })
  if (!table) throw new Error('Table not found')
  return prisma.table.update({ where: { id: tableId }, data: { pricePerHour } })
}

export const createTableService = async (name: string, pricePerHour: number) => {
  const existing = await prisma.table.findUnique({ where: { name } })
  if (existing) throw new Error('Tên bàn đã tồn tại')
  return prisma.table.create({ data: { name, pricePerHour } })
}

export const deleteTableService = async (tableId: number) => {
  const table = await prisma.table.findUnique({ where: { id: tableId } })
  if (!table) throw new Error('Table not found')
  if (table.status !== TableStatus.AVAILABLE) throw new Error('Chỉ xoá được bàn đang trống')
  return prisma.table.update({ where: { id: tableId }, data: { isActive: false } })
}

export const updateTableNameService = async (tableId: number, name: string) => {
  const table = await prisma.table.findUnique({ where: { id: tableId } })
  if (!table) throw new Error('Table not found')
  const conflict = await prisma.table.findFirst({ where: { name, id: { not: tableId } } })
  if (conflict) throw new Error('Tên bàn đã tồn tại')
  return prisma.table.update({ where: { id: tableId }, data: { name } })
}
