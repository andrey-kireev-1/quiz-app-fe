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
        image: testData.image, // { name, type, data }
        isStrict: testData.isStrict,
        isPrivate: testData.isPrivate,
        questions: testData.questions,
        refreshToken: refreshToken // Adding refreshToken to request
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при создании теста');
    }

    return await response.json();
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