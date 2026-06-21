import { body, param } from 'express-validator'

export const createUserValidator = [
  body('username').trim().notEmpty().isLength({ min: 3 }).withMessage('Username min 3 chars'),
  body('password').notEmpty().isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('role').isIn(['OWNER', 'MANAGER', 'STAFF']).withMessage('Invalid role'),
]

export const updateUserValidator = [
  param('id').isInt().withMessage('Invalid user ID'),
  body('fullName').optional().trim().notEmpty(),
  body('role').optional().isIn(['OWNER', 'MANAGER', 'STAFF']),
  body('isActive').optional().isBoolean(),
  body('password').optional().isLength({ min: 6 }),
]
