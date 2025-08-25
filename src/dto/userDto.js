const registerUserDto = {
    fullName: {
        type: 'string',
        required: true,
        minLength: 2,
        maxLength: 100,
        pattern: /^[a-zA-ZÀ-ỹ\s]+$/, // Allow Vietnamese characters
        message: 'Full name must be 2-100 characters and contain only letters and spaces'
    },
    phoneNumber: {
        type: 'string',
        required: false,
        pattern: /^[0-9+\-\s()]+$/,
        message: 'Phone number format is invalid'
    },
    gender: {
        type: 'boolean',
        required: false,
        default: false
    },
    dateOfBirth: {
        type: 'date',
        required: false,
        validate: (value) => {
            const date = new Date(value);
            const now = new Date();
            const age = now.getFullYear() - date.getFullYear();
            return age >= 13 && age <= 120;
        },
        message: 'Date of birth must be valid and user must be at least 13 years old'
    },
    avt: {
        type: 'string',
        required: false,
        pattern: /^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif|webp)$/,
        message: 'Avatar must be a valid image file'
    },
    email: {
        type: 'string',
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Email format is invalid'
    },
    username: {
        type: 'string',
        required: true,
        minLength: 3,
        maxLength: 30,
        pattern: /^[a-zA-Z0-9_]+$/,
        message: 'Username must be 3-30 characters and contain only letters, numbers, and underscores'
    },
    password: {
        type: 'string',
        required: true,
        minLength: 6,
        maxLength: 128,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        message: 'Password must be at least 6 characters with uppercase, lowercase, number, and special character'
    }
};

// DTO for user login
const loginUserDto = {
    username: {
        type: 'string',
        required: true,
        message: 'Username or email is required'
    },
    password: {
        type: 'string',
        required: true,
        message: 'Password is required'
    }
};

// DTO for OTP verification
const verifyOtpDto = {
    email: {
        type: 'string',
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Email format is invalid'
    },
    otp: {
        type: 'string',
        required: true,
        pattern: /^[0-9]{6}$/,
        message: 'OTP must be exactly 6 digits'
    }
};

// DTO for resend OTP
const resendOtpDto = {
    email: {
        type: 'string',
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Email format is invalid'
    }
};

// DTO for refresh token
const refreshTokenDto = {
    refreshToken: {
        type: 'string',
        required: true,
        message: 'Refresh token is required'
    }
};

// DTO for profile update
const updateProfileDto = {
    fullName: {
        type: 'string',
        required: false,
        minLength: 2,
        maxLength: 100,
        pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
        message: 'Full name must be 2-100 characters and contain only letters and spaces'
    },
    phoneNumber: {
        type: 'string',
        required: false,
        pattern: /^[0-9+\-\s()]+$/,
        message: 'Phone number format is invalid'
    },
    gender: {
        type: 'boolean',
        required: false
    },
    dateOfBirth: {
        type: 'date',
        required: false,
        validate: (value) => {
            const date = new Date(value);
            const now = new Date();
            const age = now.getFullYear() - date.getFullYear();
            return age >= 13 && age <= 120;
        },
        message: 'Date of birth must be valid and user must be at least 13 years old'
    },
    avt: {
        type: 'string',
        required: false,
        pattern: /^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif|webp)$/,
        message: 'Avatar must be a valid image file'
    }
};

// DTO for change password
const changePasswordDto = {
    currentPassword: {
        type: 'string',
        required: true,
        message: 'Current password is required'
    },
    newPassword: {
        type: 'string',
        required: true,
        minLength: 6,
        maxLength: 128,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        message: 'New password must be at least 6 characters with uppercase, lowercase, number, and special character'
    }
};

// DTP for forgot password
const forgotPasswordDto = {
        newPassword: {
        type: 'string',
        required: true,
        minLength: 6,
        maxLength: 128,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        message: 'New password must be at least 6 characters with uppercase, lowercase, number, and special character'
    }
};

// DTO for delete account
const deleteAccountDto = {
    password: {
        type: 'string',
        required: true,
        message: 'Password is required to confirm account deletion'
    }
};

module.exports = {
    registerUserDto,
    loginUserDto,
    verifyOtpDto,
    resendOtpDto,
    refreshTokenDto,
    updateProfileDto,
    changePasswordDto,
    deleteAccountDto,
    forgotPasswordDto
};
