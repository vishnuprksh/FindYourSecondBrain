import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginAnonymously = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = { user, loading, loginAnonymously, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
