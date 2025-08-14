# School Management System - Hostinger Deployment Guide

## Prerequisites

1. **Hostinger Web Hosting Account** with Node.js support
2. **PostgreSQL Database** access on Hostinger
3. **Domain name** configured in Hostinger
4. **FTP/File Manager** access

## Step 1: Prepare Your Files for Upload

### 1.1 Build the Project
```bash
npm run build
```

### 1.2 Files to Upload
Upload these folders/files to your Hostinger public_html directory:

**Required files:**
- `/dist/` - Built application
- `/node_modules/` - Dependencies (or run npm install on server)
- `package.json`
- `package-lock.json`
- `drizzle.config.ts`
- `.env` - (create this with your production settings)

**Optional files:**
- `shared/` - Schema files (if needed for migrations)

## Step 2: Database Setup

### 2.1 Create PostgreSQL Database in Hostinger
1. Log into your Hostinger control panel
2. Go to **Databases → PostgreSQL**
3. Create a new database with these details:
   - Database name: `school_management`
   - Username: `your_db_user`
   - Password: `your_secure_password`

### 2.2 Import Database Schema
Use the provided `hostinger_database_schema.sql` file to set up your database:

1. Open **phpPgAdmin** or **Adminer** in your Hostinger panel
2. Select your `school_management` database
3. Go to **Import** or **SQL** tab
4. Upload and execute the `hostinger_database_schema.sql` file

### 2.3 Create Admin User
After importing, run this SQL to create your first admin user:

```sql
-- Insert admin role
INSERT INTO roles (role_name) VALUES ('admin');

-- Insert admin user (replace with your details)
INSERT INTO users (name, email, password_hash, role, role_id, is_active) 
VALUES (
    'System Administrator',
    'admin@yourschool.com',
    '$2a$10$example_hash_replace_with_real_hash',
    'admin',
    1,
    true
);
```

**To generate password hash:** Use an online bcrypt generator or node.js:
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your_password', 10);
console.log(hash);
```

## Step 3: Environment Configuration

### 3.1 Create Production .env File
Create a `.env` file in your root directory with these settings:

```env
# Database Configuration
DATABASE_URL=postgresql://your_db_user:your_password@localhost:5432/school_management

# Server Configuration
NODE_ENV=production
PORT=3000

# Session Configuration
SESSION_SECRET=your_very_long_random_session_secret_here

# Application Configuration
REPLIT_DOMAINS=yourdomain.com,www.yourdomain.com
```

### 3.2 Update Database Connection
Replace the Neon database configuration with your Hostinger PostgreSQL details.

## Step 4: Upload Files to Hostinger

### 4.1 Using File Manager
1. Open **File Manager** in Hostinger control panel
2. Navigate to `public_html`
3. Upload all required files and folders
4. Extract if uploaded as zip

### 4.2 Using FTP Client
1. Use FTP credentials from Hostinger
2. Connect to your server
3. Upload files to `/public_html/`

## Step 5: Install Dependencies

### 5.1 Via SSH (Recommended)
If you have SSH access:
```bash
cd public_html
npm install --production
```

### 5.2 Via File Upload
If no SSH access, upload the entire `node_modules` folder (large file size).

## Step 6: Configure Node.js Application

### 6.1 Set Node.js Version
In Hostinger control panel:
1. Go to **Advanced → Node.js**
2. Select Node.js version 18 or higher
3. Set application root to `public_html`
4. Set startup file to `dist/index.js`

### 6.2 Set Environment Variables
In Node.js configuration panel, add your environment variables:
- `DATABASE_URL`
- `NODE_ENV`
- `SESSION_SECRET`

## Step 7: Database Migration

### 7.1 Push Schema to Production Database
If you have SSH access:
```bash
npm run db:push
```

### 7.2 Manual Schema Import
If no SSH access, manually run the SQL schema file in your database admin panel.

## Step 8: Start Your Application

### 8.1 Start the Application
In Hostinger Node.js panel:
1. Click **Start Application**
2. Monitor logs for any errors

### 8.2 Test the Application
1. Visit your domain: `https://yourdomain.com`
2. Try logging in with your admin credentials
3. Test core functionalities

## Step 9: Domain Configuration

### 9.1 Point Domain to Application
1. In Hostinger control panel, go to **Domains**
2. Point your domain to the Node.js application
3. Ensure SSL certificate is active

## Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Check DATABASE_URL format
   - Verify database credentials
   - Ensure database exists

2. **Module Not Found Errors**
   - Run `npm install` on server
   - Check all dependencies are uploaded

3. **Permission Errors**
   - Set correct file permissions (755 for directories, 644 for files)
   - Check Node.js application has write access

4. **Application Won't Start**
   - Check Node.js version compatibility
   - Review application logs
   - Verify startup file path

### Log Locations:
- Node.js logs: Available in Hostinger Node.js panel
- Error logs: Check Hostinger error logs

## Security Recommendations

1. **Change Default Passwords**
   - Update admin user password
   - Use strong database passwords

2. **Environment Variables**
   - Keep `.env` file secure
   - Use strong session secrets

3. **Database Security**
   - Restrict database access by IP
   - Use SSL connections if available

4. **Regular Backups**
   - Set up automatic database backups
   - Backup application files regularly

## Post-Deployment Checklist

- [ ] Database schema imported successfully
- [ ] Admin user created and can log in
- [ ] All core features working (user management, content management, etc.)
- [ ] File uploads working (if using object storage)
- [ ] Real-time chat functioning
- [ ] SSL certificate active
- [ ] Domain pointing to application
- [ ] Regular backups configured

## Support

If you encounter issues:
1. Check Hostinger documentation for Node.js hosting
2. Review application logs for specific errors
3. Contact Hostinger support for hosting-related issues
4. Check database connection and permissions

---

**Note:** This guide assumes you have a Hostinger hosting plan that supports Node.js applications and PostgreSQL databases. Some shared hosting plans may have limitations.