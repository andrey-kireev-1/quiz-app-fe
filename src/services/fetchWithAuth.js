import { TokenService } from './tokenService';
import { refreshTokens } from './auth';

export const fetchWithAuth = async (url, options = {}) => {
  console.log('Executing authenticated request to:', url);
  let token = TokenService.getAccessToken();

  if (!token) {
    console.log('No access token found, attempting refresh');
    try {
      await refreshTokens();
      token = TokenService.getAccessToken();
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('No access token available');
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      try {
        await refreshTokens();
        token = TokenService.getAccessToken();
        
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (refreshError) {
        TokenService.clearAllTokens();
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};