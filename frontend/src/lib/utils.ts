import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { serverNow } from './clockSync'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function formatTimer(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function calcElapsedMs(session: {
  startedAt: string
  pausedAt: string | null
  totalPausedMs: number | string
}): number {
  const now = serverNow()
  const start = new Date(session.startedAt).getTime()
  const paused = session.pausedAt ? now - new Date(session.pausedAt).getTime() : 0
  return now - start - Number(session.totalPausedMs) - paused
}

export function calcTableAmount(elapsedMs: number, pricePerHour: number): number {
  const minutes = Math.ceil(elapsedMs / 60000) // làm tròn lên phút
  return Math.round((minutes / 60) * pricePerHour)
}

export function calcOrderTotal(orders: { orderItems: { quantity: number; unitPrice: number }[] }[]): number {
  return orders.reduce((total, order) => {
    return total + order.orderItems.reduce((s, i) => s + i.quantity * Number(i.unitPrice), 0)
  }, 0)
}
