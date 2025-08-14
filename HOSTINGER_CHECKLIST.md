# Hostinger Deployment Checklist

## Pre-Deployment Requirements

### Hostinger Account Setup
- [ ] Hostinger hosting account with Node.js support
- [ ] PostgreSQL database access enabled
- [ ] Domain name configured
- [ ] FTP/File Manager access available

### Project Preparation
- [ ] Run `npm run build` successfully
- [ ] Run `./deploy-to-hostinger.sh` to create deployment package
- [ ] Verify `school-management-hostinger.zip` is created

## Database Setup Steps

### 1. Create PostgreSQL Database
- [ ] Go to Hostinger Control Panel → Databases → PostgreSQL
- [ ] Create new database: `school_management`
- [ ] Note down:
  - Database name: `school_management`
  - Username: `_____________`
  - Password: `_____________`
  - Host: `localhost` (usually)
  - Port: `5432` (usually)

### 2. Import Database Schema
- [ ] Open phpPgAdmin or Adminer from Hostinger panel
- [ ] Select your `school_management` database
- [ ] Import `hostinger_database_schema.sql`
- [ ] Verify all tables are created (16 tables total)

### 3. Create Admin User
- [ ] Generate bcrypt hash for your admin password
- [ ] Update the admin user INSERT statement in schema
- [ ] Execute the admin user creation SQL

## File Upload Steps

### 1. Upload Files
- [ ] Extract `school-management-hostinger.zip` to `public_html`
- [ ] Verify all folders are present:
  - [ ] `dist/` folder
  - [ ] `shared/` folder
  - [ ] `package.json`
  - [ ] `hostinger_database_schema.sql`

### 2. Environment Configuration
- [ ] Copy `production.env.example` to `.env`
- [ ] Update DATABASE_URL with your Hostinger PostgreSQL details
- [ ] Set strong SESSION_SECRET (minimum 32 characters)
- [ ] Update REPLIT_DOMAINS with your actual domain

## Hostinger Panel Configuration

### 1. Node.js Setup
- [ ] Go to Advanced → Node.js in Hostinger panel
- [ ] Select Node.js version 18 or higher
- [ ] Set application root: `public_html`
- [ ] Set startup file: `dist/index.js`
- [ ] Add environment variables:
  - [ ] `DATABASE_URL`
  - [ ] `NODE_ENV=production`
  - [ ] `SESSION_SECRET`

### 2. Install Dependencies
- [ ] If SSH access: Run `npm install --production`
- [ ] If no SSH: Upload complete `node_modules` folder

### 3. Domain Configuration
- [ ] Point domain to Node.js application
- [ ] Ensure SSL certificate is active
- [ ] Test domain access

## Testing Steps

### 1. Application Start
- [ ] Start application from Hostinger Node.js panel
- [ ] Check logs for errors
- [ ] Verify application is running

### 2. Functionality Testing
- [ ] Visit your domain
- [ ] Login with admin credentials
- [ ] Test main features:
  - [ ] Dashboard statistics display
  - [ ] User management works
  - [ ] Content management (announcements, org chart)
  - [ ] System configuration
  - [ ] Real-time chat functionality

### 3. Database Testing
- [ ] Create new user
- [ ] Add announcement
- [ ] Create organization chart entry
- [ ] Update school settings
- [ ] Verify data persists

## Security Checklist

### 1. Password Security
- [ ] Changed default admin password
- [ ] Used strong database password
- [ ] Generated secure SESSION_SECRET

### 2. File Permissions
- [ ] Set proper file permissions (755 for directories, 644 for files)
- [ ] Secure `.env` file
- [ ] Remove any sensitive files from public access

### 3. Database Security
- [ ] Database user has minimal required permissions
- [ ] No default/weak passwords
- [ ] Regular backup schedule configured

## Post-Deployment Tasks

### 1. Data Setup
- [ ] Add actual school information
- [ ] Create real user accounts
- [ ] Set up proper sections and subjects
- [ ] Configure tuition fee structures

### 2. Monitoring
- [ ] Set up error monitoring
- [ ] Configure automated backups
- [ ] Monitor application performance
- [ ] Check logs regularly

### 3. Maintenance
- [ ] Document backup/restore procedures
- [ ] Schedule regular updates
- [ ] Monitor disk space usage
- [ ] Keep dependencies updated

## Troubleshooting Common Issues

### Database Connection Issues
- [ ] Verify DATABASE_URL format
- [ ] Check database credentials
- [ ] Ensure database exists and is accessible
- [ ] Test connection from application

### Application Won't Start
- [ ] Check Node.js version compatibility
- [ ] Verify startup file path
- [ ] Review application logs
- [ ] Ensure all dependencies are installed

### Performance Issues
- [ ] Monitor database query performance
- [ ] Check server resource usage
- [ ] Optimize database indexes if needed
- [ ] Consider caching strategies

## Emergency Contacts & Resources

### Support Resources
- [ ] Hostinger support documentation saved
- [ ] Database backup procedures documented
- [ ] Application logs location noted
- [ ] Emergency contact information ready

### Backup Information
- Database backup location: `_____________`
- File backup location: `_____________`
- Last backup date: `_____________`
- Restore procedure documented: [ ]

---

**Deployment Date:** ___________
**Deployed by:** ___________
**Domain:** ___________
**Database Name:** ___________

## Notes
_Use this space for deployment-specific notes, issues encountered, or customizations made:_

```
___________________________________________________________
___________________________________________________________
___________________________________________________________
```