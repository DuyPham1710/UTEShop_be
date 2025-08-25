const { registerUserDto, loginUserDto, verifyOtpDto, resendOtpDto, refreshTokenDto, updateProfileDto, changePasswordDto, deleteAccountDto } = require('../dto/userDto.js');

// Validation middleware factory
const createValidationMiddleware = (dto) => {
    return (req, res, next) => {
        try {
            const errors = [];
            const data = req.body;

            // Validate each field according to DTO
            Object.keys(dto).forEach(fieldName => {
                const field = dto[fieldName];
                const value = data[fieldName];

                // Check required fields
                if (field.required && (value === undefined || value === null || value === '')) {
                    errors.push(`${fieldName}: ${field.message || 'is required'}`);
                    return;
                }

                // Skip validation for undefined optional fields
                if (value === undefined || value === null) {
                    return;
                }

                // Type validation
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

                // Length validation for strings
                if (field.type === 'string' && typeof value === 'string') {
                    if (field.minLength && value.length < field.minLength) {
                        errors.push(`${fieldName}: ${field.message || `must be at least ${field.minLength} characters`}`);
                    }

                    if (field.maxLength && value.length > field.maxLength) {
                        errors.push(`${fieldName}: ${field.message || `must be at most ${field.maxLength} characters`}`);
                    }
                }

                // Pattern validation
                if (field.pattern && typeof value === 'string') {
                    if (!field.pattern.test(value)) {
                        errors.push(`${fieldName}: ${field.message || 'format is invalid'}`);
                    }
                }

                // Custom validation
                if (field.validate && typeof field.validate === 'function') {
                    try {
                        if (!field.validate(value)) {
                            errors.push(`${fieldName}: ${field.message || 'validation failed'}`);
                        }
                    } catch (error) {
                        errors.push(`${fieldName}: validation error`);
                    }
                }
            });

            // If there are validation errors, return them
            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors
                });
            }

            // Validation passed
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

module.exports = {
    validateRegister: createValidationMiddleware(registerUserDto),
    validateLogin: createValidationMiddleware(loginUserDto),
    validateVerifyOtp: createValidationMiddleware(verifyOtpDto),
    validateResendOtp: createValidationMiddleware(resendOtpDto),
    validateRefreshToken: createValidationMiddleware(refreshTokenDto),
    validateUpdateProfile: createValidationMiddleware(updateProfileDto),
    validateChangePassword: createValidationMiddleware(changePasswordDto),
    validateDeleteAccount: createValidationMiddleware(deleteAccountDto)
};
