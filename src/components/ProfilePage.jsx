import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { fetchUserProfile, fetchUserResults, fetchTestResults, fetchMyTests } from '../services/api';
import { format } from 'date-fns';

export function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(null);
  const [expandedAnswers, setExpandedAnswers] = useState({
    myResults: {},
    testResults: {}
  });
  const [myTests, setMyTests] = useState({ tests: [] });
  const navigate = useNavigate();

  const toggleAnswers = (resultId, section) => {
    setExpandedAnswers(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [resultId]: !prev[section][resultId]
      }
    }));
  };

  const parseAnswers = (resultString) => {
    try {
      const parsed = JSON.parse(resultString);
      if (!parsed || !parsed.answers) {
        console.error('Invalid answers format:', parsed);
        return null;
      }
      return parsed;
    } catch (error) {
      console.error('Error parsing answers:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const [profileData, userResultsData, testResultsData] = await Promise.all([
          fetchUserProfile(),
          fetchUserResults(),
          fetchTestResults(),
        ]);

        setProfile(profileData);
        setUserResults(userResultsData);
        setTestResults(testResultsData);
      } catch (error) {
        setError('Ошибка при загрузке данных профиля');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, []);

  useEffect(() => {
    const getMyTests = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMyTests();
        setMyTests(data);
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getMyTests();
  }, []);

  const handleCopyCode = async (testId) => {
    try {
      await navigator.clipboard.writeText(testId);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-beige-100 min-h-screen">
      <Header />
      <div className="pt-32 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Профиль</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">Имя:</span> {profile?.name}</p>
              <p><span className="font-semibold">Email:</span> {profile?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <button
                className="w-full p-4 text-left font-semibold flex justify-between items-center"
                onClick={() => setActiveTab(activeTab === 'myTests' ? null : 'myTests')}
              >
                <span>Мои тесты</span>
                <svg
                  className={`w-6 h-6 transform transition-transform ${
                    activeTab === 'myTests' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {activeTab === 'myTests' && (
                <div className="p-4 border-t">
                  {isLoading ? (
                    <p className="text-gray-500">Загрузка...</p>
                  ) : myTests.tests.length > 0 ? ( 
                    <div className="space-y-4">
                      {myTests.tests.map((test, index) => ( 
                        <div key={test.id} className="border rounded p-4">
                          <h4 className="font-semibold text-lg mb-2">
                            {index + 1}. {test.title}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-2">
                            <p>Дата создания: {format(new Date(test.createdAt), 'dd.MM.yyyy HH:mm')}</p>
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => navigate(`/test/${test.id}`)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                              >
                                Перейти
                              </button>
                              <button
                                onClick={() => handleCopyCode(test.id)}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                              >
                                Скопировать код
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">У вас пока нет созданных тестов</p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <button
                className="w-full p-4 text-left font-semibold flex justify-between items-center"
                onClick={() => setActiveTab(activeTab === 'results' ? null : 'results')}
              >
                <span>Мои результаты</span>
                <svg
                  className={`w-6 h-6 transform transition-transform ${
                    activeTab === 'results' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeTab === 'results' && (
                <div className="p-4 border-t">
                  {userResults.results.length > 0 ? (
                    <div className="space-y-4">
                      {userResults.results.map((result, index) => (
                        <div key={index} className="border rounded p-4">
                          <h4 className="font-semibold text-lg mb-2">
                            {index + 1}. {result.testName}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-2">
                            <p>Результат: {result.score}%</p>
                            <p>Дата: {format(new Date(result.createdAt), 'dd.MM.yyyy HH:mm')}</p>
                            
                            <div className="mt-4">
                              <button
                                onClick={() => toggleAnswers(result.id, 'myResults')}
                                className="text-blue-500 hover:text-blue-700 flex items-center gap-2"
                              >
                                <span>Показать ответы</span>
                                <svg
                                  className={`w-4 h-4 transform transition-transform ${
                                    expandedAnswers.myResults[result.id] ? 'rotate-180' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              
                              {expandedAnswers.myResults[result.id] && (
                                <div className="mt-4 pl-4 border-l-2 border-gray-200">
                                  {(() => {
                                    const answersData = parseAnswers(result.result);
                                    if (!answersData || !answersData.answers) {
                                      return <p>Ошибка загрузки ответов</p>;
                                    }
                                  
                                    return answersData.answers.map((answer, answerIndex) => (
                                      <div key={answerIndex} className="mb-4">
                                        <h5 className="font-medium">{answer.question}</h5>
                                        <div className="ml-4 mt-1">
                                          {answer.selectedAnswers && answer.selectedAnswers.map((selected, selectedIndex) => (
                                            <div 
                                              key={selectedIndex}
                                              className={`flex items-center gap-2 ${
                                                selected.isCorrect ? 'text-green-600' : 'text-red-600'
                                              }`}
                                            >
                                              <span>{selectedIndex + 1}.</span>
                                              <span>{selected.answer}</span>
                                              {selected.isCorrect ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                              ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ));
                                  })()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">У вас пока нет результатов</p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <button
                className="w-full p-4 text-left font-semibold flex justify-between items-center"
                onClick={() => setActiveTab(activeTab === 'testResults' ? null : 'testResults')}
              >
                <span>Результаты прохождения моих тестов</span>
                <svg
                  className={`w-6 h-6 transform transition-transform ${
                    activeTab === 'testResults' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeTab === 'testResults' && (
                <div className="p-4 border-t">
                  {testResults.results.length > 0 ? (
                    <div className="space-y-4">
                      {testResults.results.map((result, index) => (
                        <div key={index} className="border rounded p-4">
                          <h4 className="font-semibold text-lg mb-2">
                            {index + 1}. {result.testName}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-2">
                            <p>Пользователь: {result.userName}</p>
                            <p>Результат: {result.score}%</p>
                            <p>Дата: {format(new Date(result.completedAt), 'dd.MM.yyyy HH:mm')}</p>
                            
                            <div className="mt-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAnswers(`test_${index}`, 'testResults');
                                }}
                                className="text-blue-500 hover:text-blue-700 flex items-center gap-2"
                              >
                                <span>Показать ответы</span>
                                <svg
                                  className={`w-4 h-4 transform transition-transform ${
                                    expandedAnswers.testResults[`test_${index}`] ? 'rotate-180' : '' 
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              
                              {expandedAnswers.testResults[`test_${index}`] && (
                                <div className="mt-4 pl-4 border-l-2 border-gray-200">
                                  {(() => {
                                    const answersData = parseAnswers(result.result);
                                    if (!answersData) return <p>Ошибка загрузки ответов</p>;

                                    return answersData.answers.map((answer, answerIndex) => (
                                      <div key={answerIndex} className="mb-4">
                                        <h5 className="font-medium">Вопрос {answer.question}</h5>
                                        <div className="ml-4 mt-1">
                                          {answer.selectedAnswers.map((selected, selectedIndex) => (
                                            <div 
                                              key={selectedIndex}
                                              className={`flex items-center gap-2 ${
                                                selected.isCorrect ? 'text-green-600' : 'text-red-600'
                                              }`}
                                            >
                                              <span>{selectedIndex + 1}.</span>
                                              <span>{selected.answer}</span>
                                              {selected.isCorrect ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                              ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ));
                                  })()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Пока никто не проходил ваши тесты</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}