# Indian Bazaar - Complete Setup Guide

A full-stack marketplace connecting street food vendors with raw material suppliers.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### 1. Clone & Setup
```bash
git clone <your-repo-url>
cd indian-bazaar

# Install dependencies for both client and server
cd server && npm install
cd ../client && npm install
```

### 2. Environment Setup

**Server (.env in /server folder):**
```env
NODE_ENV=development
PORT=5000
API_VERSION=v1
MONGODB_URI=mongodb://localhost:27017/indian-bazaar
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000
BCRYPT_SALT_ROUNDS=12
```

### 3. Start the Application

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
# Client runs on http://localhost:8080
```

### 4. Test Login Credentials

The app automatically creates test data on first run:

**Test Vendor:**
- Email: `vendor@test.com`
- Password: `password123`
- Dashboard: http://localhost:8080/vendor/dashboard

**Test Supplier:**
- Email: `supplier@test.com`
- Password: `password123`
- Dashboard: http://localhost:8080/supplier/dashboard

## 🏗️ Architecture

### Backend (Port 5000)
- **Express.js** + MongoDB + Mongoose
- **JWT Authentication** with role-based access
- **RESTful API** with full CRUD operations
- **Rate limiting** and security middleware
- **Automatic test data** creation

### Frontend (Port 8080)
- **React 18** + TypeScript + Vite
- **shadcn/ui** components + Tailwind CSS
- **React Router** for navigation
- **Context API** for state management
- **Real-time cart** and authentication

## Key Features
- ✅ **Full Authentication** - JWT-based login/register
- ✅ **Role-based Access** - Vendor & Supplier dashboards
- ✅ **Real-time Cart** - Add/remove/update items
- ✅ **Order Management** - Create and track orders
- ✅ **Search & Filter** - Find materials and suppliers
- ✅ **Location Services** - Nearby supplier discovery
- ✅ **Responsive Design** - Mobile-friendly UI
- ✅ **Type Safety** - Full TypeScript support

## 🎯 Usage Flow

1. **Registration/Login** - Choose vendor or supplier role
2. **Vendor Dashboard** - Browse materials, add to cart, place orders
3. **Supplier Dashboard** - Manage materials, view incoming orders
4. **Cart Management** - Real-time cart updates with API sync
5. **Order Tracking** - Monitor order status and delivery

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based route protection
- CORS configuration
- Rate limiting
- Input validation
- SQL injection protection (MongoDB)

