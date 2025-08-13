// Admin setup now handled via PostgreSQL database
// Firebase has been replaced with PostgreSQL authentication

interface UserSetup {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'teacher' | 'student' | 'parent' | 'guidance' | 'registrar' | 'accounting';
}

const defaultUsers: UserSetup[] = [
  {
    email: 'admin@school.edu',
    password: 'admin123456',
    name: 'System Administrator',
    role: 'admin'
  },
  {
    email: 'teacher@school.edu',
    password: 'teacher123456',
    name: 'John Teacher',
    role: 'teacher'
  },
  {
    email: 'student@school.edu',
    password: 'student123456',
    name: 'Jane Student',
    role: 'student'
  },
  {
    email: 'parent@school.edu',
    password: 'parent123456',
    name: 'Mary Parent',
    role: 'parent'
  },
  {
    email: 'registrar@school.edu',
    password: 'registrar123456',
    name: 'Bob Registrar',
    role: 'registrar'
  },
  {
    email: 'guidance@school.edu',
    password: 'guidance123456',
    name: 'Sarah Guidance',
    role: 'guidance'
  },
  {
    email: 'accounting@school.edu',
    password: 'accounting123456',
    name: 'Mike Accounting',
    role: 'accounting'
  }
];

export const createDefaultUsers = async (): Promise<void> => {
  console.log("Default users are now created via PostgreSQL database setup");
  console.log("Users have been pre-loaded during initial database migration");
  return Promise.resolve();
};

export const createSingleUser = async (userSetup: UserSetup): Promise<string> => {
  console.log("Single user creation moved to PostgreSQL API endpoints");
  throw new Error("Use /api/auth/register endpoint instead");
};

// Default admin credentials for easy access
export const ADMIN_CREDENTIALS = {
  email: 'admin@school.edu',
  password: 'admin123456'
};

export { defaultUsers };