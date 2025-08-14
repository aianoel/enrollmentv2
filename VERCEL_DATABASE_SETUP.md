# Vercel Database Setup Guide

## 🗄️ Database Configuration for School Enrollment System

Your school enrollment system is now configured to work with **Neon Database** (PostgreSQL) on Vercel. Follow these steps to make the database fully functional.

## 📋 Required Environment Variables

You need to configure the following environment variables in your Vercel dashboard:

### 1. Database Configuration
```
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
```

### 2. Vercel Blob Storage (File Storage)
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_fy8GdRLMhpGvIW7Y_Uvhws9tXqLX4Tj5X8A8BEOwsXsodyk
```

### 3. Authentication Secrets
```
JWT_SECRET=your-super-secure-jwt-secret-key-here
SESSION_SECRET=your-session-secret-key-here
```

### 3. Optional: External Services
```
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name
FIREBASE_PROJECT_ID=your-firebase-project-id
```

## 🚀 Setting Up Environment Variables in Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `school-enroll-1`
3. **Go to Settings** → **Environment Variables**
4. **Add each variable** with the appropriate values

## 🗃️ Database Provider Options

### Option 1: Neon Database (Recommended)
- **Free tier available**: Perfect for development
- **Serverless PostgreSQL**: Scales automatically
- **Setup**: https://neon.tech/
- **Connection**: Use the connection string provided by Neon

### Option 2: Vercel Postgres
- **Integrated with Vercel**: Seamless deployment
- **Setup**: In Vercel dashboard → Storage → Create Database
- **Auto-configured**: Environment variables set automatically

### Option 3: Supabase
- **Free tier**: Good for development and small projects
- **Setup**: https://supabase.com/
- **Features**: Built-in auth, real-time subscriptions

## 📊 Database Schema

Your system includes these main tables:
- **users**: Students, teachers, admin users
- **sections**: Class sections and grade levels
- **enrollments**: Student enrollment records
- **grades**: Student grades and assessments
- **teacherTasks**: Assignments and tasks
- **taskSubmissions**: Student submissions
- **notifications**: System notifications

## 🔧 API Endpoints Available

Once configured, these endpoints will be functional:

- `GET /api/` - API status and database connection test
- `GET /api/db/init` - Database initialization and connection test
- `GET /api/students` - List all students
- `POST /api/students` - Create new student
- `GET /api/students?id=123` - Get specific student
- `GET /api/enrollments` - List all enrollments
- `POST /api/enrollments` - Create new enrollment
- `PUT /api/enrollments?id=123` - Update enrollment

## ✅ Testing Your Database

1. **Visit your API**: https://school-enroll-1-aias-projects-c1ccf973.vercel.app/api/
2. **Check database status**: Look for `database.status: "connected"`
3. **Test initialization**: https://school-enroll-1-aias-projects-c1ccf973.vercel.app/api/db/init
4. **Test endpoints**: Try the students and enrollments endpoints

## 🔐 Security Notes

- **Never commit** real database credentials to Git
- **Use strong passwords** for database connections
- **Enable SSL** for database connections (included in connection strings)
- **Rotate secrets** regularly in production

## 🚨 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correctly formatted
- Check that your database allows connections from Vercel IPs
- Ensure SSL is enabled (`?sslmode=require`)

### API Errors
- Check Vercel function logs in dashboard
- Verify all environment variables are set
- Test database connection independently

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Test database connection directly
3. Verify environment variables are set correctly
4. Check database provider status page

Your school enrollment system is now ready for production use with a fully functional database! 🎉
