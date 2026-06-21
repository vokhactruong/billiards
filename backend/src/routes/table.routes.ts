import { Router } from 'express'
import {
  getTables,
  openTable,
  pauseTable,
  resumeTable,
  transferTable,
  getSession,
  updateTablePrice,
  createTable,
  deleteTable,
  updateTableName,
} from '../controllers/table.controller'
import {
  openTableValidator,
  transferTableValidator,
  updateTablePriceValidator,
  createTableValidator,
  updateTableNameValidator,
} from '../validators/table.validator'
import { validate } from '../middlewares/validate.middleware'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/rbac.middleware'

const router = Router()

router.use(authenticate)

router.get('/', getTables)
router.post('/', authorize('OWNER'), createTableValidator, validate, createTable)
router.post('/:id/open', authorize('OWNER', 'MANAGER', 'STAFF'), openTableValidator, validate, openTable)
router.post('/:id/pause', authorize('OWNER', 'MANAGER', 'STAFF'), openTableValidator, validate, pauseTable)
router.post('/:id/resume', authorize('OWNER', 'MANAGER', 'STAFF'), openTableValidator, validate, resumeTable)
router.post('/:id/transfer', authorize('OWNER', 'MANAGER'), transferTableValidator, validate, transferTable)
router.get('/sessions/:sessionId', getSession)
router.put('/:id/price', authorize('OWNER'), updateTablePriceValidator, validate, updateTablePrice)
router.put('/:id/name', authorize('OWNER'), updateTableNameValidator, validate, updateTableName)
router.delete('/:id', authorize('OWNER'), deleteTable)

export default router
