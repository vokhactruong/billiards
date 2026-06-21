import { useState } from 'react'
import { User, Role } from '@/types'
import { useUsers, useCreateUser, useUpdateUser } from '@/hooks/useUsers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { Plus, Pencil, UserX, UserCheck } from 'lucide-react'

const roleVariants: Record<Role, 'default' | 'secondary' | 'outline'> = {
  OWNER: 'default',
  MANAGER: 'secondary',
  STAFF: 'outline',
}

const roleLabels: Record<Role, string> = {
  OWNER: 'Chủ quán',
  MANAGER: 'Quản lý',
  STAFF: 'Nhân viên',
}

interface FormState {
  username: string
  password: string
  fullName: string
  role: Role
}

const defaultForm: FormState = { username: '', password: '', fullName: '', role: 'STAFF' }

export default function Users() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)

  const { data: users, isLoading } = useUsers()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setOpen(true)
  }

  const openEdit = (u: User) => {
    setEditing(u)
    setForm({ username: u.username, password: '', fullName: u.fullName, role: u.role })
    setOpen(true)
  }

  const handleSubmit = async () => {
    if (editing) {
      await updateUser.mutateAsync({
        id: editing.id,
        fullName: form.fullName,
        role: form.role,
        ...(form.password ? { password: form.password } : {}),
      })
    } else {
      await createUser.mutateAsync(form)
    }
    setOpen(false)
  }

  const toggleActive = (u: User) => {
    updateUser.mutate({ id: u.id, isActive: !u.isActive })
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Nhân viên</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Quản lý tài khoản và phân quyền</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Thêm
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {users?.map((u) => (
            <Card key={u.id} className={!u.isActive ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{u.fullName}</p>
                    <p className="text-xs text-muted-foreground">@{u.username}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={roleVariants[u.role]}>{roleLabels[u.role]}</Badge>
                      {!u.isActive && <Badge variant="destructive">Vô hiệu</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tham gia: {format(new Date(u.createdAt), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(u)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => toggleActive(u)}
                    >
                      {u.isActive ? (
                        <UserX className="h-3 w-3 text-destructive" />
                      ) : (
                        <UserCheck className="h-3 w-3 text-green-500" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Sửa nhân viên' : 'Thêm nhân viên'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editing && (
              <div className="space-y-2">
                <Label>Tên đăng nhập</Label>
                <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Họ tên</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Mật khẩu {editing && '(để trống nếu không đổi)'}</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Vai trò</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWNER">Chủ quán</SelectItem>
                  <SelectItem value="MANAGER">Quản lý</SelectItem>
                  <SelectItem value="STAFF">Nhân viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} disabled={createUser.isPending || updateUser.isPending}>
              {editing ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
