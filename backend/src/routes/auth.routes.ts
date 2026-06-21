import { Router } from 'express'
import { login, getMe } from '../controllers/auth.controller'
import { loginValidator } from '../validators/auth.validator'
import { validate } from '../middlewares/validate.middleware'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

router.post('/login', loginValidator, validate, login)
router.get('/me', authenticate, getMe)

export default router
