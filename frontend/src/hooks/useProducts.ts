import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { Product, ProductCategory, ApiResponse } from '@/types'

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('image', file)
      const res = await api.post<ApiResponse<{ url: string }>>('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data.url
    },
  })
}

export function useProducts(category?: ProductCategory) {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      const params = category ? { category } : {}
      const res = await api.get<ApiResponse<Product[]>>('/products', { params })
      return res.data.data
    },
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Product, 'id' | 'isActive'>) => api.post('/products', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Product> & { id: number }) =>
      api.put(`/products/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}
