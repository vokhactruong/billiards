import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Table2, ShoppingCart, Package, ClipboardList,
  BarChart3, Users, Settings, LogOut, Wifi, WifiOff
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/contexts/SocketContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['OWNER', 'MANAGER', 'STAFF'] },
  { to: '/tables', icon: Table2, label: 'Bàn Bida', roles: ['OWNER', 'MANAGER', 'STAFF'] },
  { to: '/orders', icon: ShoppingCart, label: 'Đặt món', roles: ['OWNER', 'MANAGER', 'STAFF'] },
  { to: '/products', icon: Package, label: 'Sản phẩm', roles: ['OWNER', 'MANAGER'] },
  { to: '/inventory', icon: ClipboardList, label: 'Kho hàng', roles: ['OWNER', 'MANAGER'] },
  { to: '/invoices', icon: ClipboardList, label: 'Hóa đơn', roles: ['OWNER', 'MANAGER'] },
  { to: '/reports', icon: BarChart3, label: 'Báo cáo', roles: ['OWNER', 'MANAGER'] },
  { to: '/users', icon: Users, label: 'Nhân viên', roles: ['OWNER'] },
  { to: '/settings', icon: Settings, label: 'Cài đặt', roles: ['OWNER'] },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const { connected } = useSocket()

  const allowedNav = navItems.filter((item) => user && item.roles.includes(user.role))

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          B
        </div>
        <div>
          <p className="text-sm font-bold leading-none">Billiard MS</p>
          <p className="text-xs text-muted-foreground">Management System</p>
        </div>
        <div className="ml-auto">
          {connected ? (
            <Wifi className="h-3 w-3 text-green-500" />
          ) : (
            <WifiOff className="h-3 w-3 text-red-500" />
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {allowedNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors mb-0.5',
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-2 px-2">
          <p className="text-xs font-medium">{user?.fullName}</p>
          <p className="text-xs text-muted-foreground">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
