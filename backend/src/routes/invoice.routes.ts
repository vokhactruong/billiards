import { Router } from 'express'
import { checkout, getInvoices, getInvoiceById } from '../controllers/invoice.controller'
import { checkoutValidator, invoiceQueryValidator } from '../validators/invoice.validator'
import { validate } from '../middlewares/validate.middleware'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/rbac.middleware'

const router = Router()

router.use(authenticate)

router.post('/checkout/:sessionId', authorize('OWNER', 'MANAGER', 'STAFF'), checkoutValidator, validate, checkout)
router.get('/', authorize('OWNER', 'MANAGER'), invoiceQueryValidator, validate, getInvoices)
router.get('/:id', authorize('OWNER', 'MANAGER'), getInvoiceById)

export default router
