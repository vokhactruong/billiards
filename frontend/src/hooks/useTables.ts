import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import api from '@/lib/axios'
import { Table, ApiResponse } from '@/types'
import { useSocket } from '@/contexts/SocketContext'

export function useTables() {
  const { socket } = useSocket()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Table[]>>('/tables')
      return res.data.data
    },
    refetchInterval: 30000,
  })

  useEffect(() => {
    if (!socket) return
    const refresh = () => qc.invalidateQueries({ queryKey: ['tables'] })
    socket.on('table_opened', refresh)
    socket.on('table_paused', refresh)
    socket.on('table_resumed', refresh)
    socket.on('table_closed', refresh)
    socket.on('table_transferred', refresh)
    socket.on('table_created', refresh)
    socket.on('table_deleted', refresh)
    socket.on('table_updated', refresh)
    return () => {
      socket.off('table_opened', refresh)
      socket.off('table_paused', refresh)
      socket.off('table_resumed', refresh)
      socket.off('table_closed', refresh)
      socket.off('table_transferred', refresh)
      socket.off('table_created', refresh)
      socket.off('table_deleted', refresh)
      socket.off('table_updated', refresh)
    }
  }, [socket, qc])

  return query
}

export function useCreateTable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; pricePerHour: number }) =>
      api.post<ApiResponse<Table>>('/tables', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  })
}

export function useDeleteTable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tableId: number) => api.delete(`/tables/${tableId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  })
}

export function useUpdateTableName() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      api.put(`/tables/${id}/name`, { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  })
}

export function useOpenTable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tableId: number) => api.post(`/tables/${tableId}/open`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  })
}

export function usePauseTable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tableId: number) => api.post(`/tables/${tableId}/pause`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  })
}

export function useResumeTable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tableId: number) => api.post(`/tables/${tableId}/resume`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  })
}

export function useTransferTable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ fromId, toId }: { fromId: number; toId: number }) =>
      api.post(`/tables/${fromId}/transfer`, { targetTableId: toId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  })
}
