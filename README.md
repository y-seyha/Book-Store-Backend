# Book Store Backend

RESTful API for an online bookstore — handles auth, products, cart, checkout, payments, orders, reviews, delivery tracking, notifications, and role-based dashboards for admin, seller, customer, and driver.

## Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **ORM:** TypeORM
- **Database:** PostgreSQL
- **Auth:** JWT (access + refresh tokens in httpOnly cookies)
- **File Upload:** Cloudinary
- **Email:** Brevo
- **WebSocket:** Socket.IO (notifications)
- **OAuth:** Google, GitHub, Facebook

## Project Structure

```
src/
├── auth/                 # JWT, OAuth, guards, decorators
├── cart/                 # Shopping cart
├── categories/           # Category CRUD
├── chatbot/              # FAQ chatbot
├── checkout/             # Order creation from cart
├── common/               # Entities, base classes
├── contact/              # Contact form messages
├── dashboard/            # Admin dashboard analytics
├── delivery_driver/      # Driver profile management
├── delivery_tracking/    # Delivery tracking & assignment
├── file-upload/          # Cloudinary integration
├── notification/         # WebSocket notifications
├── order/                # Order management
├── payment/              # Payment CRUD & stats
├── products/             # Product CRUD
├── profile/              # User profile updates
├── review/               # Reviews (public + admin)
├── seller/               # Seller dashboard & products
├── user/                 # Admin user management
└── utils/                # Mailer, cookie helpers
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Auth** | | |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, sets httpOnly cookies |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/logout` | Clear auth cookies |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/google` | Google OAuth |
| GET | `/api/auth/github` | GitHub OAuth |
| GET | `/api/auth/facebook` | Facebook OAuth |
| | | |
| **Admin Dashboard** | | |
| GET | `/api/admin/dashboard` | Dashboard KPIs + revenue chart + top products |
| | | |
| **Sellers** | | |
| GET | `/api/sellers/dashboard` | Seller dashboard analytics |
| GET | `/api/sellers/my-products` | Own products |
| GET | `/api/sellers/me` | Seller profile |
| PUT | `/api/sellers/me` | Update seller profile |
| POST | `/api/sellers/become` | Become a seller |
| GET | `/api/sellers/orders` | Order items for own products |
| PUT | `/api/sellers/order-items/:id/status` | Update order item status |
| | | |
| **Products** | | |
| GET | `/api/products` | List (paginated, filterable) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (seller) |
| PUT | `/api/products/:id` | Update product (seller) |
| DELETE | `/api/products/:id` | Delete product (seller) |
| | | |
| **Reviews** | | |
| GET | `/api/reviews` | Public list |
| GET | `/api/reviews/:id` | Get single review |
| POST | `/api/reviews` | Create review |
| PUT | `/api/reviews/:id` | Update own review |
| DELETE | `/api/reviews/:id` | Delete own review |
| GET | `/api/reviews/admin/all` | List all reviews (admin) |
| PUT | `/api/reviews/admin/:id` | Update any review (admin) |
| DELETE | `/api/reviews/admin/:id` | Delete any review (admin) |
| | | |
| **Cart** | | |
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/add` | Add item |
| PUT | `/api/cart/items/:id` | Update item quantity |
| DELETE | `/api/cart/items/:id` | Remove item |
| | | |
| **Orders** | | |
| GET | `/api/orders` | List user orders |
| GET | `/api/orders/:id` | Get order detail |
| PUT | `/api/orders/:id/status` | Update order status |
| PUT | `/api/orders/:id/assign-driver` | Assign driver |
| | | |
| **Payments** | | |
| GET | `/api/payments/admin` | List all payments (admin) |
| GET | `/api/payments/admin/stats` | Payment statistics (admin) |
| PUT | `/api/payments/admin/:id/status` | Update payment status (admin) |
| | | |
| **Users (Admin)** | | |
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/users/:id` | Get user |
| POST | `/api/admin/users` | Create user |
| PATCH | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| PATCH | `/api/admin/users/:id/role` | Change user role |
| | | |
| **Chatbot** | | |
| POST | `/api/chatbot/chat` | Chat with AI assistant |
| GET | `/api/chatbot/history` | Get chat history |
| | | |
| **Categories (Admin)** | | |
| GET | `/api/admin/categories` | List categories |
| POST | `/api/admin/categories` | Create category |
| PATCH | `/api/admin/categories/:id` | Update category |
| DELETE | `/api/admin/categories/:id` | Delete category |
