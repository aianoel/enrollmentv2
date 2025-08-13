import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '../lib/firebase';

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
  const results = [];
  
  for (const user of defaultUsers) {
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      
      // Create user profile in Realtime Database
      await set(ref(database, `users/${userCredential.user.uid}`), {
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: new Date().toISOString(),
        isActive: true
      });
      
      results.push({
        success: true,
        email: user.email,
        role: user.role,
        uid: userCredential.user.uid
      });
      
      console.log(`✅ Created ${user.role}: ${user.email}`);
      
    } catch (error: any) {
      results.push({
        success: false,
        email: user.email,
        role: user.role,
        error: error.message
      });
      
      console.error(`❌ Failed to create ${user.role} (${user.email}):`, error.message);
    }
  }
  
  console.log('\n📊 Setup Summary:');
  console.log(`✅ Success: ${results.filter(r => r.success).length}`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);
  
  return Promise.resolve();
};

export const createSingleUser = async (userSetup: UserSetup): Promise<string> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userSetup.email,
      userSetup.password
    );
    
    await set(ref(database, `users/${userCredential.user.uid}`), {
      email: userSetup.email,
      name: userSetup.name,
      role: userSetup.role,
      createdAt: new Date().toISOString(),
      isActive: true
    });
    
    return userCredential.user.uid;
  } catch (error: any) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

// Default admin credentials for easy access
export const ADMIN_CREDENTIALS = {
  email: 'admin@school.edu',
  password: 'admin123456'
};

export { defaultUsers };