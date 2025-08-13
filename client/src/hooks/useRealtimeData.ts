import { useState, useEffect } from 'react';
import { ref, onValue, off, push, set, remove, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../lib/firebase';

export const useRealtimeData = <T>(path: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataRef = ref(database, path);
    
    const handleData = (snapshot: any) => {
      try {
        if (snapshot.exists()) {
          const values = snapshot.val();
          const dataArray = Object.keys(values).map(key => ({
            id: key,
            ...values[key]
          }));
          setData(dataArray);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error('Error processing data:', err);
        setError('Failed to process data');
      } finally {
        setLoading(false);
      }
    };

    const handleError = (error: any) => {
      console.error('Firebase error:', error);
      setError(error.message);
      setLoading(false);
    };

    onValue(dataRef, handleData, handleError);

    return () => off(dataRef);
  }, [path]);

  const addData = async (newData: Omit<T, 'id'>) => {
    try {
      const dataRef = ref(database, path);
      await push(dataRef, {
        ...newData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error adding data:', err);
      throw err;
    }
  };

  const updateData = async (id: string, updates: Partial<T>) => {
    try {
      const itemRef = ref(database, `${path}/${id}`);
      await set(itemRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error updating data:', err);
      throw err;
    }
  };

  const deleteData = async (id: string) => {
    try {
      const itemRef = ref(database, `${path}/${id}`);
      await remove(itemRef);
    } catch (err) {
      console.error('Error deleting data:', err);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    addData,
    updateData,
    deleteData,
  };
};

export const useRealtimeQuery = <T>(path: string, orderBy: string, equalToValue: any) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const queryRef = query(
      ref(database, path),
      orderByChild(orderBy),
      equalTo(equalToValue)
    );

    const handleData = (snapshot: any) => {
      try {
        if (snapshot.exists()) {
          const values = snapshot.val();
          const dataArray = Object.keys(values).map(key => ({
            id: key,
            ...values[key]
          }));
          setData(dataArray);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error('Error processing query data:', err);
        setError('Failed to process query data');
      } finally {
        setLoading(false);
      }
    };

    onValue(queryRef, handleData);

    return () => off(queryRef);
  }, [path, orderBy, equalToValue]);

  return { data, loading, error };
};
