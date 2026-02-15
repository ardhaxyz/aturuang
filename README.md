# Aturuang - Meeting Room Management System

**Aturuang** (from Indonesian "atur" + "ruang" = manage + room) is a modern multi-tenant meeting room booking system built for the Coordinating Ministry for Food Affairs.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)
![Version](https://img.shields.io/badge/version-0.4.1-blue.svg)

## 🌟 Features

### Core Features
- ✅ **Multi-tenant Organization System** - Separate organizations with isolated rooms
- ✅ **Role-based Access Control** - Superadmin, Org Admin, and User roles
- ✅ **Room Booking** - Book public and organization-specific rooms
- ✅ **Approval Workflow** - Admin approval for all bookings
- ✅ **Calendar View** - FullCalendar integration with dark mode
- ✅ **Room Images** - Upload room photos (max 2MB, JPG/PNG)
- ✅ **Dark Mode** - Complete dark theme support
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **Pagination** - Bookings list with pagination (10 per page)

### Admin Features
- 📊 **Unified Dashboard** - Manage all operations from one page
- 🏢 **Organization Management** - Create and manage organizations (superadmin)
- 🚪 **Room Management** - Add/edit rooms with images
- 👥 **User Management** - Create users and assign roles
- 🔍 **Booking Filters** - Filter by organization and room
- 📱 **Mobile-friendly** - Icon-only bottom nav + hamburger menu

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed

### Installation

1. **Start the application**
```bash
docker compose up -d
```

2. **Create superadmin account**
```bash
curl -X POST http://localhost:3001/api/setup \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

3. **Access the application**
- Frontend: http://localhost
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 📋 Default Login

**Superadmin Account:**
- Username: `admin`
- Password: `admin123`

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- FullCalendar (calendar view)
- Lucide React (icons)

**Backend:**
- Node.js + Express
- Prisma ORM
- SQLite (database)
- JWT Authentication
- Multer (file uploads)

**Infrastructure:**
- Docker + Docker Compose
- Nginx (frontend server)
- Node.js (backend server)

### Project Structure

```
aturuang/
├── backend/
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utilities (auth, validation, upload)
│   │   └── index.js         # Main server file
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.js         # Database seed
│   ├── uploads/             # Room images storage
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # Auth & Theme contexts
│   │   ├── pages/          # Page components
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # API utilities
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 👥 User Roles

### Superadmin
- Full system access
- Manage all organizations
- Manage all rooms
- Manage all users
- Approve/reject any booking

### Organization Admin
- Manage own organization's rooms
- Manage own organization's users
- Approve/reject bookings for org rooms
- View public rooms

### User
- View public rooms
- View own organization's rooms
- Create bookings (pending approval)
- View own booking history

## 📱 Mobile Features

- **Icon-only bottom navigation** - Clean mobile interface
- **Hamburger menu** - Access all navigation options
- **Responsive design** - Adapts to all screen sizes
- **Touch-friendly** - Large touch targets

## 🎨 Theming

### Dark Mode
- Automatic system preference detection
- Manual toggle button (moon/sun icon)
- Full dark theme support across all components
- FullCalendar dark theme integration

## 🔧 Configuration

### Environment Variables (Backend)

Create `.env` file in `/backend`:

```env
# Database (SQLite)
DATABASE_URL="file:./dev.db"

# JWT Secret (change in production!)
JWT_SECRET="your-secret-key-min-32-chars"

# Server
PORT=3001
NODE_ENV=production

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="2097152"  # 2MB

# CORS
FRONTEND_URL="http://localhost"
```

## 🔒 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- File upload validation (type & size)
- SQL injection protection (Prisma ORM)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username & password
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/change-password` - Change password

### Setup
- `GET /api/setup/status` - Check if setup needed
- `POST /api/setup` - Create initial superadmin

### Organizations (Superadmin only)
- `GET /api/organizations` - List all
- `POST /api/organizations` - Create
- `GET /api/organizations/:id` - Get details
- `PUT /api/organizations/:id` - Update
- `DELETE /api/organizations/:id` - Delete
- `GET /api/organizations/:id/stats` - Get stats

### Rooms
- `GET /api/rooms` - List accessible rooms
- `POST /api/rooms` - Create room (admin)
- `PUT /api/rooms/:id` - Update room (admin)
- `DELETE /api/rooms/:id` - Delete room (admin)
- `POST /api/rooms/:id/image` - Upload image
- `DELETE /api/rooms/:id/image` - Delete image

### Bookings
- `GET /api/bookings` - List bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:id/approve` - Approve/reject (admin)
- `DELETE /api/bookings/:id` - Delete booking (admin)

### Users (Admin only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/reset-password` - Reset password

## 🧪 Development

### Local Development (without Docker)

**Backend:**
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Database Migrations

```bash
# Generate migration
cd backend
npx prisma migrate dev --name migration_name

# Deploy migration
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

### Seeding Data

```bash
cd backend
npm run seed
```

## 🐛 Troubleshooting

### Can't Login
- Check if superadmin is created: `POST /api/setup`
- Database may have been reset during deployment
- Recreate superadmin account if needed

### "Endpoint not found" Error
- Usually fixed by restarting containers
- Check backend logs: `docker compose logs backend`

### Rooms Not Visible
- Users must be assigned to organization
- Check user's `organizationId` in database
- Token may be stale - logout and login again

### File Upload Issues
- Max file size: 2MB
- Allowed formats: JPG, PNG
- Check uploads directory permissions

## 📦 Deployment

### Production Deployment

1. **Update environment variables**
   - Change `JWT_SECRET` to a secure random string
   - Update `FRONTEND_URL` to production domain

2. **Build and deploy**
```bash
docker compose down
docker compose up --build -d
```

3. **Health check**
```bash
curl http://your-domain/health
```

## 🧹 Docker Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild after code changes
docker compose up -d --build

# Reset everything (including database)
docker compose down -v
docker compose up -d --build
```

## 📝 Changelog

### Version 0.4.1
- ✅ Dashboard Quick Actions simplified - removed redundant buttons (Book a Room only)
- ✅ Mobile FAB shape updated to square-rounded (rounded-lg) for UI consistency
- ✅ Mobile stats grid changed to 2 columns (reduced vertical scrolling)
- ✅ Overall dashboard layout more compact and efficient

### Version 0.4.0
- ✅ Frontend design unification across all pages
- ✅ Consistent card-based layout with rounded-lg borders
- ✅ Improved color scheme with primary colors (blue-600)
- ✅ Enhanced dark mode support with proper contrast
- ✅ Mobile-responsive navigation with icon-only bottom nav
- ✅ Refined typography and spacing throughout

### Version 0.3.0
- ✅ Multi-tenant organization system
- ✅ Role-based access (superadmin, org_admin, user)
- ✅ Room image uploads
- ✅ Dark mode support
- ✅ Mobile responsive design
- ✅ Booking approval workflow
- ✅ Admin dashboard with filters

## 📄 License

MIT License - Created for Coordinating Ministry for Food Affairs

## 🙏 Credits

**Built with ❤️ by ardhaxyz**

**Attribution:**
- © 2026 Aturuang for Coordinating Ministry for Food Affairs
- Built with ☕ + ❄️ + 🤖

---

**Happy Booking! 📅**
