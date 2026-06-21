import { useState, useEffect } from 'react'
import { TableSession, Table } from '@/types'
import { calcElapsedMs, calcTableAmount, formatTimer, formatCurrency } from '@/lib/utils'

interface Props {
  session: TableSession
  table: Table
}

export function useTimer(session: TableSession, table: Table) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    setElapsed(calcElapsedMs(session))
    if (session.pausedAt) return

    const interval = setInterval(() => {
      setElapsed(calcElapsedMs(session))
    }, 1000)

    return () => clearInterval(interval)
  }, [session])

  const amount = calcTableAmount(elapsed, Number(table.pricePerHour))

  return {
    elapsed,
    timerText: formatTimer(elapsed),
    amountText: formatCurrency(amount),
    amount,
  }
}

export function Timer({ session, table }: Props) {
  const { timerText, amountText } = useTimer(session, table)

  return (
    <div className="text-center">
      <p className="text-2xl font-mono font-bold tracking-wider text-green-400">
        {timerText}
      </p>
      <p className="text-sm font-semibold text-yellow-400 mt-1">
        {amountText}
      </p>
    </div>
  )
}
