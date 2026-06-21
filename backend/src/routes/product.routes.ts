import { Router } from 'express'
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller'
import { createProductValidator, updateProductValidator } from '../validators/product.validator'
import { validate } from '../middlewares/validate.middleware'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/rbac.middleware'

const router = Router()

router.use(authenticate)

router.get('/', getProducts)
router.get('/:id', getProductById)
router.post('/', authorize('OWNER', 'MANAGER'), createProductValidator, validate, createProduct)
router.put('/:id', authorize('OWNER', 'MANAGER'), updateProductValidator, validate, updateProduct)
router.delete('/:id', authorize('OWNER'), deleteProduct)

export default router
