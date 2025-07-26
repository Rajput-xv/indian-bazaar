# Indian Bazaar Pro

A modern, full-featured platform for street food vendors and suppliers to connect, manage inventory, and streamline raw material sourcing across India.

## 🚀 Features

- **Landing Page**: Highlights platform benefits, stats, and a call-to-action for vendors and suppliers.
- **Authentication**: Sign up and login for both vendors and suppliers, with demo mode for easy testing.
- **Vendor Dashboard**:
  - Browse and search raw materials from suppliers
  - Filter by category
  - Add items to cart and place orders
  - View order history and stats
- **Supplier Dashboard**:
  - Manage your inventory (add, edit, delete materials)
  - View and manage incoming orders
  - Dashboard stats for materials, orders, and revenue
- **Responsive UI**: Mobile-friendly, beautiful design using shadcn/ui and Tailwind CSS
- **404 Not Found Page**: Friendly error page for invalid routes

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** (blazing fast dev/build tool)
- **shadcn/ui** (Radix UI + Tailwind CSS components)
- **Tailwind CSS** (utility-first styling)
- **React Router** (routing)
- **React Hook Form** (forms)
- **Lucide React** (icons)
- **Zod** (validation)
- **Other UI/UX libraries**: embla-carousel, recharts, sonner, etc.

## 📦 Main Dependencies

See `package.json` for full list. Key ones:
- `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`
- `@radix-ui/*`, `shadcn/ui`, `tailwindcss`, `lucide-react`

## 🖥️ Local Development

1. **Clone the repository**
   ```sh
   git clone <YOUR_GIT_URL>
   cd indian-bazaar-pro-main
   ```
2. **Install dependencies**
   ```sh
   npm install
   ```
3. **Start the development server**
   ```sh
   npm run dev
   ```
   - The app will be available at [http://localhost:8080](http://localhost:8080) (or next available port)

4. **Build for production**
   ```sh
   npm run build
   ```

## 📝 Project Structure

- `src/pages/` — Main app pages (Landing, Auth, VendorDashboard, SupplierDashboard, NotFound)
- `src/components/` — UI and common components
- `src/contexts/` — React context for Auth, Theme
- `src/hooks/` — Custom hooks
- `src/types/` — TypeScript types
- `src/utils/` — Mock data and utilities

## 🎨 Styling
- **Tailwind CSS** with custom theme (see `tailwind.config.ts`)
- shadcn/ui for accessible, modern UI components

## 🌐 Configuration
- **Vite** config in `vite.config.ts` (default dev port: 8080)
- **Tailwind** config in `tailwind.config.ts`

## 👤 Credits
- Built with ❤️ by the Indian Bazaar Pro team
- UI powered by [shadcn/ui](https://ui.shadcn.com/) and [Tailwind CSS](https://tailwindcss.com/)

---

> For any issues or contributions, please open an issue or pull request!
