import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createTest } from './../services/api';
import { ConfirmModal } from './ConfirmModal';
import { Header } from './Header';

export function CreateQuestionPage() {
  const [questions, setQuestions] = useState([{ id: 1 }]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const addQuestion = () => {
    if (questions.some(q => !q.isSaved)) {
      setError('Пожалуйста, сохраните все вопросы перед добавлением нового');
      return;
    }
    const newId = questions.length + 1;
    setQuestions([...questions, { id: newId }]);
    setError('');
  };

  const handleSaveQuestion = (questionData, index) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...questionData };
    setQuestions(newQuestions);
    setError('');
  };

  const handleFinish = () => {
    if (questions.some(q => !q.isSaved)) {
      setError('Пожалуйста, сохраните все вопросы перед завершением');
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsLoading(true);
    try {
      const testData = JSON.parse(localStorage.getItem('testData'));
      const finalTestData = {
        title: testData.title,
        description: testData.description || '',
        image: testData.image,
        isStrict: testData.isStrict,
        isPrivate: testData.isPrivate,
        questions: questions.map(q => ({
          title: q.question,
          answers: q.answers.map((answer, index) => ({
            text: answer,
            isCorrect: q.correctAnswers.includes(index)
          }))
        }))
      };

      await createTest(finalTestData);
      localStorage.removeItem('testData');
      navigate('/home');
    } catch (error) {
      setError(error.message || 'Ошибка при создании теста');
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige-100">
      <Header />
      <div className="pt-20 px-4">
        {error && <ErrorNotification message={error} />}
        <div className="p-4 w-full max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Создание вопросов</h2>
          
          <div className="space-y-4">
            {questions.map((question, index) => (
              <QuestionForm
                key={question.id}
                questionNumber={index + 1}
                onSave={(data) => handleSaveQuestion(data, index)}
                isLast={index === questions.length - 1}
              />
            ))}
            
            {error && <ErrorMessage message={error} />}

            <button
              onClick={addQuestion}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition"
            >
              + Добавить вопрос
            </button>
            
            <div className="flex justify-end mt-8">
              <button 
                onClick={handleFinish}
                className="bg-green-500 text-white px-8 py-3 rounded hover:bg-green-600 transition"
              >
                Завершить
              </button>
            </div>
          </div>
        </div>
        <ConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmSave}
          loading={isLoading}
        />
        
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorMessage({ message }) {
    return (
      <div className="text-red-500 text-sm mt-1">{message}</div>
    );
  }

  function QuestionForm({ onSave, questionNumber, isLast }) {
    const [answers, setAnswers] = useState(['', '']);
    const [correctAnswers, setCorrectAnswers] = useState(new Set());
    const [question, setQuestion] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [error, setError] = useState('');
  
    const addAnswer = () => {
      setAnswers([...answers, '']);
    };
  
    const handleAnswerChange = (index, value) => {
      const newAnswers = [...answers];
      newAnswers[index] = value;
      setAnswers(newAnswers);
    };
  
    const toggleCorrectAnswer = (index) => {
      const newCorrectAnswers = new Set(correctAnswers);
      if (newCorrectAnswers.has(index)) {
        newCorrectAnswers.delete(index);
      } else {
        newCorrectAnswers.add(index);
      }
      setCorrectAnswers(newCorrectAnswers);
    };
  
    const validate = () => {
      if (!question.trim()) {
        setError('Необходимо заполнить название вопроса');
        return false;
      }
  
      if (answers.some(answer => !answer.trim())) {
        setError('Все варианты ответов должны быть заполнены');
        return false;
      }
  
      if (correctAnswers.size === 0) {
        setError('Необходимо выбрать хотя бы один правильный ответ');
        return false;
      }
  
      setError('');
      return true;
    };
  
    const handleSave = () => {
      if (validate()) {
        onSave({ 
          question, 
          answers, 
          correctAnswers: Array.from(correctAnswers),
          isSaved: true 
        });
        setIsCollapsed(true);
      }
    };
  
    if (isCollapsed) {
      return (
        <div className="mb-4">
          <div 
            className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-50"
            onClick={() => setIsCollapsed(false)}
          >
            <h3 className="font-semibold">Вопрос {questionNumber}: {question}</h3>
          </div>
        </div>
      );
    }
  
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-4">
        <h3 className="text-xl font-semibold mb-4">Вопрос {questionNumber}</h3>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Название вопроса</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите вопрос"
          />
        </div>
  
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Варианты ответа</label>
          {answers.map((answer, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className="flex-grow p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                placeholder={`Вариант ответа ${index + 1}`}
              />
              <button
                onClick={() => toggleCorrectAnswer(index)}
                className={`ml-2 p-2 rounded-full transition-colors ${
                  correctAnswers.has(index)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                ✓
              </button>
            </div>
          ))}
          <button
            onClick={addAnswer}
            className="mt-2 text-blue-500 hover:text-blue-600"
          >
            + Добавить вариант ответа
          </button>
        </div>
  
        {error && <ErrorMessage message={error} />}
  
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
          >
            Сохранить вопрос
          </button>
        </div>
      </div>
    );
  }