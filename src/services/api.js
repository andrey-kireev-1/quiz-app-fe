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
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/test/${testId}`,{
      method: 'GET',
    });

    console.log(response);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при загрузке теста');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch test error:', error);
    throw error;
  }
};

export const submitTestResults = async (testId, score, answers) => {
  try {
    const refreshToken = TokenService.getRefreshToken();
    
    const response = await fetchWithAuth(`${API_BASE_URL}/set_result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        testId: testId,
        refreshToken: refreshToken,
        score: score,
        Result: answers
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при сохранении результатов');
    }

    return;
  } catch (error) {
    console.error('Submit results error:', error);
    throw error;
  }
};

export const getAllTests = async (page) => {
  try {
    const response = await fetch(`${API_BASE_URL}/get_all_tests/${page}/`);
    
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