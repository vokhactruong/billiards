import { Router } from 'express'
import { importStock, adjustStock, getInventoryHistory, getLowStock } from '../controllers/inventory.controller'
import { importStockValidator, adjustStockValidator } from '../validators/product.validator'
import { validate } from '../middlewares/validate.middleware'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/rbac.middleware'

const router = Router()

router.use(authenticate, authorize('OWNER', 'MANAGER'))

router.get('/history', getInventoryHistory)
router.get('/low-stock', getLowStock)
router.post('/:id/import', importStockValidator, validate, importStock)
router.post('/:id/adjust', adjustStockValidator, validate, adjustStock)

export default router
