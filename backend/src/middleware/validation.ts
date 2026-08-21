import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
    return;
  }
  next();
};

export const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  validateRequest
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
];

export const dateRangeValidation = [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  validateRequest
];

// User profile validations
export const updateProfileValidation = [
  body('name').optional().isString().isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  body('full_name').optional().isString().isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),
  body('avatar').optional().isString().isURL()
    .withMessage('Avatar must be a valid URL'),
  body('age').optional().isInt({ min: 1, max: 150 })
    .withMessage('Age must be a positive integer between 1 and 150'),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Gender must be one of: male, female, other, prefer_not_to_say'),
  body('height').optional().isFloat({ min: 0.1, max: 300 })
    .withMessage('Height must be a positive number between 0.1 and 300 cm'),
  body('weight').optional().isFloat({ min: 0.1, max: 500 })
    .withMessage('Weight must be a positive number between 0.1 and 500 kg'),
  body('fitnessGoal').optional().isIn(['weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'general_fitness'])
    .withMessage('Fitness goal must be one of: weight_loss, muscle_gain, maintenance, endurance, general_fitness'),
  body('fitness_goal').optional().isIn(['weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'general_fitness'])
    .withMessage('Fitness goal must be one of: weight_loss, muscle_gain, maintenance, endurance, general_fitness'),
  body('activityLevel').optional().isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'])
    .withMessage('Activity level must be one of: sedentary, lightly_active, moderately_active, very_active, extremely_active'),
  body('activity_level').optional().isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'])
    .withMessage('Activity level must be one of: sedentary, lightly_active, moderately_active, very_active, extremely_active'),
  // Ensure protected fields are not included
  body('id').not().exists().withMessage('Cannot update id'),
  body('email').not().exists().withMessage('Cannot update email'),
  body('password').not().exists().withMessage('Cannot update password directly'),
  body('password_hash').not().exists().withMessage('Cannot update password hash'),
  body('role').not().exists().withMessage('Cannot update role'),
  body('created_at').not().exists().withMessage('Cannot update created_at'),
  body('createdAt').not().exists().withMessage('Cannot update createdAt'),
  body('updated_at').not().exists().withMessage('Cannot update updated_at'),
  body('updatedAt').not().exists().withMessage('Cannot update updatedAt'),
  validateRequest
];

export const changePasswordValidation = [
  body('currentPassword').notEmpty()
    .withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
  body('newPassword').custom((value, { req }) => {
    if (value === req.body.currentPassword) {
      throw new Error('New password must be different from current password');
    }
    return true;
  }),
  validateRequest
];
