import { body, param } from 'express-validator'

export const createProductValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').isIn(['DRINK', 'SNACK', 'OTHER']).withMessage('Invalid category'),
  body('costPrice').isFloat({ min: 0 }).withMessage('Cost price must be >= 0'),
  body('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be >= 0'),
  body('stock').optional().isInt({ min: 0 }),
  body('minStock').optional().isInt({ min: 0 }),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
]

export const updateProductValidator = [
  param('id').isInt().withMessage('Invalid product ID'),
  body('name').optional().trim().notEmpty(),
  body('category').optional().isIn(['DRINK', 'SNACK', 'OTHER']),
  body('costPrice').optional().isFloat({ min: 0 }),
  body('sellingPrice').optional().isFloat({ min: 0 }),
  body('minStock').optional().isInt({ min: 0 }),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
]

export const importStockValidator = [
  param('id').isInt().withMessage('Invalid product ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('note').optional().trim(),
]

export const adjustStockValidator = [
  param('id').isInt().withMessage('Invalid product ID'),
  body('quantity').isInt().withMessage('Quantity required (can be negative)'),
  body('note').optional().trim(),
]
