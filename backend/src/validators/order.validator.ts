import { body, param } from 'express-validator'

export const createOrderValidator = [
  param('sessionId').isInt().withMessage('Invalid session ID'),
  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('items.*.productId').isInt().withMessage('Product ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
]

export const updateOrderItemValidator = [
  param('orderId').isInt().withMessage('Invalid order ID'),
  body('productId').isInt().withMessage('Product ID required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be 0 or more'),
]
