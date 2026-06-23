import { useState, useRef } from 'react'
import { Product, ProductCategory } from '@/types'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useUploadImage } from '@/hooks/useProducts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, ImagePlus, X } from 'lucide-react'

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
  imageUrl: string
}

const defaultForm: FormState = {
  name: '',
  category: 'DRINK',
  costPrice: '',
  sellingPrice: '',
  stock: '0',
  minStock: '5',
  imageUrl: '',
}

export default function Products() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: products, isLoading } = useProducts()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()
  const uploadImage = useUploadImage()

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setImageFile(null)
    setImagePreview('')
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
      imageUrl: p.imageUrl ?? '',
    })
    setImageFile(null)
    setImagePreview(p.imageUrl ?? '')
    setOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    setForm({ ...form, imageUrl: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    let imageUrl = form.imageUrl
    if (imageFile) {
      imageUrl = await uploadImage.mutateAsync(imageFile)
    }
    const data = {
      name: form.name,
      category: form.category,
      costPrice: parseFloat(form.costPrice),
      sellingPrice: parseFloat(form.sellingPrice),
      stock: parseInt(form.stock),
      minStock: parseInt(form.minStock),
      imageUrl: imageUrl || undefined,
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
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-28 object-cover rounded-md mb-3"
                  />
                )}
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
              <Label>Ảnh sản phẩm</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {imagePreview ? (
                <div className="relative w-full h-36">
                  <img src={imagePreview} alt="preview" className="w-full h-36 object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-0.5 hover:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-28 rounded-md border border-dashed border-zinc-600 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-zinc-400 hover:text-foreground transition-colors"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs">Chọn ảnh (tối đa 5MB)</span>
                </button>
              )}
            </div>
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
            <Button
              onClick={handleSubmit}
              disabled={createProduct.isPending || updateProduct.isPending || uploadImage.isPending}
            >
              {uploadImage.isPending ? 'Đang tải ảnh...' : editing ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
