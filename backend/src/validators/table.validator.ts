import { body, param } from 'express-validator'

export const openTableValidator = [
  param('id').isInt().withMessage('Invalid table ID'),
]

export const transferTableValidator = [
  param('id').isInt().withMessage('Invalid table ID'),
  body('targetTableId').isInt().withMessage('Target table ID required'),
]

export const updateTablePriceValidator = [
  param('id').isInt().withMessage('Invalid table ID'),
  body('pricePerHour').isFloat({ min: 1000 }).withMessage('Invalid price'),
]

export const createTableValidator = [
  body('name').trim().notEmpty().withMessage('Tên bàn không được để trống'),
  body('pricePerHour').isFloat({ min: 1000 }).withMessage('Giá phải >= 1,000 VND'),
]

export const updateTableNameValidator = [
  param('id').isInt().withMessage('Invalid table ID'),
  body('name').trim().notEmpty().withMessage('Tên bàn không được để trống'),
]
