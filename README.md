# Indian Bazaar

A full-stack marketplace connecting street food vendors with raw material suppliers in India. Built with modern web technologies to streamline the supply chain for small businesses.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### 1. Clone & Setup
```bash
git clone https://github.com/Rajput-xv/indian-bazaar.git
cd indian-bazaar

# Install dependencies for both client and server
cd server && npm install
cd ../client && npm install
```

**Client (.env in /client folder):**
```env
VITE_API_URL=http://localhost:5000/api/v1
```

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

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful, accessible components
- **React Router DOM** for client-side routing
- **React Hook Form** with Zod validation
- **TanStack Query** for server state management
- **Lucide React** for icons
- **Recharts** for data visualization

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests
- **Express Rate Limit** for API protection

## ✨ Key Features
- 🔐 **Authentication & Authorization** - JWT-based with role-based access control
- 👥 **Dual User Roles** - Vendor and Supplier dashboards with role-specific features
- 🛒 **Smart Cart Management** - Real-time cart with persistent storage
- 📦 **Order Management** - Complete order lifecycle from creation to tracking
- 🔍 **Advanced Search & Filtering** - Find materials and suppliers easily
- 📍 **Location-based Services** - Discover nearby suppliers with distance calculation
- 📊 **Analytics Dashboard** - Business insights with interactive charts
- 📱 **Responsive Design** - Mobile-first approach for all devices
- 🎨 **Modern UI/UX** - Beautiful interface with dark/light theme support
- ⚡ **Real-time Updates** - Live cart synchronization and order status updates
- 🔒 **Security Features** - Rate limiting, input validation, and secure authentication

## 🎯 User Workflows

### For Vendors (Street Food Sellers)
1. **Register/Login** as a vendor
2. **Browse Materials** - Search and filter raw materials by category, price, location
3. **Add to Cart** - Select quantities and add items to cart
4. **Place Orders** - Review cart and place orders with suppliers
5. **Track Orders** - Monitor order status and delivery updates
6. **Dashboard Analytics** - View purchase history and spending insights

### For Suppliers (Raw Material Providers)
1. **Register/Login** as a supplier
2. **Manage Inventory** - Add, edit, and manage material listings
3. **Receive Orders** - View and process incoming orders from vendors
4. **Update Stock** - Keep inventory levels current
5. **Analytics** - Track sales performance and popular products

## 🔒 Security & Performance

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcryptjs with salt rounds
- **Role-based Access Control** protecting routes and resources
- **Rate Limiting** to prevent API abuse
- **CORS Configuration** for secure cross-origin requests
- **Input Validation** using Zod schemas
- **MongoDB Security** with parameterized queries
- **Environment Variables** for sensitive configuration

## 🚀 Development Features

- **Hot Reload** for fast development cycles
- **TypeScript** for type safety and better developer experience
- **ESLint** for code quality and consistency
- **Tailwind CSS** for rapid UI development
- **Component Library** with shadcn/ui for consistent design
- **Mock Data Generation** for development and testing
- **Modern Build Tools** with Vite for optimal performance

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

- **Parth Saxena**
- **Navneet Gupta**
- **Vansh**

---
