# Hướng Dẫn Test API Cart

## 📋 Danh Sách Sản Phẩm Mẫu

### Sản phẩm có giá thấp (dưới 100k)
- **Áo thun UTE Basic** - ID: `66af270df88554d0fd490316` - Giá: 80,000đ (không giảm giá)
- **Bút ký UTE** - ID: `66af270df88554d0fd490321` - Giá: 50,000đ (giảm 10%)
- **Tất UTE** - ID: `66af270df88554d0fd490325` - Giá: 60,000đ (không giảm giá)

### Sản phẩm có giá trung bình (100k - 500k)
- **Sổ tay UTE** - ID: `66af270df88554d0fd490322` - Giá: 120,000đ (giảm 5%)
- **Túi đeo chéo UTE** - ID: `66af270df88554d0fd490317` - Giá: 150,000đ (giảm 25%)
- **Kính mát UTE** - ID: `66af270df88554d0fd490320` - Giá: 180,000đ (giảm 20%)
- **Quần short UTE** - ID: `66af270df88554d0fd490324` - Giá: 180,000đ (giảm 12%)
- **Ví da UTE** - ID: `66af270df88554d0fd490318` - Giá: 200,000đ (giảm 30%)
- **Áo khoác UTE** - ID: `66af270df88554d0fd490323` - Giá: 350,000đ (giảm 18%)

### Sản phẩm có giá cao (trên 500k)
- **Đồng hồ đeo tay UTE** - ID: `66af270df88554d0fd490319` - Giá: 2,500,000đ (giảm 15%)

## 🧪 Test Cases

### 1. Test Thêm Sản Phẩm Vào Giỏ Hàng

#### Test Case 1: Thêm sản phẩm mới
```bash
POST /v1/api/cart/add
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "productId": "66af270df88554d0fd490316",
  "quantity": 2
}
```

#### Test Case 2: Thêm sản phẩm đã có trong giỏ hàng
```bash
POST /v1/api/cart/add
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "productId": "66af270df88554d0fd490316",
  "quantity": 1
}
```

#### Test Case 3: Thêm sản phẩm với số lượng vượt quá tồn kho
```bash
POST /v1/api/cart/add
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "productId": "66af270df88554d0fd490319",
  "quantity": 15
}
```

### 2. Test Lấy Giỏ Hàng

```bash
GET /v1/api/cart
Authorization: Bearer <your_token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lấy giỏ hàng thành công",
  "data": {
    "items": [
      {
        "product": {
          "_id": "66af270df88554d0fd490316",
          "name": "Áo thun UTE Basic",
          "price": 80000,
          "discount": 0,
          "images": ["url1", "url2"]
        },
        "quantity": 3
      }
    ],
    "totalItems": 3,
    "totalPrice": 240000
  }
}
```

### 3. Test Cập Nhật Số Lượng

```bash
PUT /v1/api/cart/update
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "productId": "66af270df88554d0fd490316",
  "quantity": 5
}
```

### 4. Test Xóa Sản Phẩm Khỏi Giỏ Hàng

```bash
DELETE /v1/api/cart/remove/66af270df88554d0fd490316
Authorization: Bearer <your_token>
```

### 5. Test Lấy Số Lượng Sản Phẩm Trong Giỏ Hàng

```bash
GET /v1/api/cart/count
Authorization: Bearer <your_token>
```

### 6. Test Xóa Toàn Bộ Giỏ Hàng

```bash
DELETE /v1/api/cart/clear
Authorization: Bearer <your_token>
```

## 🔍 Test Scenarios

### Scenario 1: Test Giỏ Hàng Rỗng
1. Đăng nhập user mới
2. Gọi `GET /v1/api/cart`
3. Kiểm tra response trả về giỏ hàng trống

### Scenario 2: Test Thêm Nhiều Sản Phẩm
1. Thêm 3 sản phẩm khác nhau vào giỏ hàng
2. Kiểm tra tổng số lượng và tổng tiền
3. Kiểm tra tính toán giảm giá

### Scenario 3: Test Cập Nhật Số Lượng
1. Thêm sản phẩm với số lượng 2
2. Cập nhật số lượng thành 5
3. Kiểm tra số lượng đã được cập nhật

### Scenario 4: Test Xóa Sản Phẩm
1. Thêm 2 sản phẩm vào giỏ hàng
2. Xóa 1 sản phẩm
3. Kiểm tra chỉ còn 1 sản phẩm

### Scenario 5: Test Validation
1. Thử thêm sản phẩm không tồn tại
2. Thử thêm với số lượng âm
3. Thử thêm với số lượng vượt quá tồn kho

## 📊 Expected Results

### Tính Toán Giá
- **Áo thun UTE Basic**: 80,000đ × 2 = 160,000đ (không giảm giá)
- **Bút ký UTE**: 50,000đ × 1 = 50,000đ → 45,000đ (giảm 10%)
- **Túi đeo chéo UTE**: 150,000đ × 1 = 150,000đ → 112,500đ (giảm 25%)

### Tổng Giỏ Hàng
- Tổng số lượng: 4 sản phẩm
- Tổng tiền: 160,000 + 45,000 + 112,500 = 317,500đ

## 🚨 Error Cases

### 1. Sản phẩm không tồn tại
```json
{
  "success": false,
  "message": "Sản phẩm không tồn tại"
}
```

### 2. Số lượng vượt quá tồn kho
```json
{
  "success": false,
  "message": "Chỉ còn 10 sản phẩm trong kho"
}
```

### 3. Validation lỗi
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "productId: Product ID is required",
    "quantity: Quantity must be greater than 0"
  ]
}
```

## 🔧 Tools để Test

### 1. Postman
- Import collection với các request đã setup sẵn
- Sử dụng environment variables cho token

### 2. cURL
```bash
# Thêm vào giỏ hàng
curl -X POST http://localhost:3000/v1/api/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": "66af270df88554d0fd490316", "quantity": 2}'

# Lấy giỏ hàng
curl -X GET http://localhost:3000/v1/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Thunder Client (VS Code)
- Tạo workspace với các request
- Sử dụng variables cho base URL và token

## 📝 Notes

1. **Authentication**: Tất cả API đều yêu cầu token hợp lệ
2. **Validation**: Kiểm tra input trước khi xử lý
3. **Stock Check**: Kiểm tra tồn kho trước khi thêm/cập nhật
4. **Price Calculation**: Tự động tính giá sau giảm giá
5. **Error Handling**: Xử lý lỗi chi tiết và thân thiện
