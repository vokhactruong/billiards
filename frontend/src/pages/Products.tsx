import { useState } from 'react'
import { Product, ProductCategory } from '@/types'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const categoryLabels: Record<ProductCategory, string> = {
  DRINK: 'Đồ uống',
  SNACK: 'Snack',
  OTHER: 'Khác',
}

const categoryVariants: Record<ProductCategory, 'default' | 'secondary' | 'outline'> = {
  DRINK: 'default',
  SNACK: 'secondary',
  OTHER: 'outline',
}

interface FormState {
  name: string
  category: ProductCategory
  costPrice: string
  sellingPrice: string
  stock: string
  minStock: string
}

const defaultForm: FormState = {
  name: '',
  category: 'DRINK',
  costPrice: '',
  sellingPrice: '',
  stock: '0',
  minStock: '5',
}

export default function Products() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)

  const { data: products, isLoading } = useProducts()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name,
      category: p.category,
      costPrice: String(p.costPrice),
      sellingPrice: String(p.sellingPrice),
      stock: String(p.stock),
      minStock: String(p.minStock),
    })
    setOpen(true)
  }

  const handleSubmit = async () => {
    const data = {
      name: form.name,
      category: form.category,
      costPrice: parseFloat(form.costPrice),
      sellingPrice: parseFloat(form.sellingPrice),
      stock: parseInt(form.stock),
      minStock: parseInt(form.minStock),
    }
    if (editing) {
      await updateProduct.mutateAsync({ id: editing.id, ...data })
    } else {
      await createProduct.mutateAsync(data as Omit<Product, 'id' | 'isActive'>)
    }
    setOpen(false)
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Sản phẩm</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Quản lý đồ uống, snack</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Thêm </span>SP
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {products?.map((p) => (
            <Card key={p.id} className={p.stock <= p.minStock ? 'border-red-800' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <Badge variant={categoryVariants[p.category]} className="text-xs mt-1">
                      {categoryLabels[p.category]}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteProduct.mutate(p.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Giá bán:</span>
                    <span className="font-medium text-foreground">{formatCurrency(Number(p.sellingPrice))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tồn kho:</span>
                    <span className={`font-medium ${p.stock <= p.minStock ? 'text-red-400' : 'text-foreground'}`}>
                      {p.stock} {p.stock <= p.minStock && '⚠️'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Tên sản phẩm</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ProductCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRINK">Đồ uống</SelectItem>
                  <SelectItem value="SNACK">Snack</SelectItem>
                  <SelectItem value="OTHER">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Giá vốn (VND)</Label>
              <Input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Giá bán (VND)</Label>
              <Input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
            </div>
            {!editing && (
              <div className="space-y-2">
                <Label>Tồn kho ban đầu</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Tồn kho tối thiểu</Label>
              <Input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} disabled={createProduct.isPending || updateProduct.isPending}>
              {editing ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
