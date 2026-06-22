import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import api from '@/lib/axios'
import { TableSummary, ApiResponse } from '@/types'
import { useSocket } from '@/contexts/SocketContext'
import { syncClock } from '@/lib/clockSync'

type TablePatch = Partial<TableSummary> & { tableId: number }

export function useTables() {
  const { socket } = useSocket()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<TableSummary[]>>('/tables')
      return res.data.data
    },
    refetchOnMount: 'always',
  })

  useEffect(() => {
    if (!socket) return

    const patchTable = (patch: TablePatch) => {
      qc.setQueryData<TableSummary[]>(['tables'], (old = []) =>
        old.map(t => t.id === patch.tableId ? { ...t, ...patch } : t)
      )
    }

    const handleTransfer = (data: {
      fromTableId: number
      toTableId: number
      from: Partial<TableSummary>
      to: Partial<TableSummary>
    }) => {
      qc.setQueryData<TableSummary[]>(['tables'], (old = []) =>
        old.map(t => {
          if (t.id === data.fromTableId) return { ...t, ...data.from }
          if (t.id === data.toTableId) return { ...t, ...data.to }
          return t
        })
      )
    }

    const refresh = () => qc.invalidateQueries({ queryKey: ['tables'] })

    socket.on('table_opened', patchTable)
    socket.on('table_paused', patchTable)
    socket.on('table_resumed', patchTable)
    socket.on('table_closed', patchTable)
    socket.on('table_transferred', handleTransfer)
    socket.on('table_created', refresh)
    socket.on('table_deleted', refresh)
    socket.on('table_updated', refresh)

    return () => {
      socket.off('table_opened', patchTable)
      socket.off('table_paused', patchTable)
      socket.off('table_resumed', patchTable)
      socket.off('table_closed', patchTable)
      socket.off('table_transferred', handleTransfer)
      socket.off('table_created', refresh)
      socket.off('table_deleted', refresh)
      socket.off('table_updated', refresh)
    }
  }, [socket, qc])

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncClock()
        qc.invalidateQueries({ queryKey: ['tables'] })
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [qc])

  return query
}

export function useCreateTable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; pricePerHour: number }) =>
      api.post<ApiResponse<TableSummary>>('/tables', data),
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
    mutationFn: (tableId: number) =>
      api.post<ApiResponse<{ id: number }>>(`/tables/${tableId}/open`),
    onMutate: async (tableId) => {
      await qc.cancelQueries({ queryKey: ['tables'] })
      const previous = qc.getQueryData<TableSummary[]>(['tables'])
      qc.setQueryData<TableSummary[]>(['tables'], (old = []) =>
        old.map(t => t.id === tableId
          ? { ...t, status: 'PLAYING', elapsedMs: 0, amount: 0, currentSessionId: -1 }
          : t)
      )
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(['tables'], ctx.previous)
    },
    onSuccess: (res, tableId) => {
      const sessionId = res.data.data.id
      qc.setQueryData<TableSummary[]>(['tables'], (old = []) =>
        old.map(t => t.id === tableId ? { ...t, currentSessionId: sessionId } : t)
      )
    },
  })
}

export function usePauseTable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tableId: number) => api.post(`/tables/${tableId}/pause`),
    onMutate: async (tableId) => {
      await qc.cancelQueries({ queryKey: ['tables'] })
      const previous = qc.getQueryData<TableSummary[]>(['tables'])
      qc.setQueryData<TableSummary[]>(['tables'], (old = []) =>
        old.map(t => t.id === tableId ? { ...t, status: 'PAUSED' } : t)
      )
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(['tables'], ctx.previous)
    },
  })
}

export function useResumeTable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tableId: number) => api.post(`/tables/${tableId}/resume`),
    onMutate: async (tableId) => {
      await qc.cancelQueries({ queryKey: ['tables'] })
      const previous = qc.getQueryData<TableSummary[]>(['tables'])
      qc.setQueryData<TableSummary[]>(['tables'], (old = []) =>
        old.map(t => t.id === tableId ? { ...t, status: 'PLAYING' } : t)
      )
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(['tables'], ctx.previous)
    },
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
