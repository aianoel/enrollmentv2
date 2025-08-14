#!/bin/bash

# School Management System - Hostinger Deployment Script
# Run this script to prepare files for upload to Hostinger

echo "🚀 Preparing School Management System for Hostinger deployment..."

# Step 1: Build the application
echo "📦 Building application..."
npm run build

# Step 2: Create deployment directory
echo "📁 Creating deployment package..."
mkdir -p deployment_package

# Step 3: Copy necessary files
echo "📋 Copying files..."
cp -r dist/ deployment_package/
cp package.json deployment_package/
cp package-lock.json deployment_package/
cp drizzle.config.ts deployment_package/
cp hostinger_database_schema.sql deployment_package/
cp production.env.example deployment_package/
cp HOSTINGER_DEPLOYMENT_GUIDE.md deployment_package/

# Step 4: Copy shared folder for schema
cp -r shared/ deployment_package/

# Step 5: Create production package.json (without dev dependencies)
echo "⚙️ Creating production package.json..."
node -e "
const pkg = require('./package.json');
delete pkg.devDependencies;
pkg.scripts = {
  'start': 'NODE_ENV=production node dist/index.js',
  'db:push': 'drizzle-kit push'
};
require('fs').writeFileSync('deployment_package/package.json', JSON.stringify(pkg, null, 2));
"

# Step 6: Create README for deployment
cat > deployment_package/README.txt << EOF
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
EOF

# Step 7: Create zip file for easy upload
echo "📦 Creating zip file..."
cd deployment_package
zip -r ../school-management-hostinger.zip .
cd ..

echo "✅ Deployment package ready!"
echo ""
echo "Files created:"
echo "- deployment_package/ - Directory with all files"
echo "- school-management-hostinger.zip - Zip file for upload"
echo ""
echo "Next steps:"
echo "1. Upload school-management-hostinger.zip to Hostinger"
echo "2. Extract in public_html directory"
echo "3. Follow HOSTINGER_DEPLOYMENT_GUIDE.md"
echo ""
echo "Happy deploying! 🎉"