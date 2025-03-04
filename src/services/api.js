import { fetchWithAuth } from './fetchWithAuth';
import { TokenService } from './tokenService';

const API_BASE_URL = 'http://localhost:8000';

export const createTest = async (testData) => {
  try {
    const refreshToken = TokenService.getRefreshToken();
    
    const response = await fetchWithAuth(`${API_BASE_URL}/create_test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: testData.title,
        description: testData.description,
        image: testData.image,
        isStrict: testData.isStrict,
        isPrivate: testData.isPrivate,
        questions: testData.questions,
        refreshToken: refreshToken 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при создании теста');
    }

    return;
  } catch (error) {
    console.error('Create test error:', error);
    throw error;
  }
};

export const fetchTest = async (testId) => {
  if (!testId) {
    throw new Error('ID теста не найден');
  }

  try {
    console.log('Fetching test with ID:', testId);
    const response = await fetchWithAuth(`${API_BASE_URL}/test/${testId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Тест не найден');
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при загрузке теста');
    }

    const data = await response.json();
    console.log('Test data received:', data);
    return data;
  } catch (error) {
    console.error('Fetch test error:', error);
    throw error;
  }
};

export const submitTestResults = async (results) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/set_result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        testId: results.testId,
        score: results.score,
        result: results.result,
        refreshToken: results.refreshToken
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при отправке результатов');
    }

    return;
  } catch (error) {
    console.error('Submit results error:', error);
    throw error;
  }
};

export const getHomeTests = async (page) => {
  try {
    const response = await fetch(`${API_BASE_URL}/get_home_tests/${page}/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch tests');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get tests error:', error);
    throw error;
  }
};

export const getTestsCount = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/count_all_public_tests`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch tests count');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get tests count error:', error);
    throw error;
  }
};

export const fetchUserProfile = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/my_profile`);
    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchUserResults = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/my_results`);
    if (!response.ok) throw new Error('Failed to fetch user results');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchTestResults = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/my_tests_results`);
    if (!response.ok) throw new Error('Failed to fetch test results');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchMyTests = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/my_tests`);
    if (!response.ok) throw new Error('Failed to fetch my tests');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getAllTests = async (filters, page = 1) => {
  const queryParams = new URLSearchParams({
    page,
    ...(filters.testName && { testName: filters.testName }),
    ...(filters.authorName && { authorName: filters.authorName }),
    ...(filters.createdFrom && { createdFrom: filters.createdFrom }),
    ...(filters.createdTo && { createdTo: filters.createdTo }),
    ...(filters.isStrict !== null && { isStrict: filters.isStrict }),
  });

  const response = await fetch(`${API_BASE_URL}/get_all_tests?${queryParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tests');
  }
  return response.json();
};