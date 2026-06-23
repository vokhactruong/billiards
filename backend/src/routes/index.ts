import { Router } from 'express'
import authRoutes from './auth.routes'
import userRoutes from './user.routes'
import tableRoutes from './table.routes'
import orderRoutes from './order.routes'
import productRoutes from './product.routes'
import inventoryRoutes from './inventory.routes'
import invoiceRoutes from './invoice.routes'
import reportRoutes from './report.routes'
import uploadRoutes from './upload.routes'

const router = Router()

router.get('/time', (_req, res) => {
  res.json({ serverTime: Date.now() })
})

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/tables', tableRoutes)
router.use('/orders', orderRoutes)
router.use('/products', productRoutes)
router.use('/inventory', inventoryRoutes)
router.use('/invoices', invoiceRoutes)
router.use('/reports', reportRoutes)
router.use('/upload', uploadRoutes)

export default router
