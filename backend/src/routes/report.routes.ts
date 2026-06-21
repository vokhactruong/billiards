import { Router } from 'express'
import { getDashboardStats, getRevenueReport, getProductReport, getInventoryReport } from '../controllers/report.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/rbac.middleware'

const router = Router()

router.use(authenticate, authorize('OWNER', 'MANAGER'))

router.get('/dashboard', getDashboardStats)
router.get('/revenue', getRevenueReport)
router.get('/products', getProductReport)
router.get('/inventory', getInventoryReport)

export default router
