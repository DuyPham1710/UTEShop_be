import { 
  registerUserDto, 
  loginUserDto, 
  verifyOtpDto, 
  resendOtpDto, 
  refreshTokenDto, 
  updateProfileDto, 
  changePasswordDto, 
  deleteAccountDto, 
  forgotPasswordDto 
} from '../dto/userDto.js';

// Factory
const createValidationMiddleware = (dto) => {
  return (req, res, next) => {
    try {
      const errors = [];
      const data = req.body;

      Object.keys(dto).forEach(fieldName => {
        const field = dto[fieldName];
        const value = data[fieldName];

        if (field.required && (value === undefined || value === null || value === '')) {
          errors.push(`${fieldName}: ${field.message || 'is required'}`);
          return;
        }

        if (value === undefined || value === null) return;

        if (field.type === 'string' && typeof value !== 'string') {
          errors.push(`${fieldName}: must be a string`);
          return;
        }

        if (field.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`${fieldName}: must be a boolean`);
          return;
        }

        if (field.type === 'date') {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push(`${fieldName}: must be a valid date`);
            return;
          }
        }

        if (field.type === 'string' && typeof value === 'string') {
          if (field.minLength && value.length < field.minLength) {
            errors.push(`${fieldName}: ${field.message || `must be at least ${field.minLength} characters`}`);
          }
          if (field.maxLength && value.length > field.maxLength) {
            errors.push(`${fieldName}: ${field.message || `must be at most ${field.maxLength} characters`}`);
          }
        }

        if (field.pattern && typeof value === 'string' && !field.pattern.test(value)) {
          errors.push(`${fieldName}: ${field.message || 'format is invalid'}`);
        }

        if (field.validate && typeof field.validate === 'function') {
          try {
            if (!field.validate(value)) {
              errors.push(`${fieldName}: ${field.message || 'validation failed'}`);
            }
          } catch {
            errors.push(`${fieldName}: validation error`);
          }
        }
      });

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Validation error'
      });
    }
  };
};

// Named exports
export const validateRegister = createValidationMiddleware(registerUserDto);
export const validateLogin = createValidationMiddleware(loginUserDto);
export const validateVerifyOtp = createValidationMiddleware(verifyOtpDto);
export const validateResendOtp = createValidationMiddleware(resendOtpDto);
export const validateRefreshToken = createValidationMiddleware(refreshTokenDto);
export const validateUpdateProfile = createValidationMiddleware(updateProfileDto);
export const validateChangePassword = createValidationMiddleware(changePasswordDto);
export const validateDeleteAccount = createValidationMiddleware(deleteAccountDto);
export const validateForgotPassword = createValidationMiddleware(forgotPasswordDto);
