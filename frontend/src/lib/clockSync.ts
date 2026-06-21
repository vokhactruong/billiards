let _offset = 0 // ms to add to Date.now() to get server-aligned time

export async function syncClock(): Promise<void> {
  try {
    const t0 = Date.now()
    const res = await fetch('/api/time')
    if (!res.ok) return
    const { serverTime } = await res.json()
    const t1 = Date.now()
    // Estimate server time at the moment we finish receiving: serverTime + half round-trip
    const serverNowEstimate = serverTime + (t1 - t0) / 2
    _offset = serverNowEstimate - t1
  } catch {
    _offset = 0
  }
}

export function serverNow(): number {
  return Date.now() + _offset
}
