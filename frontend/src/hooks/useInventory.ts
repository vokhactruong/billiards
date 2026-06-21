import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import api from '@/lib/axios'
import { InventoryTransaction, Product, ApiResponse } from '@/types'
import { useSocket } from '@/contexts/SocketContext'

export function useInventoryHistory(productId?: number) {
  return useQuery({
    queryKey: ['inventory-history', productId],
    queryFn: async () => {
      const params = productId ? { productId } : {}
      const res = await api.get<ApiResponse<InventoryTransaction[]>>('/inventory/history', { params })
      return res.data.data
    },
  })
}

export function useLowStock() {
  const { socket } = useSocket()
  const qc = useQueryClient()

  useEffect(() => {
    if (!socket) return
    const refresh = () => qc.invalidateQueries({ queryKey: ['low-stock'] })
    socket.on('inventory_updated', refresh)
    return () => { socket.off('inventory_updated', refresh) }
  }, [socket, qc])

  return useQuery({
    queryKey: ['low-stock'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Product[]>>('/inventory/low-stock')
      return res.data.data
    },
  })
}

export function useImportStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, quantity, note }: { id: number; quantity: number; note?: string }) =>
      api.post(`/inventory/${id}/import`, { quantity, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['inventory-history'] })
      qc.invalidateQueries({ queryKey: ['low-stock'] })
    },
  })
}

export function useAdjustStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, quantity, note }: { id: number; quantity: number; note?: string }) =>
      api.post(`/inventory/${id}/adjust`, { quantity, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['inventory-history'] })
      qc.invalidateQueries({ queryKey: ['low-stock'] })
    },
  })
}
