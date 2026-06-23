import { Router } from 'express'
import { checkout, getInvoices, getInvoiceById, updateInvoice, deleteInvoice } from '../controllers/invoice.controller'
import { checkoutValidator, invoiceQueryValidator, updateInvoiceValidator } from '../validators/invoice.validator'
import { validate } from '../middlewares/validate.middleware'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/rbac.middleware'

const router = Router()

router.use(authenticate)

router.post('/checkout/:sessionId', authorize('OWNER', 'MANAGER', 'STAFF'), checkoutValidator, validate, checkout)
router.get('/', authorize('OWNER', 'MANAGER'), invoiceQueryValidator, validate, getInvoices)
router.get('/:id', authorize('OWNER', 'MANAGER'), getInvoiceById)
router.put('/:id', authorize('OWNER'), updateInvoiceValidator, validate, updateInvoice)
router.delete('/:id', authorize('OWNER'), deleteInvoice)

export default router
