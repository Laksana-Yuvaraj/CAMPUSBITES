import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, Notification } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  demoUsers: User[];
  notifications: Notification[];
  unreadCount: number;
  login: (email: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    role: string;
    collegeId: string;
    hostelOrDept?: string;
    room?: string;
  }) => Promise<void>;
  logout: () => void;
  switchDemoUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load demo users and current user session
  const initAuth = useCallback(async () => {
    try {
      const demoRes = await api.getDemoUsers().catch(() => ({ users: [] }));
      setDemoUsers(demoRes.users);

      const token = localStorage.getItem('campusbites_token');
      if (token) {
        const meRes = await api.getMe().catch(() => null);
        if (meRes?.user) {
          setUser(meRes.user);
        } else {
          // If token wasn't recognized, fallback to first demo student
          if (demoRes.users.length > 0) {
            const defaultStudent = demoRes.users.find((u) => u.role === 'student') || demoRes.users[0];
            localStorage.setItem('campusbites_token', defaultStudent.id);
            setUser(defaultStudent);
          }
        }
      } else if (demoRes.users.length > 0) {
        // Default to student 1 (Aarav Sharma) so app opens instantly with ready experience
        const defaultStudent = demoRes.users.find((u) => u.role === 'student') || demoRes.users[0];
        localStorage.setItem('campusbites_token', defaultStudent.id);
        setUser(defaultStudent);
      }
    } catch (e) {
      console.error('Failed to init auth:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications().catch(() => ({ notifications: [] }));
      setNotifications(res.notifications);
    } catch (e) {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 8000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  const login = async (email: string) => {
    const res = await api.login(email);
    localStorage.setItem('campusbites_token', res.token);
    setUser(res.user);
    const notifs = await api.getNotifications().catch(() => ({ notifications: [] }));
    setNotifications(notifs.notifications);
  };

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    role: string;
    collegeId: string;
    hostelOrDept?: string;
    room?: string;
  }) => {
    const res = await api.register(data);
    localStorage.setItem('campusbites_token', res.token);
    setUser(res.user);
    // refresh demo users list
    const demoRes = await api.getDemoUsers().catch(() => ({ users: [] }));
    setDemoUsers(demoRes.users);
  };

  const logout = () => {
    localStorage.removeItem('campusbites_token');
    setUser(null);
    setNotifications([]);
  };

  const switchDemoUser = (newUser: User) => {
    localStorage.setItem('campusbites_token', newUser.id);
    setUser(newUser);
    fetchNotifications();
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (e) {
      // ignore
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        loading,
        demoUsers,
        notifications,
        unreadCount,
        login,
        register,
        logout,
        switchDemoUser,
        refreshUser,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
