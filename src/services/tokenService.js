let accessToken = null;

export const TokenService = {
  setAccessToken(token) {
    console.log('Setting access token');
    accessToken = token;
  },
  
  getAccessToken() {
    return accessToken;
  },
  
  clearAccessToken() {
    console.log('Clearing access token');
    accessToken = null;
  },

  getRefreshToken() {
    const token = localStorage.getItem('refreshToken');
    console.log('Getting refresh token:', token ? 'exists' : 'not found');
    return token;
  },
  
  setRefreshToken(token) {
    console.log('Setting refresh token');
    localStorage.setItem('refreshToken', token);
  },
  
  clearRefreshToken() {
    console.log('Clearing refresh token');
    localStorage.removeItem('refreshToken');
  },
  
  clearAllTokens() {
    console.log('Clearing all tokens');
    this.clearAccessToken();
    this.clearRefreshToken();
  }
};