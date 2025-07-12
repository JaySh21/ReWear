# ReWear

A complete e-commerce clothing swap platform built with modern JavaScript (ES6 modules) and Node.js. Users can swap clothing items directly or redeem items using a points system. Includes robust role-based authentication for users and admins.

## 🚀 Features

- **User & Admin Authentication**: JWT-based authentication with bcrypt password hashing. Admin login uses credentials from environment variables (not the database).
- **Role-Based Access**: Admin and user roles enforced throughout the backend and frontend. Admin routes require a valid admin JWT.
- **Item Management**: CRUD operations for clothing items with image support
- **Swap System**: Direct item swaps and points-based redemptions
- **Points System**: Comprehensive points tracking with transaction history
- **Admin Panel**: Full admin interface for user and content management
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Security**: Rate limiting, CORS, Helmet, and input validation
- **Testing**: Jest test suite with Supertest
- **Modern JavaScript**: Full ES6 modules implementation
- **Clean Code**: Optimized and commented-free codebase

## 📋 Prerequisites

- Node.js 16+
- MongoDB 4.4+
- npm or yarn

## 🛠 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd DummyReWear
   ```

2. **Navigate to backend directory**

   ```bash
   cd backend
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/rewear
   MONGODB_URI_TEST=mongodb://localhost:27017/rewear_test

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d

   # Admin Login (for role: admin)
   ADMIN_EMAIL=admin@rewear.com
   ADMIN_PASSWORD=admin123

   # Cloudinary Configuration (for image uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # CORS Configuration
   CLIENT_URL=http://localhost:3000
   CLIENT_URL_PROD=https://your-frontend-domain.com

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Points System
   POINTS_PER_UPLOAD=50
   POINTS_PER_SWAP=25
   ```

5. **Start MongoDB**

   ```bash
   # Start MongoDB service
   mongod
   ```

6. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🏗 Project Structure

```
DummyReWear/
├── backend/                # Backend API
│   ├── models/            # Database models
│   │   ├── User.js        # User model with authentication
│   │   ├── Item.js        # Item model with validation
│   │   ├── Swap.js        # Swap/redemption model
│   │   └── PointsLedger.js # Points transaction tracking
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication endpoints
│   │   ├── items.js       # Item management
│   │   ├── swaps.js       # Swap operations
│   │   ├── points.js      # Points system
│   │   └── admin.js       # Admin panel
│   ├── middleware/        # Custom middleware
│   │   ├── auth.js        # JWT authentication & role protection
│   │   ├── errorHandler.js # Error handling
│   │   ├── notFound.js    # 404 handler
│   │   └── validate.js    # Input validation
│   ├── tests/             # Test files
│   │   └── auth.test.js   # Authentication tests
│   ├── server.js          # Main application file
│   ├── package.json       # Dependencies and scripts
│   └── README.md          # Backend documentation
└── README.md              # This file
```

## 📚 API Documentation

### Base URL

- Development: `http://localhost:5000`
- Production: `https://your-domain.com`

### Interactive API Docs

