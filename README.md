# Employee Login System - MERN Stack

A comprehensive employee attendance system with live photo capture, role-based access control, and admin dashboard.

## 🚀 Features

### For Employees:
- 🔐 Secure login with email and password
- 📸 Live photo capture for daily attendance
- 📱 Mobile-responsive design
- 📍 Location capture (optional)
- 🚫 One login per day restriction
- ✅ Real-time login confirmation with toast notifications

### For Admins:
- 👥 Employee management (add, edit, deactivate)
- 📊 Dashboard with attendance statistics
- 📋 View all employee login records in table format
- 🖼️ Photo popup view with employee details
- 🔍 Search and filter functionality
- 📄 Pagination for large datasets

### Technical Features:
- 🔒 JWT-based authentication (7-day expiry)
- ☁️ Cloudinary integration for photo storage
- 🗑️ Automatic photo deletion after 7 days
- 🛡️ Role-based access control
- 📱 Mobile-first responsive design
- 🎨 Corporate blue color scheme
- ⚡ Minimal animations and clean UI

## 🛠️ Tech Stack

### Backend:
- **Node.js & Express.js** - Server framework
- **MongoDB with Mongoose** - Database
- **JWT** - Authentication
- **Cloudinary** - Image storage
- **Multer** - File uploads
- **bcrypt** - Password hashing
- **node-cron** - Scheduled tasks

### Frontend:
- **React 18** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Formik & Yup** - Form handling and validation
- **Framer Motion** - Animations
- **React Hot Toast** - Notifications
- **Tailwind CSS** - Styling
- **React Icons** - Icons

## 📦 Installation & Setup

### Prerequisites:
- Node.js (v16 or higher)
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd employee-login-system
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file and configure:
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/employee-login-system

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Create admin user (run once)
npm run seed-admin

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file:
REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm start
```

## 🔧 Configuration

### MongoDB Setup:
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get the connection string and add to backend `.env`

### Cloudinary Setup:
1. Create a Cloudinary account
2. Get your Cloud Name, API Key, and API Secret from dashboard
3. Add credentials to backend `.env`
4. Photos are automatically organized in `employee-login-photos` folder
5. Auto-deletion is configured for 7 days

### Admin Account:
The seed script creates a default admin account:
- **Email**: admin@company.com
- **Password**: admin123
- **Role**: admin

**⚠️ Important**: Change the default admin credentials after first login!

## 📱 Usage

### Employee Workflow:
1. Login with assigned email and password
2. Take a live photo or upload an image
3. System records attendance with timestamp and location
4. Success toast notification confirms login
5. Cannot login again on the same day

### Admin Workflow:
1. Login with admin credentials
2. **Dashboard**: View attendance statistics
3. **Employees**: Add new employees, manage existing ones
4. **Login Records**: View all attendance records with photos
5. Click on photos to view in popup with full details

## 🚀 Deployment

### Backend (Vercel):
1. Push backend code to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Frontend (Vercel):
1. Update `REACT_APP_API_URL` to your deployed backend URL
2. Push frontend code to GitHub
3. Connect to Vercel
4. Deploy

### Environment Variables for Production:
```bash
# Backend
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.vercel.app

# Frontend
REACT_APP_API_URL=https://your-backend-domain.vercel.app/api
```

## 📋 API Endpoints

### Authentication:
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify` - Verify token

### Employee:
- `GET /api/employee/check-login-status` - Check today's login status
- `POST /api/employee/login-with-photo` - Record attendance with photo
- `GET /api/employee/login-history` - Get employee's login history

### Admin:
- `POST /api/admin/create-employee` - Create new employee
- `GET /api/admin/employees` - Get all employees
- `GET /api/admin/login-records` - Get all login records
- `PATCH /api/admin/employee/:id/status` - Update employee status
- `DELETE /api/admin/employee/:id` - Delete employee
- `GET /api/admin/stats` - Get dashboard statistics

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: 7-day expiry with HTTP-only cookies
- **Role-based Access**: Employee/Admin permissions
- **Input Validation**: Server-side validation with Yup
- **File Upload Security**: Image-only uploads with size limits
- **CORS Configuration**: Controlled cross-origin access
- **Data Sanitization**: Mongoose schema validation

## 🎨 Design Principles

- **Mobile-First**: Responsive design optimized for smartphones
- **Corporate Blue**: Professional color scheme
- **Minimal UI**: Clean, distraction-free interface
- **Accessibility**: Proper contrast ratios and semantic HTML
- **Performance**: Optimized images and lazy loading
- **User Experience**: Intuitive navigation and clear feedback

## 🔄 Data Flow

1. **Employee Login**: Authenticate → Check daily status → Capture photo → Upload to Cloudinary → Store record → Show success
2. **Admin View**: Authenticate → Fetch records → Display in table → Photo popup on click
3. **Auto Cleanup**: Daily cron job → Find 7+ day old photos → Delete from Cloudinary → Mark as deleted in DB

## 📊 Database Schema

### User Collection:
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  employeeId: String (unique),
  department: String,
  role: String (employee/admin),
  isActive: Boolean
}
```

### LoginRecord Collection:
```javascript
{
  userId: ObjectId,
  name: String,
  email: String,
  employeeId: String,
  department: String,
  photoUrl: String,
  cloudinaryPublicId: String,
  loginDate: Date,
  location: { latitude, longitude, accuracy },
  isPhotoDeleted: Boolean
}
```

## 🤝 Support

For issues and questions:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure MongoDB and Cloudinary connections are working
4. Check network connectivity for API calls

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ using MERN Stack**