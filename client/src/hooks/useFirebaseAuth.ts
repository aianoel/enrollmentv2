// Firebase authentication hook replaced with PostgreSQL
// This file is kept for compatibility during migration
// All Firebase authentication has been moved to PostgreSQL with /api/auth endpoints

import { useState, useEffect } from 'react';
import { User } from '@shared/schema';

// Legacy hook - no longer used
export const useFirebaseAuth = () => {
  return {
    user: null,
    userProfile: null,
    loading: false,
    error: "Firebase has been replaced with PostgreSQL authentication",
    login: async () => {
      throw new Error("Use PostgreSQL authentication instead");
    },
    register: async () => {
      throw new Error("Use PostgreSQL authentication instead");
    },
    logout: async () => {
      throw new Error("Use PostgreSQL authentication instead");
    }
  };
};