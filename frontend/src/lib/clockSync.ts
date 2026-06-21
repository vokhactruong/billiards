const OFFSET_KEY = 'bia_clock_offset'

// Restore last known offset so PWA works correctly even when offline at startup
let _offset = parseInt(localStorage.getItem(OFFSET_KEY) ?? '0', 10) || 0

const apiBase = (import.meta.env.VITE_API_URL as string | undefined) || '/api'

export async function syncClock(): Promise<void> {
  try {
    const t0 = Date.now()
    const res = await fetch(`${apiBase}/time`)
    if (!res.ok) return
    const { serverTime } = await res.json()
    const t1 = Date.now()
    // Estimate server time at the moment we finish receiving: serverTime + half round-trip
    const serverNowEstimate = serverTime + (t1 - t0) / 2
    _offset = serverNowEstimate - t1
    localStorage.setItem(OFFSET_KEY, String(Math.round(_offset)))
  } catch {
    // keep previous _offset from localStorage
  }
}

export function serverNow(): number {
  return Date.now() + _offset
}
