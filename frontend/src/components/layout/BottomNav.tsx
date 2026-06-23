import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Table2, MoreHorizontal,
  Package, ClipboardList, BarChart3, Users, Settings,
  LogOut, Wifi, WifiOff, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/contexts/SocketContext'

const primaryNav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['OWNER', 'MANAGER', 'STAFF'] },
  { to: '/tables', icon: Table2, label: 'Bàn Bida', roles: ['OWNER', 'MANAGER', 'STAFF'] },
]

const secondaryNav = [
  { to: '/products', icon: Package, label: 'Sản phẩm', roles: ['OWNER', 'MANAGER'] },
  { to: '/inventory', icon: ClipboardList, label: 'Kho hàng', roles: ['OWNER', 'MANAGER'] },
  { to: '/invoices', icon: ClipboardList, label: 'Hóa đơn', roles: ['OWNER', 'MANAGER'] },
  { to: '/reports', icon: BarChart3, label: 'Báo cáo', roles: ['OWNER', 'MANAGER'] },
  { to: '/users', icon: Users, label: 'Nhân viên', roles: ['OWNER'] },
  { to: '/settings', icon: Settings, label: 'Cài đặt', roles: ['OWNER'] },
]

export function BottomNav() {
  const { user, logout } = useAuth()
  const { connected } = useSocket()
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (!user) return null

  const allowedPrimary = primaryNav.filter((i) => i.roles.includes(user.role))
  const allowedSecondary = secondaryNav.filter((i) => i.roles.includes(user.role))

  return (
    <>
      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md md:hidden pb-safe">
        <div className="flex h-16 items-stretch">
          {allowedPrimary.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center justify-center gap-1 text-[10px] transition-colors',
                  isActive ? 'text-primary' : 'text-zinc-500 hover:text-zinc-300'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {allowedSecondary.length > 0 && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span>Thêm</span>
            </button>
          )}
        </div>
      </nav>

      {/* Slide-up Drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-zinc-800 bg-zinc-950 pb-safe md:hidden animate-in slide-in-from-bottom-4 duration-200">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-zinc-700" />
            </div>

            {/* User info */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
              <div>
                <p className="text-sm font-semibold">{user.fullName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-zinc-500">{user.role}</p>
                  <span className="text-zinc-700">·</span>
                  {connected ? (
                    <span className="flex items-center gap-1 text-xs text-green-500"><Wifi className="h-3 w-3" />Online</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-500"><WifiOff className="h-3 w-3" />Offline</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Secondary nav items */}
            <div className="grid grid-cols-3 gap-2 p-4">
              {allowedSecondary.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex flex-col items-center gap-2 rounded-xl p-3 text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-zinc-800 text-primary'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Logout */}
            <div className="px-4 pb-6">
              <button
                onClick={() => { logout(); setDrawerOpen(false) }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm text-red-400 hover:bg-red-950/40 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
