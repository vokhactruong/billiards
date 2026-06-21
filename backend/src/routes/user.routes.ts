import { Router } from 'express'
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/user.controller'
import { createUserValidator, updateUserValidator } from '../validators/user.validator'
import { validate } from '../middlewares/validate.middleware'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/rbac.middleware'

const router = Router()

router.use(authenticate, authorize('OWNER'))

router.get('/', getUsers)
router.post('/', createUserValidator, validate, createUser)
router.put('/:id', updateUserValidator, validate, updateUser)
router.delete('/:id', deleteUser)

export default router
