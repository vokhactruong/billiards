import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import api from '@/lib/axios'
import { Order, ApiResponse } from '@/types'
import { useSocket } from '@/contexts/SocketContext'

export function useOrders(sessionId: number | null) {
  const { socket } = useSocket()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['orders', sessionId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Order[]>>(`/orders/sessions/${sessionId}`)
      return res.data.data
    },
    enabled: !!sessionId,
  })

  useEffect(() => {
    if (!socket || !sessionId) return
    const refresh = () => qc.invalidateQueries({ queryKey: ['orders', sessionId] })
    socket.on('order_created', refresh)
    return () => { socket.off('order_created', refresh) }
  }, [socket, sessionId, qc])

  return query
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, items }: { sessionId: number; tableId: number; items: { productId: number; quantity: number }[] }) =>
      api.post(`/orders/sessions/${sessionId}`, { items }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['orders', variables.sessionId] })
      qc.invalidateQueries({ queryKey: ['table-detail', variables.tableId] })
    },
  })
}

export function useUpdateOrderItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, productId, quantity }: { orderId: number; productId: number; quantity: number }) =>
      api.put(`/orders/${orderId}/items`, { productId, quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
}
