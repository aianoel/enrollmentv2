# Admin Credentials and Setup

## Default Login Credentials

### Admin Account:
- **Email**: admin@school.edu
- **Password**: admin123456
- **Role**: admin
- **Access**: Full system administration

### Test Accounts:

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

## Database Setup

The PostgreSQL database has been set up with:

1. ✅ **Users table** with all 7 user roles
2. ✅ **Sample data** including announcements, news, events
3. ✅ **Admin accounts** created with secure password hashing
4. ✅ **Database schema** following the provided MySQL-to-PostgreSQL conversion

## Security Notes

- All passwords are hashed using bcrypt with salt rounds of 12
- Default password for all test accounts: `[role]123456` (e.g., admin123456, teacher123456)
- ✅ **PASSWORD HASHING FIXED** - All accounts now use properly hashed passwords
- Change these passwords in production environment
- Admin account has full access to all system features

## Login Instructions

1. Navigate to the application login page
2. Use any of the email/password combinations above
3. The system will authenticate against the PostgreSQL database
4. Users will be redirected to their role-specific dashboard

## System Status ✅

- ✅ **PostgreSQL Database** - Successfully set up and running
- ✅ **Authentication System** - Working with bcrypt password hashing
- ✅ **Firebase Migration** - All Firebase dependencies removed
- ✅ **Admin Login** - Confirmed working (admin@school.edu / admin123456)
- ✅ **Sample Data** - Announcements, news, and events pre-loaded
- ✅ **7 User Roles** - All test accounts created and verified