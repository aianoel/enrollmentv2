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
- Default password for all test accounts: `123456` (with role prefix)
- Change these passwords in production environment
- Admin account has full access to all system features

## Login Instructions

1. Navigate to the application login page
2. Use any of the email/password combinations above
3. The system will authenticate against the PostgreSQL database
4. Users will be redirected to their role-specific dashboard

## Next Steps

- **Remove Firebase dependencies** from frontend
- **Update authentication system** to use PostgreSQL
- **Implement session management** for user authentication
- **Test role-based access control** with different user types