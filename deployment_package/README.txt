School Management System - Hostinger Deployment Package
=====================================================

Files included:
- dist/ - Built application
- package.json - Production dependencies
- hostinger_database_schema.sql - Database schema
- production.env.example - Environment template
- HOSTINGER_DEPLOYMENT_GUIDE.md - Complete deployment guide

Next steps:
1. Upload all files to your Hostinger public_html directory
2. Create PostgreSQL database and import hostinger_database_schema.sql
3. Copy production.env.example to .env and configure
4. Install dependencies: npm install --production
5. Start application through Hostinger Node.js panel

For detailed instructions, see HOSTINGER_DEPLOYMENT_GUIDE.md
