import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export const useRealtimeData = <T>(path: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert path to API endpoint
  const getApiEndpoint = (path: string) => {
    if (path.includes('announcements')) return '/api/announcements';
    if (path.includes('news')) return '/api/news';
    if (path.includes('events')) return '/api/events';
    // Default endpoint for other paths
    return `/api/${path}`;
  };

  const endpoint = getApiEndpoint(path);

  const { data: fetchedData, isLoading, error: queryError } = useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${endpoint}`);
      }
      return response.json();
    }
  });

  useEffect(() => {
    if (fetchedData) {
      setData(fetchedData);
      setLoading(false);
      setError(null);
    }
    if (queryError) {
      setError(queryError.message);
      setLoading(false);
    }
  }, [fetchedData, queryError]);

  const addData = async (newData: Omit<T, 'id'>) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add data');
      }
      
      // Refetch data after adding
      window.location.reload();
    } catch (err) {
      console.error('Error adding data:', err);
      throw err;
    }
  };

  const updateData = async (id: string, updates: Partial<T>) => {
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update data');
      }
      
      // Refetch data after updating
      window.location.reload();
    } catch (err) {
      console.error('Error updating data:', err);
      throw err;
    }
  };

  const deleteData = async (id: string) => {
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete data');
      }
      
      // Refetch data after deleting
      window.location.reload();
    } catch (err) {
      console.error('Error deleting data:', err);
      throw err;
    }
  };

  return {
    data,
    loading: isLoading,
    error,
    addData,
    updateData,
    deleteData,
  };
};

// Legacy function for backwards compatibility
export const useRealtimeQuery = <T>(path: string, filterField?: string, filterValue?: any) => {
  return useRealtimeData<T>(path);
};