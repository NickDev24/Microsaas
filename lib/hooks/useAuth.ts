'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin_basico' | 'customer';
  is_active: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch {
        setError('Error fetching user data');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      return true;
    } catch {
      setError('Error during logout');
      return false;
    }
  };

  const hasPermission = (requiredRole: 'super_admin' | 'admin_basico' | 'customer') => {
    if (!user) return false;
    
    const roleHierarchy = {
      'customer': 0,
      'admin_basico': 1,
      'super_admin': 2
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  return {
    user,
    loading,
    error,
    logout,
    hasPermission,
    isSuperAdmin: user?.role === 'super_admin',
    isAdminBasico: user?.role === 'admin_basico',
    isCustomer: user?.role === 'customer',
  };
}
