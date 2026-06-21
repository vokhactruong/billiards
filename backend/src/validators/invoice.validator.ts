import { body, param, query } from 'express-validator'

export const checkoutValidator = [
  param('sessionId').isInt().withMessage('Invalid session ID'),
  body('discount').optional().isFloat({ min: 0 }).withMessage('Discount must be >= 0'),
]

export const invoiceQueryValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
]
