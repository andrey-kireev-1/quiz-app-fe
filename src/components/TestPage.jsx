import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTest, submitTestResults } from '../services/api';
import { format } from 'date-fns';
import { Header } from './Header';

export function TestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  useEffect(() => {
    const loadTest = async () => {
      if (!id) {
        setError('ID теста не найден');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchTest(id);
        if (!data) {
          throw new Error('Тест не найден');
        }
        
        const parsedQuestions = JSON.parse(data.questions);
        const parsedTest = {
          ...data,
          questions: parsedQuestions.map((q, index) => ({
            id: index.toString(),
            text: q.title,
            answers: q.answers.map((a, aIndex) => ({
              id: `${index}_${aIndex}`,
              text: a.text,
              isCorrect: a.isCorrect
            }))
          }))
        };
        
        console.log('Parsed test data:', parsedTest);
        setTest(parsedTest);
      } catch (error) {
        console.error('Error loading test:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadTest();
  }, [id]);

  const handleAnswerChange = (questionId, answerId, isChecked) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: isChecked 
        ? [...(prev[questionId] || []), answerId]
        : (prev[questionId] || []).filter(id => id !== answerId)
    }));
  };

  const canSubmitTest = () => {
    if (!test) return false;

    if (test.isStrict) {
      // В строгом режиме проверяем, что на все вопросы есть хотя бы один ответ
      return test.questions.every(question => 
        answers[question.id] && answers[question.id].length > 0
      );
    }
    
    // В не строгом режиме разрешаем отправку если есть хотя бы один ответ
    return Object.keys(answers).length > 0;
  };

  const calculateScore = () => {
    if (!test) return 0;

    let correctAnswers = 0;
    let totalQuestions = 0;

    test.questions.forEach(question => {
      const userAnswers = answers[question.id] || [];
      
      // Пропускаем вопрос если нет ответов в не строгом режиме
      if (!test.isStrict && userAnswers.length === 0) {
        return;
      }

      totalQuestions++;

      // Получаем правильные ответы для вопроса
      const correctAnswerIds = question.answers
        .filter(answer => answer.isCorrect)
        .map(answer => answer.id);

      // Сравниваем массивы ответов
      const isCorrect = 
        userAnswers.length === correctAnswerIds.length &&
        userAnswers.every(id => correctAnswerIds.includes(id));

      if (isCorrect) {
        correctAnswers++;
      }
    });

    return totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  };

  const handleSubmit = async () => {
    if (!test || !canSubmitTest()) return;

    try {
      const score = Math.round(calculateScore());
      const correct = test.questions.reduce((acc, question) => {
        const userAnswers = answers[question.id] || [];
        if (!test.isStrict && userAnswers.length === 0) return acc;
        
        const correctAnswerIds = question.answers
          .filter(answer => answer.isCorrect)
          .map(answer => answer.id);

        return acc + (
          userAnswers.length === correctAnswerIds.length &&
          userAnswers.every(id => correctAnswerIds.includes(id))
            ? 1 : 0
        );
      }, 0);
      
      const results = {
        testId: id,
        score: score,
        result: {
          answers: test.questions.map(question => ({
            question: question.text,
            selectedAnswers: (answers[question.id] || []).map(answerId => {
              const answer = question.answers.find(a => a.id === answerId);
              return {
                answer: answer.text,
                isCorrect: answer.isCorrect
              };
            })
          }))
        },
        refreshToken: localStorage.getItem('refreshToken')
      };

      await submitTestResults(results);
      setFinalScore(score);
      setCorrectAnswersCount(correct);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting test:', error);
      setError('Ошибка при отправке результатов теста');
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setShowResults(false);
    setFinalScore(null);
    setCorrectAnswersCount(0);
  };

  return (
    <div className="min-h-screen bg-beige-100">
      <Header />
      <div className="pt-32 px-8">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-center text-gray-600">Загрузка теста...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-center text-red-600">{error}</p>
            </div>
          ) : test && !showResults ? (
            <>
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <div className="flex gap-8">
                  <div className="w-64 h-64 flex-shrink-0">
                    {test.image ? (
                      <img
                        src={test.image}
                        alt={test.title}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-test-image.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-4">{test.title}</h1>
                    {test.description && (
                      <p className="text-gray-600 mb-4">{test.description}</p>
                    )}
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Автор: {test.authorName}</p>
                      <p>Дата создания: {format(new Date(test.createdAt), 'dd.MM.yyyy')}</p>
                      <p>Режим теста: {test.isStrict ? 'Строгий' : 'Не строгий'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {test.questions.map((question, index) => (
                  <div key={question.id} className="bg-white rounded-lg shadow-lg p-8">
                    <h3 className="text-xl font-semibold mb-4">
                      {index + 1}. {question.text}
                    </h3>
                    <div className="space-y-2">
                      {question.answers.map(answer => (
                        <label key={answer.id} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={(answers[question.id] || []).includes(answer.id)}
                            onChange={(e) => handleAnswerChange(question.id, answer.id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                          <span className="text-gray-700">{answer.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 mb-8 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmitTest()}
                  className={`px-6 py-3 rounded-lg ${
                    canSubmitTest()
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Завершить тест
                </button>
              </div>
            </>
          ) : test && showResults ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Результаты теста</h2>
              
              <div className="flex justify-center mb-8">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200 stroke-current"
                      strokeWidth="10"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-blue-600 stroke-current"
                      strokeWidth="10"
                      strokeLinecap="round"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                      style={{
                        strokeDasharray: `${2 * Math.PI * 45}`,
                        strokeDashoffset: `${2 * Math.PI * 45 * (1 - finalScore / 100)}`,
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%'
                      }}
                    />
                    <text
                      x="50"
                      y="50"
                      className="text-2xl font-bold"
                      textAnchor="middle"
                      dy=".3em"
                      fill="currentColor"
                    >
                      {finalScore}%
                    </text>
                  </svg>
                </div>
              </div>

              <p className="text-center text-lg mb-8">
                Правильных ответов: {correctAnswersCount} из{' '}
                {test.isStrict ? test.questions.length : 
                  test.questions.filter(q => (answers[q.id] || []).length > 0).length}
              </p>

              <div className="flex justify-center">
                <button
                  onClick={handleRetry}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
                >
                  Пройти заново
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}