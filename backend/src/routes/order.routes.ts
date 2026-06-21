import { Router } from 'express'
import { createOrder, getOrdersBySession, updateOrderItem } from '../controllers/order.controller'
import { createOrderValidator, updateOrderItemValidator } from '../validators/order.validator'
import { validate } from '../middlewares/validate.middleware'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/rbac.middleware'

const router = Router()

router.use(authenticate, authorize('OWNER', 'MANAGER', 'STAFF'))

router.post('/sessions/:sessionId', createOrderValidator, validate, createOrder)
router.get('/sessions/:sessionId', getOrdersBySession)
router.put('/:orderId/items', updateOrderItemValidator, validate, updateOrderItem)

export default router
