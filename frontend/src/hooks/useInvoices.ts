import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { Invoice, ApiResponse } from '@/types'

export function useInvoices(params?: { page?: number; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Invoice[]>>('/invoices', { params })
      return { data: res.data.data, meta: res.data.meta }
    },
  })
}

export function useInvoice(id: number | null) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Invoice>>(`/invoices/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useCheckout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, discount }: { sessionId: number; discount?: number }) =>
      api.post(`/invoices/checkout/${sessionId}`, { discount }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] })
      qc.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}
