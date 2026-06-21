import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { DashboardStats, RevenueReport, RevenueParams, ApiResponse } from '@/types'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardStats>>('/reports/dashboard')
      return res.data.data
    },
    refetchInterval: 60000,
  })
}

export function useRevenueReport(params: RevenueParams) {
  const tz = -new Date().getTimezoneOffset() // +420 for Vietnam UTC+7
  return useQuery({
    queryKey: ['revenue-report', params],
    queryFn: async () => {
      const res = await api.get<ApiResponse<RevenueReport>>('/reports/revenue', {
        params: { ...params, tz },
      })
      return res.data.data
    },
    enabled: !!params.from && !!params.to,
  })
}

export function useProductReport(params?: { from: string; to: string }) {
  const tz = -new Date().getTimezoneOffset()
  return useQuery({
    queryKey: ['product-report', params],
    queryFn: async () => {
      const res = await api.get('/reports/products', { params: params ? { ...params, tz } : undefined })
      return res.data.data as { product: { id: number; name: string }; totalSold: number }[]
    },
  })
}
