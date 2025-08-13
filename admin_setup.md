# Admin Setup Instructions

## Default Admin Credentials

### Admin Account Details:
- **Email**: admin@school.edu
- **Password**: admin123456
- **Role**: admin

### Test Accounts for Development:

#### Teacher Account:
- **Email**: teacher@school.edu
- **Password**: teacher123456
- **Role**: teacher

#### Student Account:
- **Email**: student@school.edu
- **Password**: student123456
- **Role**: student

#### Parent Account:
- **Email**: parent@school.edu
- **Password**: parent123456
- **Role**: parent

#### Registrar Account:
- **Email**: registrar@school.edu
- **Password**: registrar123456
- **Role**: registrar

#### Guidance Counselor Account:
- **Email**: guidance@school.edu
- **Password**: guidance123456
- **Role**: guidance

#### Accounting Staff Account:
- **Email**: accounting@school.edu
- **Password**: accounting123456
- **Role**: accounting

## Setup Instructions:

1. **Firebase Configuration**: Make sure your Firebase project has the following services enabled:
   - Authentication (Email/Password provider)
   - Realtime Database
   - Storage

2. **Create Admin Account**: Use the Firebase Console to manually create the admin account:
   - Go to Authentication → Users → Add user
   - Email: admin@school.edu
   - Password: admin123456

3. **Set User Role in Database**: In Firebase Realtime Database, create this structure:
   ```json
   {
     "users": {
       "[admin_user_uid]": {
         "email": "admin@school.edu",
         "name": "System Administrator",
         "role": "admin",
         "createdAt": "2025-08-13T09:40:00Z"
       }
     }
   }
   ```

4. **Database Rules**: Set these Firebase Realtime Database rules:
   ```json
   {
     "rules": {
       ".read": "auth != null",
       ".write": "auth != null",
       "users": {
         "$uid": {
           ".write": "$uid == auth.uid || root.child('users').child(auth.uid).child('role').val() == 'admin'"
         }
       }
     }
   }
   ```

5. **Storage Rules**: Set these Firebase Storage rules:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## Notes:
- Change these default passwords in production
- The admin account has full access to all system features
- Use these credentials to log in and create additional users through the admin panel