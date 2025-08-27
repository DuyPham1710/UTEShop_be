# Test API UTEShop

## Chuẩn bị

1. Đảm bảo MongoDB đang chạy
2. Tạo file `.env` với các biến môi trường cần thiết
3. Chạy `npm run dev` để khởi động server

## Test các API

### 1. Test đăng ký tài khoản

**Endpoint:** `POST http://localhost:6969/v1/api/register`

**Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0123456789",
  "gender": true,
  "dateOfBirth": "1990-01-01",
  "avt": "avatar.jpg",
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully. please check mail and verify account within 5 minute.",
  "data": {
    "_id": "user_id_here",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0123456789",
    "gender": true,
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "avt": "avatar.jpg",
    "email": "user@example.com",
    "username": "username",
    "isActive": false
  }
}
```

### 2. Test xác thực OTP

**Endpoint:** `POST http://localhost:6969/v1/api/verify-otp`

**Body:**
```json
{
  "email": "name@gmail.com",
  "otp": "123456"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

### 3. Test đăng nhập

**Endpoint:** `POST http://localhost:6969/v1/api/login`

**Body:**
```json
{
  "username": "username",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id_here",
      "fullName": "Nguyễn Văn A",
      "phoneNumber": "0123456789",
      "gender": true,
      "dateOfBirth": "1990-01-01T00:00:00.000Z",
      "avt": "avatar.jpg",
      "email": "user@example.com",
      "username": "username",
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Lưu ý:** Lưu `accessToken` và `refreshToken` để sử dụng cho các API được bảo vệ.

### 4. Test lấy thông tin profile (Protected Route)

**Endpoint:** `GET http://localhost:6969/v1/api/profile`

**Headers:**
```
Authorization: Bearer <access_token_from_login>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id_here",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0123456789",
    "gender": true,
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "avt": "avatar.jpg",
    "email": "user@example.com",
    "username": "username",
    "isActive": true
  }
}
```

### 5. Test refresh token

**Endpoint:** `POST http://localhost:6969/v1/api/refresh-token`

**Body:**
```json
{
  "refreshToken": "refresh_token_from_login"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_access_token_here"
  }
}
```

### 6. Test gửi lại OTP

**Endpoint:** `POST http://localhost:6969/v1/api/resend-otp`

**Body:**
```json
{
  "email": "name@gmail.com"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP resent successfully"
}
```

## Test với Postman

1. **Tạo Collection mới** tên "UTEShop API"
2. **Import các request** từ các endpoint trên
3. **Set Environment Variables:**
   - `base_url`: `http://localhost:6969/v1/api`
   - `access_token`: Lưu token sau khi login
   - `refresh_token`: Lưu refresh token sau khi login
   - `user_id`: Lưu user ID sau khi register

4. **Test theo thứ tự:**
   - Register → Lưu user_id
   - Verify OTP → Sử dụng user_id và OTP từ console
   - Login → Lưu access_token và refresh_token
   - Profile → Sử dụng access_token
   - Refresh Token → Sử dụng refresh_token
   - Logout → Sử dụng access_token

## Test với cURL

### Register
```bash
curl -X POST http://localhost:6969/v1/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0123456789",
    "gender": true,
    "dateOfBirth": "1990-01-01",
    "avt": "avatar.jpg",
    "email": "user@example.com",
    "username": "username",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:6969/v1/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "username",
    "password": "password123"
  }'
```

### Profile (Protected)
```bash
curl -X GET http://localhost:6969/v1/api/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Lưu ý khi test

1. **OTP sẽ được log ra console** của server, không gửi thực tế
2. **Access token có thời hạn 15 phút**, cần refresh khi hết hạn
3. **Refresh token có thời hạn 7 ngày**
4. **Tài khoản chưa verify OTP sẽ không thể login**
5. **Các API được bảo vệ cần có header Authorization**

## Troubleshooting

### Lỗi thường gặp:

1. **"User not found"**: Kiểm tra user_id có đúng không
2. **"Invalid OTP"**: Kiểm tra OTP từ console server
3. **"Token expired"**: Sử dụng refresh token để lấy token mới
4. **"Access denied"**: Kiểm tra header Authorization
5. **"Account not activated"**: Cần verify OTP trước khi login

### Kiểm tra logs:

- Xem console server để lấy OTP
- Kiểm tra MongoDB connection
- Xem lỗi validation