Visit `http://localhost:5000/api-docs` for interactive Swagger documentation.

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User (User or Admin)

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "role": "user" // or "admin" (required for admin login)
}
```

- For admin login, use the credentials set in your `.env` file (`ADMIN_EMAIL` and `ADMIN_PASSWORD`).
- For user login, omit the `role` field or set `role: "user"`.

#### Get User Profile

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Items Endpoints

#### Get All Items

```http
GET /api/items?page=1&limit=20&category=tops&type=swap&search=shirt
```

#### Get My Items (User-Specific)

```http
GET /api/items/my-items
Authorization: Bearer <token>
```

- Returns only items uploaded by the authenticated user, with their current swap status.

#### Create Item

```http
POST /api/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Blue T-Shirt",
  "description": "Comfortable cotton t-shirt",
  "category": "tops",
  "type": "swap",
  "size": "M",
  "condition": "good",
  "images": ["https://example.com/image1.jpg"],
  "tags": ["cotton", "casual"]
}
```

#### Get Item by ID

```http
GET /api/items/:id
```

#### Update Item

```http
PUT /api/items/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated T-Shirt",
  "description": "Updated description"
}
```

#### Delete Item

```http
DELETE /api/items/:id
Authorization: Bearer <token>
```

#### Like/Unlike Item

```http
POST /api/items/:id/like
Authorization: Bearer <token>
```

### Swaps Endpoints

#### Request Swap

```http
POST /api/swaps/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "requestItemId": "item_id",
  "offeredItemId": "offered_item_id",
  "type": "swap",
  "notes": "Would love to swap!"
}
```

#### Request Points Redemption

```http
POST /api/swaps/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "requestItemId": "item_id",
  "type": "points",
  "pointsUsed": 100,
  "notes": "Redeeming with points!"
}
```

#### Accept/Reject/Complete Swap

```http
POST /api/swaps/:id/accept
POST /api/swaps/:id/reject
POST /api/swaps/:id/complete
Authorization: Bearer <token>
```

#### Get Swap Details

```http
GET /api/swaps/:id
Authorization: Bearer <token>
```

### Points Endpoints

#### Get Points Balance

```http
GET /api/points/balance
Authorization: Bearer <token>
```

#### Get Transaction History

```http
GET /api/points/history?page=1&limit=50
Authorization: Bearer <token>
```

#### Redeem Item with Points

```http
POST /api/points/redeem/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "pointsUsed": 100
}
```

#### Get Leaderboard

```http
GET /api/points/leaderboard?limit=10
```

### Admin Endpoints (Require Admin JWT)

#### Get Dashboard Stats

```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

#### Get All Users

```http
GET /api/admin/users?page=1&limit=20&role=user&search=john
Authorization: Bearer <admin_token>
```

#### Update User

```http
PUT /api/admin/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "admin",
  "isActive": true
}
```

#### Get All Items (Admin)

```http
GET /api/admin/items?page=1&limit=20&status=pending
Authorization: Bearer <admin_token>
```

#### Approve/Reject Item

```http
PUT /api/admin/items/:id/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "listed", // or "rejected"
  "reason": "Item looks good!"
}
```

#### Get All Swaps (Admin)

```http
GET /api/admin/swaps?page=1&limit=20
Authorization: Bearer <admin_token>
```

#### Adjust User Points (Admin)

```http
POST /api/admin/points/adjust
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "user_id",
  "delta": 50,
  "reason": "bonus",
  "description": "Welcome bonus"
}
```

## 🧪 Testing

Run the test suite:

```bash
cd backend
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## 🐳 Docker

Build and run with Docker:

```bash
cd backend

docker build -t dummyrewear-backend .

docker run -p 5000:5000 dummyrewear-backend
```

## 🚀 Deployment

### Environment Variables

Make sure to set all required environment variables in production:

```env
NODE_ENV=production
MONGODB_URI_PROD=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-admin-password
CLIENT_URL_PROD=https://your-frontend-domain.com
```

### Health Check

The API includes a health check endpoint:

```http
GET /health
```

### API Documentation

Access the interactive API documentation at:

```
http://your-domain.com/api-docs
```

## 🔧 Development

### Code Style

- ES6 modules throughout
- Clean, uncommented code
- Consistent error handling
- Comprehensive validation

### Database Models

- **User**: Authentication, points, profile management, role (user/admin)
- **Item**: Clothing items with categories, conditions, images
- **Swap**: Swap requests and redemptions
- **PointsLedger**: Transaction history and audit trail

### Security Features

- JWT authentication
- Password hashing with bcrypt
- Role-based access control (user/admin)
- Rate limiting
- CORS protection
- Input validation
- Helmet security headers

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, please open an issue in the repository or contact the development team.
