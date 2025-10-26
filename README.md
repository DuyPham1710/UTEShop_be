# UTEShop Backend

Node.js + Express + MongoDB backend for UTEShop. Project uses controllers → services → models separation, JWT auth, OTP activation and admin features.

---

## Quick setup (Windows)

1. Clone & open project root (example path shown):
   cd d:\University\Nam4\CNPM_new\Project\BackEnd\UTEShop_be

2. Install deps:
   ```
   npm install
   ```

3. Create `.env` in project root with (example):
   ```
   PORT=6969
   MONGO_URI=mongodb://localhost:27017/uteshop
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   OTP_EXPIRES_IN=5m
   VNPAY_TMN_CODE=...
   VNPAY_SECRET=...
   VNPAY_HOST=https://sandbox.vnpayment.vn
   NODE_ENV=development
   ```

4. Start MongoDB (local or Atlas). For local:
   - Run MongoDB service or start via MongoDB Compass/PowerShell as configured.

5. Run app:
   - Development (nodemon):
     ```
     npm run dev
     ```
   - Production:
     ```
     npm start
     ```

---

## Routes / Endpoints (high-level)

Base path: `/v1/api` (confirm in `src/routes/api.js`)

Authentication
- POST /register — register + create inactive user + send OTP
- POST /login — login with username/password → returns access & refresh tokens
- POST /verify-otp — verify OTP to activate account
- POST /resend-otp — resend OTP
- POST /refresh-token — exchange refresh token for new access token

User (protected)
- GET /profile — get logged-in user profile
- PUT /profile — update profile
- PUT /change-password — change password
- DELETE /account — delete account
- POST /viewed-products — add product to viewed list
- POST /favorite-products — toggle favorite (add/remove)

Product / Public
- GET /products — list products / pagination / filters
- GET /products/:id — product detail
- GET /products/:id/similar — similar products
- GET /newest, /best-sellers, /top-discount, /top-viewed — helper lists

Cart (protected)
- POST /cart/add — add product to cart
- GET /cart — get user's cart
- PUT /cart/item — update item qty
- DELETE /cart/item — remove item
- DELETE /cart — clear cart

Order
- POST /orders/checkout — create order / payment flow
- GET /orders — get user's orders
- PUT /orders/:id/status — user-side status update (limited)

Admin (protected + admin role)
- GET /admin/orders — list orders (query by status)
- GET /admin/orders/:id — order detail
- PUT /admin/orders/:id/status — update order status (approve, start delivery, delivered, cancel)
- POST /create-products — admin add product
- PUT /admin/products/:id — update product
- DELETE /admin/products/:id — delete product
- GET /admin/products/stats — product statistics
- GET /admin/stats — revenue statistics
- GET /admin/customers/stats — customer statistics

Payment / VNPay
- Endpoints in `paymentController.js` handle VNPay integration (sandbox/test config supported).

Notification / Email
- Notifications created in `notification` model and sent by `mailService` (EJS templates in `views/emails`).

---

## Controller & Service logic (summary)

General pattern:
- Controllers: parse request, validate inputs, call service, return HTTP response.
- Services: business logic, DB reads/writes via Mongoose models, side effects (notifications, refunds, stock updates).

Key flows

- Auth (authService)
  - register: validate DTO → create user (isActive=false) → generate OTP → send via mailService/console
  - login: verify credentials → check isActive → issue JWT access & refresh

- User (userService)
  - profile getters/updates, add viewed/favorite product logic:
    - addToViewedProducts: if not present push productId
    - toggleFavoriteProduct: add if missing, remove if exists

- Product (productService / adminProductService)
  - create / update / delete products; `getProductPerPage` supports search & paging (current impl may fetch & filter in-memory; consider DB-side filtering for large datasets)
  - addProduct endpoint: validate required fields, create Product, save images (if provided), return created product

- Cart (cartService)
  - addToCart(userId, productId, qty):
    - find or create Cart document for user
    - load product, verify stock
    - if item exists increment qty (validate new qty <= stock), otherwise push new item
    - save cart and return updated cart
  - update/ remove/ clear operations update Cart doc

- Order (orderService / adminOrderService)
  - create order: validate cart, reserve/decrement stock, handle payment data, save order
  - change status:
    - adminOrderService.updateOrderStatus:
      - load order (populate items.product)
      - allowed transitions: pending → prepared/delivering/cancelled, delivering → delivered, etc.
      - on cancel: restore product stock quantities, if paid then refund xu (internal points) or call refund flow, create notification
      - on delivered: mark isDelivered, set autoUpdate for later confirmation, increment product.sold if applicable
      - persist order and create Notification; send via mailService / push
    - orderService.changeStatusAndStock (user-side) ensures only user's own order can be updated

- Payment (paymentController / services/payment)
  - VNPay integration: build vnpay URL, handle return/callback, validate signatures

- Notifications (mailService / notification model)
  - create Notification documents and send email via EJS templates

---

## Important files & folders

- server.js — app entry
- src/routes/api.js — route registration & grouping (note: router.use(auth) applies auth to subsequent routes)
- src/middleware/auth.js / authMiddleware.js — token extraction and req.user population
- src/controllers/* — HTTP handlers
- src/services/* — domain logic (auth, cart, order, admin, product, mail, otp)
- src/models/* — Mongoose schemas
- src/utils/createProductWithSlug.js — helper for slug generation from products.json
- src/views/emails — EJS templates for email notifications

---

## Usage notes & gotchas

- Authentication:
  - Token is expected in header `Authorization: Bearer <token>`. Auth middleware populates `req.user`.
  - Some controllers expect `req.user._id` while others used `req.user.userId` in older code — prefer `req.user._id`. Check `auth` middleware returns the right property.

- Day.js ESM imports:
  - If you see "Cannot find module 'dayjs/plugin/timezone'", ensure plugin imports include `.js` extension in ESM environments (e.g. `import timezone from 'dayjs/plugin/timezone.js'`).

- Concurrency & consistency:
  - addToCart and order status changes check stock but are vulnerable to race conditions under high concurrency. Use MongoDB transactions (sessions) for atomic multi-document updates when needed (payment + stock + order + user refunds).

- Large dataset performance:
  - `getProductPerPageService` currently may load all products and filter with Fuse.js. For production, move filtering/paging to MongoDB (text index, $regex, aggregation).

- Error handling:
  - Controllers typically return 400 for validation errors and 500 for server/DB errors. Check logs for stack traces in development.

- Admin routes:
  - Ensure admin middleware (`adminMiddleware`) checks `req.user.isAdmin` and that your auth middleware attaches user document prior to admin check.

- Notifications & refunds:
  - refund/xu handling in adminOrderService should be in a transaction if you require rollback guarantees (update order, user xu, product stock, create notification).

---

## Testing tips

- Use Postman / Insomnia:
  - Register → verify OTP → login → obtain access token.
  - Attach `Authorization: Bearer <access_token>` for protected endpoints.
- Seed data:
  - `src/Database` contains sample JSON for products, categories, reviews. Use a simple seed script to import if needed.

---

## Contributing & style

- Keep controllers thin; business logic lives in services.
- Use DTO + validation middleware for input validation.
- Prefer async/await and consistent error messages.
- Add unit tests for core services (cart, order changes, payment flow) when possible.

---

If you want, I can:
- generate a seed script to load JSON fixtures,
- add example Postman collection,
- convert in-memory product search to DB-side queries.
