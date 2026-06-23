import { Router } from 'express'
import { uploadImage } from '../controllers/upload.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/rbac.middleware'
import { upload } from '../middlewares/upload.middleware'

const router = Router()

router.post('/image', authenticate, authorize('OWNER', 'MANAGER'), upload.single('image'), uploadImage)

export default router
