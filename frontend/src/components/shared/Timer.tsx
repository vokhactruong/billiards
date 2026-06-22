import { useState, useEffect } from 'react'
import { calcTableAmount, formatTimer, formatCurrency } from '@/lib/utils'

export function useTimerFromElapsed(
  initialElapsedMs: number | null,
  isPaused: boolean,
  pricePerHour = 0
) {
  const [elapsed, setElapsed] = useState(initialElapsedMs ?? 0)

  // Sync when server provides updated elapsedMs (socket patch or modal reopen)
  useEffect(() => {
    setElapsed(initialElapsedMs ?? 0)
  }, [initialElapsedMs])

  // Count up every second while playing
  useEffect(() => {
    if (isPaused || initialElapsedMs === null) return
    const interval = setInterval(() => setElapsed(prev => prev + 1000), 1000)
    return () => clearInterval(interval)
  }, [isPaused, initialElapsedMs])

  const amount = calcTableAmount(elapsed, pricePerHour)
  return {
    elapsed,
    timerText: formatTimer(elapsed),
    amount,
    amountText: formatCurrency(amount),
  }
}
