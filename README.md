# MemTribe - Event Management Platform

A full-stack event management platform with media upload, RSVP tracking, slideshow creation, and more.

## 📚 Tech Stack

**Frontend:**
- React + Vite
- TailwindCSS + shadcn/ui
- React Router

**Backend:**
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT Authentication
- Local File Storage (no AWS required!)

## 🚀 Quick Start

### Local Development

**Frontend:**
```bash
npm install
npm run dev
```

**Backend:**
```bash
cd backend
npm install
cp ../ENV_CONFIGURATION.md .env  # Create and configure .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

## 📦 Features

- ✅ Event creation and management
- ✅ RSVP tracking and analytics
- ✅ Media upload and moderation
- ✅ Slideshow creator
- ✅ Photobook templates
- ✅ Package management
- ✅ Email notifications
- ✅ Admin settings

## 🌐 Deployment

### Hostinger Deployment (Recommended)

Your app is **already configured** to work on Hostinger without AWS!

**Quick guides:**
- 📖 **[HOSTINGER_QUICK_START.md](./HOSTINGER_QUICK_START.md)** - Fast setup
- 📘 **[HOSTINGER_DEPLOYMENT_GUIDE.md](./HOSTINGER_DEPLOYMENT_GUIDE.md)** - Comprehensive guide
- ⚙️ **[ENV_CONFIGURATION.md](./ENV_CONFIGURATION.md)** - Environment variables

**Key Points:**
- ✅ Uses local file storage (no AWS S3 needed)
- ✅ Files stored in `backend/uploads/`
- ✅ Automatic fallback when AWS is not configured
- ✅ Perfect for Hostinger VPS or Business plans

## 📁 File Storage

The application supports **two storage modes**:

### 1. Local Storage (Default - No AWS)
- Files saved to: `backend/uploads/`
- Served at: `/uploads/filename.jpg`
- **Automatically used when AWS is not configured**
- Perfect for Hostinger hosting

### 2. AWS S3 (Optional)
- Configure AWS credentials in `.env`
- Automatically switches to S3 when credentials are present
- Useful for large-scale deployments

## 🔧 Configuration

### Environment Variables

Create `backend/.env` with:

```env
NODE_ENV=development
PORT=5000
BASE_URL=http://localhost:5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/memtribe
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
RESEND_API_KEY=your-resend-key

# Leave empty for local storage (no AWS needed)
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_S3_BUCKET=
```

See **[ENV_CONFIGURATION.md](./ENV_CONFIGURATION.md)** for details.

## 📊 Database

Using PostgreSQL with Prisma ORM.

**Useful commands:**
```bash
cd backend
npx prisma migrate dev      # Run migrations
npx prisma studio           # Open database GUI
npx prisma generate         # Generate Prisma client
npm run prisma:seed         # Seed database
```

## 🛠️ Building for Production

**Frontend:**
```bash
npm run build
# Output: dist/ folder
```

**Backend:**
```bash
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
```

## 📖 Documentation

- [Backend Complete Guide](./BACKEND_COMPLETE.md)
- [Backend Startup Guide](./BACKEND_STARTUP_GUIDE.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Admin Settings Fix](./ADMIN_SETTINGS_FIX.md)
- [Pricing Management Fix](./PRICING_MANAGEMENT_FIX.md)

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Helmet for security headers
- Input validation
- Environment variable protection

## 📝 License

MIT

## 💬 Support

For questions or issues, please check the documentation guides in this repository.

---

**Note:** This app was initially created with Base44 and has been customized for Hostinger deployment with local file storage support.