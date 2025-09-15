# UTEShop Backend API

Backend API cho ứng dụng UTEShop sử dụng ExpressJS và MongoDB với chức năng xác thực OTP và JWT.

## Tính năng

- Đăng ký tài khoản với OTP
- Đăng nhập với JWT
- Xác thực OTP qua email/phone
- Refresh token
- Middleware xác thực
- Quản lý profile người dùng
- Cập nhật thông tin cá nhân
- Đổi mật khẩu
- Xóa tài khoản
- **Validation với DTO**
- **Tách biệt Service theo domain**

## Cài đặt

1. Clone repository
2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` với nội dung:
```env
MONGO_URI=mongodb://localhost:27017/uteshop
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_make_it_long_and_secure
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
OTP_EXPIRES_IN=5m
PORT=6969
NODE_ENV=development
```

4. Khởi động MongoDB
5. Chạy ứng dụng:
```bash
npm run dev
```

## API Endpoints

### Public Routes (Không cần xác thực)

#### 1. Đăng ký tài khoản
```
POST /v1/api/register
```
Body:
```json
{
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0123456789",
  "gender": true,
  "dateOfBirth": "1990-01-01",
  "avt": "avatar.jpg",
  "email": "user@example.com",
  "username": "username",
  "password": "Password123!"
}
```

**Validation:**
- `fullName`: 2-100 ký tự, chỉ chữ cái và khoảng trắng
- `email`: Định dạng email hợp lệ
- `username`: 3-30 ký tự, chỉ chữ cái, số và dấu gạch dưới
- `password`: Tối thiểu 6 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt

#### 2. Đăng nhập
```
POST /v1/api/login
```
Body:
```json
{
  "username": "username",
  "password": "Password123!"
}
```

#### 3. Xác thực OTP
```
POST /v1/api/verify-otp
```
Body:
```json
{
  "userId": "user_id_here",
  "otp": "123456"
}
```

#### 4. Gửi lại OTP
```
POST /v1/api/resend-otp
```
Body:
```json
{
  "email": "user_id_here"
}
```

#### 5. Refresh Token
```
POST /v1/api/refresh-token
```
Body:
```json
{
  "refreshToken": "refresh_token_here"
}
```

### Protected Routes (Cần xác thực)

#### 6. Đăng xuất // Không có?
```
POST /v1/api/logout
```
Headers:
```
Authorization: Bearer <access_token>
```

#### 7. Lấy thông tin profile
```
GET /v1/api/profile
```
Headers:
```
Authorization: Bearer <access_token>
```

#### 8. Cập nhật profile ?? =))
```
PUT /v1/api/profile
```
Headers:
```
Authorization: Bearer <access_token>
```
Body:
```json
{
  "fullName": "Nguyễn Văn B",
  "phoneNumber": "0987654321",
  "gender": false,
  "dateOfBirth": "1995-05-15",
  "avt": "new_avatar.jpg"
}
```

#### 9. Đổi mật khẩu
```
PUT /v1/api/change-password
```
Headers:
```
Authorization: Bearer <access_token>
```
Body:
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

#### 10. Xóa tài khoản
```
DELETE /v1/api/account
```
Headers:
```
Authorization: Bearer <access_token>
```
Body:
```json
{
  "password": "current_password"
}
```
#### 11. Quên mật khẩu:

Nhấn nút gửi OTP → gọi API `reSendOTP`:

POST: 
```
http://localhost:3000/v1/api/resend-otp
```
Body (raw):
```
{
    "email": "user@example.com"
}
```
Sau đó, khi user nhập đầy đủ thông tin, nhấn đổi mật khẩu, gọi API:

POST: 
```
http://localhost:3000/v1/api/forgot-password
```
Body (raw):
```
{
    "email": "user@example.com",
    "otp": "725976",
    "newPassword": "datVo001!"
}
```
## Luồng hoạt động

### Đăng ký:
1. User gửi thông tin đăng ký
2. **Validation middleware** kiểm tra dữ liệu theo DTO
3. Hệ thống tạo tài khoản với `isActive: false`
4. Gửi OTP qua email/phone (hiện tại log ra console)
5. User xác thực OTP để kích hoạt tài khoản

### Đăng nhập:
1. User gửi username/email và password
2. **Validation middleware** kiểm tra dữ liệu
3. Hệ thống kiểm tra tài khoản đã kích hoạt chưa
4. Nếu chưa kích hoạt, yêu cầu xác thực OTP
5. Nếu đã kích hoạt, trả về access token và refresh token

### Xác thực:
- Access token có thời hạn 15 phút
- Refresh token có thời hạn 7 ngày
- Sử dụng refresh token để lấy access token mới

### Quên mật khẩu:
- User nhập vào email, bấm chọn quên mật khẩu
- User nhập vào email, sau đó bấm chọn nhận mã OTP (gọi tới resendOTP)
- User nhập vào đầy đủ 4 fields, email, otp, newPassword và re-type của newPassword

## Cấu trúc dự án

```
src/
├── config/
│   ├── database.js          # Kết nối MongoDB
│   └── viewEngine.js        # Cấu hình view engine
├── controllers/
│   ├── authController.js    # Xử lý xác thực (login, register, OTP)
│   └── userController.js    # Xử lý thông tin user (profile, update)
├── middleware/
│   ├── auth.js              # Middleware xác thực JWT
│   ├── delay.js             # Middleware delay
│   └── validation.js        # Middleware validation sử dụng DTO
├── models/
│   └── user.js              # Schema MongoDB
├── services/
│   ├── auth/
│   │   └── authService.js   # Logic xác thực (register, login, token)
│   ├── user/
│   │   └── userService.js   # Logic quản lý user (profile, update)
│   └── otp/
│       └── otpService.js    # Logic xử lý OTP
├── dto/
│   └── userDto.js           # Data Transfer Objects cho validation
├── routes/
│   └── api.js               # Định nghĩa routes với validation
└── server.js                # Entry point
```

## Phân chia Controller & Service

### 🔐 **authController.js** + **authService.js** - Xử lý xác thực:
- `registerUser` - Đăng ký tài khoản
- `loginUser` - Đăng nhập
- `verifyOTP` - Xác thực OTP
- `resendOTP` - Gửi lại OTP
- `refreshToken` - Làm mới token
- `logoutUser` - Đăng xuất

### 👤 **userController.js** + **userService.js** - Xử lý thông tin user:
- `getUserProfile` - Lấy thông tin profile
- `updateUserProfile` - Cập nhật thông tin profile
- `changePassword` - Đổi mật khẩu
- `deleteUser` - Xóa tài khoản

### 📱 **otpService.js** - Xử lý OTP:
- `generateOTP` - Tạo OTP 6 số
- `sendOTP` - Gửi OTP
- `verifyOTP` - Xác thực OTP
- `resendOTP` - Gửi lại OTP

## DTO (Data Transfer Objects)

### 🎯 **Mục đích:**
- **Validation** dữ liệu đầu vào
- **Type safety** và format checking
- **Security** (chỉ cho phép fields cần thiết)
- **Documentation** API rõ ràng

### 📋 **Các DTO đã implement:**
- `registerUserDto` - Validation đăng ký
- `loginUserDto` - Validation đăng nhập
- `verifyOtpDto` - Validation OTP
- `updateProfileDto` - Validation cập nhật profile
- `changePasswordDto` - Validation đổi mật khẩu
- `deleteAccountDto` - Validation xóa tài khoản

### ✅ **Validation rules:**
- **Email**: Định dạng email hợp lệ
- **Password**: Tối thiểu 6 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt
- **Username**: 3-30 ký tự, chỉ chữ cái, số và dấu gạch dưới
- **FullName**: 2-100 ký tự, hỗ trợ tiếng Việt
- **PhoneNumber**: Định dạng số điện thoại
- **DateOfBirth**: Tuổi từ 13-120
- **Avatar**: File ảnh hợp lệ

## Lưu ý

- OTP hiện tại được log ra console, trong thực tế cần tích hợp SMS/Email service
- JWT secret cần được bảo mật và thay đổi trong production
- **Validation middleware** tự động kiểm tra tất cả request theo DTO
- Có thể thêm rate limiting để tránh spam
- Nên sử dụng HTTPS trong production
- Các API được bảo vệ cần có header `Authorization: Bearer <token>`
- **Service layer** tách biệt logic nghiệp vụ theo domain

## Testing

Sử dụng Postman hoặc các tool tương tự để test API:

1. Test đăng ký và xác thực OTP
2. Test đăng nhập và lấy token
3. Test các API được bảo vệ
4. Test refresh token
5. Test cập nhật profile và đổi mật khẩu
6. Test logout và xóa tài khoản
7. **Test validation** với dữ liệu không hợp lệ
