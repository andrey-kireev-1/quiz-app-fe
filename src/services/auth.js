import { TokenService } from './tokenService';

const API_BASE_URL = 'http://localhost:8000';

export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'credentials': "include",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await response.json();
    
    TokenService.setAccessToken(data.accessToken);
    TokenService.setRefreshToken(data.refreshToken);
    
    return true;
  } catch (error) {
    TokenService.clearAllTokens();
    throw error;
  }
};

export const logout = () => {
  TokenService.clearAllTokens();
};

export const isAuthenticated = () => {
  return !!TokenService.getAccessToken() && !!TokenService.getRefreshToken();
};

export const refreshTokens = async () => {
  const refreshToken = TokenService.getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const { accessToken, newRefreshToken } = await response.json();
    
    TokenService.setAccessToken(accessToken);
    if (newRefreshToken) {
      TokenService.setRefreshToken(newRefreshToken);
    }

    return true;
  } catch (error) {
    TokenService.clearAllTokens();
    throw error;
  }
};

export const checkAndRefreshAuth = async () => {
  const refreshToken = TokenService.getRefreshToken();
  
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      TokenService.clearAllTokens();
      return false;
    }

    const data = await response.json();
    
    if (data.accessToken) {
      TokenService.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        TokenService.setRefreshToken(data.refreshToken);
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error('Auth check failed:', error);
    TokenService.clearAllTokens();
    return false;
  }
};

export const register = async (userData) => {
  try {
    const response = await fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при регистрации');
    }

    const data = await response.json();
    
    // Сохраняем токены так же, как при логине
    if (data.accessToken) {
      TokenService.setAccessToken(data.accessToken);
    }
    if (data.refreshToken) {
      TokenService.setRefreshToken(data.refreshToken);
    }

    return data;
  } catch (error) {
    throw error;
  }
};