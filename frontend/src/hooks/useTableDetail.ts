import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import api from '@/lib/axios'
import { TableDetail, ApiResponse } from '@/types'
import { useSocket } from '@/contexts/SocketContext'

export function useTableDetail(tableId: number | null, enabled: boolean) {
  const { socket } = useSocket()
  const qc = useQueryClient()

  useEffect(() => {
    if (!socket || !tableId) return
    const refresh = () => qc.invalidateQueries({ queryKey: ['table-detail', tableId] })
    socket.on('order_created', refresh)
    return () => { socket.off('order_created', refresh) }
  }, [socket, tableId, qc])

  return useQuery({
    queryKey: ['table-detail', tableId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<TableDetail>>(`/tables/${tableId}/detail`)
      return res.data.data
    },
    enabled: enabled && tableId !== null && tableId > 0,
    staleTime: 0,
  })
}
