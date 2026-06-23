export type Role = 'OWNER' | 'MANAGER' | 'STAFF'
export type TableStatus = 'AVAILABLE' | 'PLAYING' | 'PAUSED'
export type ProductCategory = 'DRINK' | 'SNACK' | 'OTHER'
export type TransactionType = 'IMPORT' | 'ADJUSTMENT' | 'SALE'

export interface User {
  id: number
  username: string
  fullName: string
  role: Role
  isActive: boolean
  createdAt: string
}

export interface Table {
  id: number
  name: string
  status: TableStatus
  pricePerHour: number
  isActive: boolean
  sessions: TableSession[]
}

export interface TableSession {
  id: number
  tableId: number
  startedAt: string
  pausedAt: string | null
  resumedAt: string | null
  closedAt: string | null
  totalPausedMs: number | string
  isActive: boolean
  table?: Table
  orders?: Order[]
}

export interface Product {
  id: number
  name: string
  category: ProductCategory
  costPrice: number
  sellingPrice: number
  stock: number
  minStock: number
  imageUrl?: string
  isActive: boolean
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  quantity: number
  unitPrice: number
  product: Product
}

export interface Order {
  id: number
  sessionId: number
  createdAt: string
  orderItems: OrderItem[]
}

export interface InvoiceItem {
  id: number
  invoiceId: number
  productId: number
  quantity: number
  unitPrice: number
  product: Product
}

export interface Invoice {
  id: number
  sessionId: number
  tableAmount: number
  foodAmount: number
  discount: number
  totalAmount: number
  duration: number
  createdAt: string
  invoiceItems: InvoiceItem[]
  session: TableSession & { table: Table }
}

export interface InventoryTransaction {
  id: number
  productId: number
  type: TransactionType
  quantity: number
  note: string | null
  createdAt: string
  product: Product
}

export interface DashboardStats {
  activeTables: number
  todayRevenue: number
  monthRevenue: number
  lowStockCount: number
  lowStockProducts: Product[]
}

export interface RevenueData {
  label: string
  total: number
  tableAmount: number
  foodAmount: number
}

export interface RevenueSummary {
  total: number
  tableAmount: number
  foodAmount: number
  invoiceCount: number
}

export interface RevenueReport {
  summary: RevenueSummary
  chart: RevenueData[]
}

export interface RevenueParams {
  from: string
  to: string
  groupBy: 'hour' | 'day'
}

export interface TableSummary {
  id: number
  name: string
  status: TableStatus
  pricePerHour: string
  isActive: boolean
  elapsedMs: number | null
  amount: number | null
  currentSessionId: number | null
}

export interface TableDetail {
  sessionId: number
  startedAt: string
  pausedAt: string | null
  totalPausedMs: string
  orders: Order[]
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
