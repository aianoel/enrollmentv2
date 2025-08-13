import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, database } from '../lib/firebase';
import { User } from '@shared/schema';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get user profile from database
          const userRef = ref(database, `users/${firebaseUser.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            setUserProfile(snapshot.val());
          } else {
            setUserProfile(null);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError('Failed to load user profile');
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setError(null);
      setLoading(true);
      
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save user profile to database
      const userProfile: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        role: userData.role || 'student',
        phoneNumber: userData.phoneNumber,
        address: userData.address,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await set(ref(database, `users/${firebaseUser.uid}`), userProfile);
      setUserProfile(userProfile);
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    user,
    userProfile,
    loading,
    error,
    login,
    register,
    logout,
  };
};
