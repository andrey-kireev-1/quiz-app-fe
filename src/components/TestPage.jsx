import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchTest } from '../services/api';
import { format } from 'date-fns';
import { Header } from './Header'; // Add this import

export function TestPage() {
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]); // New state for parsed questions
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showQuestions, setShowQuestions] = useState(false);
  const { testId } = useParams();
  const [userAnswers, setUserAnswers] = useState({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResults, setTestResults] = useState({
    correctAnswers: 0,
    totalQuestions: 0,
    percentage: 0
  });

  useEffect(() => {
    const loadTest = async () => {
      try {
        const data = await fetchTest(testId);
        setTest(data);
        // Parse questions JSON string
        if (data.questions) {
          try {
            const parsedQuestions = JSON.parse(data.questions);
            setQuestions(parsedQuestions);
          } catch (parseError) {
            console.error('Error parsing questions:', parseError);
            setError('Ошибка при загрузке вопросов');
          }
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadTest();
  }, [testId]);

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    if (!testCompleted) {
      setUserAnswers(prev => ({
        ...prev,
        [questionIndex]: answerIndex
      }));
    }
  };

  const handleTestComplete = () => {
    let correct = 0;
    const total = questions.length;

    questions.forEach((question, questionIndex) => {
      const selectedAnswerIndex = userAnswers[questionIndex];
      if (selectedAnswerIndex !== undefined) {
        const isCorrect = question.answers[selectedAnswerIndex].isCorrect;
        if (isCorrect) correct++;
      }
    });

    const percentage = Math.round((correct / total) * 100);
    
    setTestResults({
      correctAnswers: correct,
      totalQuestions: total,
      percentage
    });
    setTestCompleted(true);
  };

  const isQuestionCorrect = (questionIndex) => {
    if (!testCompleted) return null;
    const selectedAnswerIndex = userAnswers[questionIndex];
    if (selectedAnswerIndex === undefined) return false;
    return questions[questionIndex].answers[selectedAnswerIndex].isCorrect;
  };

  const resetTest = () => {
    setShowQuestions(true);
    setTestCompleted(false);
    setUserAnswers({});
    setTestResults({
      correctAnswers: 0,
      totalQuestions: 0,
      percentage: 0
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-beige-100 min-h-screen">
      <Header />
      <div className="pt-32 px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {test.image && (
            <div className="w-full h-64 overflow-hidden">
              <img
                src={test.image}
                alt={test.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">{test.title}</h1>
            
            <div className="text-gray-600 mb-6">
              <p className="mb-4">{test.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span>Автор: {test.creator}</span>
                <span>•</span>
                <span>Создан: {format(new Date(test.createdAt), 'dd.MM.yyyy')}</span>
              </div>
            </div>

            <button
              onClick={() => setShowQuestions(true)}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Пройти тест
            </button>

            {showQuestions && (
              <div className="mt-8 space-y-8">
                {questions.map((question, questionIndex) => {
                  const isCorrect = isQuestionCorrect(questionIndex);
                  const borderColor = testCompleted
                    ? isCorrect
                      ? 'border-green-500'
                      : 'border-red-500'
                    : 'border-gray-200';

                  return (
                    <div 
                      key={questionIndex} 
                      className={`border-2 rounded-lg p-6 transition-colors ${borderColor}`}
                    >
                      <h3 className="text-xl font-semibold mb-4">
                        {question.title}
                      </h3>
                      <div className="space-y-3">
                        {question.answers.map((answer, answerIndex) => (
                          <label
                            key={answerIndex}
                            className={`flex items-center space-x-3 cursor-pointer p-2 rounded
                              ${testCompleted ? 'cursor-not-allowed' : 'hover:bg-gray-50'}`}
                          >
                            <input
                              type="radio"
                              name={`question-${questionIndex}`}
                              className="h-4 w-4 text-blue-500"
                              disabled={testCompleted}
                              checked={userAnswers[questionIndex] === answerIndex}
                              onChange={() => handleAnswerSelect(questionIndex, answerIndex)}
                            />
                            <span>{answer.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {!testCompleted && (
                  <div className="flex justify-end mt-8">
                    <button
                      onClick={handleTestComplete}
                      className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition"
                    >
                      Завершить тест
                    </button>
                  </div>
                )}

                {testCompleted && (
                  <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Результаты теста</h3>
                    <div className="flex items-center gap-8">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#eee"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={testResults.percentage >= 70 ? "#4ade80" : "#ef4444"}
                            strokeWidth="3"
                            strokeDasharray={`${testResults.percentage}, 100`}
                          />
                          <text 
                            x="18" 
                            y="20.35" 
                            textAnchor="middle" 
                            fill="#666"
                            style={{ fontSize: '8px' }}
                          >
                            {testResults.percentage}%
                          </text>
                        </svg>
                      </div>
                      <div>
                        <p>Правильных ответов: {testResults.correctAnswers} из {testResults.totalQuestions}</p>
                        <div className="space-y-2">
                          <p className="text-sm mt-1">
                            {testResults.percentage >= 70 && (
                              <span className="text-green-600 block">Отличный результат!</span>
                            )}
                          </p>
                          <button
                            onClick={resetTest}
                            className="text-blue-500 hover:text-blue-700 hover:underline text-sm"
                          >
                            Попробуйте еще раз
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}