import { createContext, useContext, useEffect, useState } from 'react';
import { checkAndRefreshAuth } from '../services/auth';
import { TokenService } from '../services/tokenService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      console.log('Initializing auth...');
      try {
        const refreshToken = TokenService.getRefreshToken();
        console.log('Initial refresh token check:', refreshToken ? 'exists' : 'not found');
        
        if (refreshToken) {
          const isAuth = await checkAndRefreshAuth();
          console.log('Auth check result:', isAuth);
          setIsAuthenticated(isAuth);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  const login = () => {
    console.log('Setting authenticated state to true');
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log('Setting authenticated state to false');
    setIsAuthenticated(false);
  };

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}