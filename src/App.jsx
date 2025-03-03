import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './index.css';
import { createTest } from './services/api';
import { ConfirmModal } from './components/ConfirmModal';
import { ErrorNotification } from './components/ErrorNotification';
import { ProtectedRoute } from './components/ProtectedRoute';
import { login as loginApi } from './services/auth';
import { isAuthenticated } from './services/auth';
import { TokenService } from './services/tokenService';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { RegisterPage } from './components/RegisterPage';
import { TestPage } from './components/TestPage';
import { Header } from './components/Header';

export function WelcomePage() {
  const navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => navigate('/home'), 3000);
  }, [navigate]);
  return <div className="flex justify-center items-center h-screen text-2xl bg-beige-100 text-black">Добро пожаловать в сервис по созданию тестов</div>;
}



function HomePage() {
  return (
    <div className="bg-beige-100 text-black min-h-screen pt-32 px-8">
      <Header />
      <div className="p-4 w-full max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-8">Популярные тесты</h2>
        <div className="flex flex-col gap-6">
          {[1, 2, 3].map((id) => (
            <div key={id} className="border p-6 rounded shadow w-full flex flex-row">
              <img 
                src="https://www.laser-bulat.ru/upload/medialibrary/735/2lj6sel8ygv8p6j2xj85gplt9ufd5xpn.png" 
                alt="Placeholder" 
                className="w-48 h-40 object-cover rounded"
              />
              <div className="flex flex-col justify-between flex-grow ml-6">
                <div>
                  <h3 className="text-xl font-semibold">Тест {id}</h3>
                  <p className="mt-2">Описание теста...</p>
                </div>
                <div className="flex justify-end">
                  <button className="border border-black text-black px-6 py-3 rounded bg-transparent hover:bg-black hover:text-white transition">
                    Пройти
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Пагинация */}
        <div className="flex justify-center items-center gap-2 mt-12 mb-8">
          <button className="px-4 py-2 border rounded hover:bg-gray-100 transition">
            ←
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button 
              key={page}
              className={`px-4 py-2 rounded transition ${
                page === 1 
                  ? 'bg-blue-500 text-white' 
                  : 'border hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          <button className="px-4 py-2 border rounded hover:bg-gray-100 transition">
            →
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Получаем путь, с которого пришли
  const from = location.state?.from?.pathname || "/home";

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await loginApi(credentials); // Rename the imported login function to loginApi
      login(); // Call the context's login function
      navigate(from, { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-beige-100 text-black">
      <div className="border p-8 shadow-lg rounded-md w-96 bg-white">
        <h2 className="text-2xl font-bold mb-6">Вход</h2>
        {error && <ErrorNotification message={error} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="text"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              placeholder="Почта"
              className="border p-2 w-full mb-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input 
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              placeholder="Пароль"
              className="border p-2 w-full mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 w-full rounded-md hover:bg-blue-600 transition flex justify-center items-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              'Войти'
            )}
          </button>
        </form>
        <div className="mt-4 flex justify-between text-sm text-blue-500">
          <Link to="/register" className="hover:underline">Регистрация</Link>
          <a href="/forgot" className="hover:underline">Забыли пароль?</a>
        </div>
      </div>
    </div>
  );
}

function CreateTestPage() {
  const [testData, setTestData] = useState({
    title: '',
    description: '', // новое поле
    image: null, // новое поле
    isStrict: null,
    isPrivate: null,
  });
  const [imagePreview, setImagePreview] = useState(null); // для предпросмотра изображения
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image') {
      const file = files[0];
      if (file) {
        // Проверка размера файла (например, не более 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Размер файла не должен превышать 5MB');
          return;
        }
        
        // Проверка типа файла
        if (!file.type.startsWith('image/')) {
          setError('Пожалуйста, загрузите изображение');
          return;
        }

        // Создаем URL для предпросмотра
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setTestData(prev => ({ ...prev, image: file }));
      }
    } else {
      setTestData(prev => ({
        ...prev,
        title: name === 'title' ? value : prev.title,
        description: name === 'description' ? value : prev.description,
        isStrict: name === 'answerMode' ? value === 'strict' : prev.isStrict,
        isPrivate: name === 'testType' ? value === 'private' : prev.isPrivate
      }));
    }
  };

  const validateForm = () => {
    if (!testData.title || testData.isStrict === null || testData.isPrivate === null) {
      setError('Пожалуйста, заполните обязательные поля');
      return false;
    }
    return true;
  };

  // Очистка URL предпросмотра при размонтировании
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve({
          name: file.name,
          type: file.type,
          data: base64String
        });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleNext = async () => {
    if (validateForm()) {
      try {
        let imageData = null;
        if (testData.image) {
          imageData = await convertImageToBase64(testData.image);
        }

        const dataToSave = {
          ...testData,
          image: imageData // Заменяем File объект на структуру с base64
        };

        localStorage.setItem('testData', JSON.stringify(dataToSave));
        navigate('/create-questions');
      } catch (error) {
        setError('Ошибка при обработке изображения');
      }
    }
  };

  return (
    <div className="bg-beige-100 text-black min-h-screen pt-32 px-8">
      <Header />
      {error && <ErrorNotification message={error} />}
      <div className="p-4 w-full max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold mb-12">Создание теста</h2>
        
        <div className="bg-white p-8 rounded-lg shadow-md space-y-8">
          {/* Название теста */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Название теста *</h3>
            <input
              type="text"
              name="title"
              value={testData.title}
              onChange={handleInputChange}
              placeholder="Введите название теста"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Описание теста */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Описание теста</h3>
            <textarea
              name="description"
              value={testData.description}
              onChange={handleInputChange}
              placeholder="Введите описание теста"
              rows="4"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Загрузка изображения */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Изображение теста</h3>
            <div className="space-y-4">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition"
              >
                <div className="space-y-2">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="text-gray-600">
                    Нажмите для загрузки или перетащите файл
                  </div>
                  <div className="text-sm text-gray-500">
                    PNG, JPG, GIF до 5MB
                  </div>
                </div>
              </label>
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Режим ответов на вопросы</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="answerMode"
                  value="strict"
                  checked={testData.isStrict === true}
                  onChange={handleInputChange}
                  className="form-radio h-5 w-5 text-blue-500"
                />
                <span className="text-gray-700">Строгий режим</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="answerMode"
                  value="loose"
                  checked={testData.isStrict === false}
                  onChange={handleInputChange}
                  className="form-radio h-5 w-5 text-blue-500"
                />
                <span className="text-gray-700">Нестрогий режим</span>
              </label>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Тип теста</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="testType"
                  value="public"
                  checked={testData.isPrivate === false}
                  onChange={handleInputChange}
                  className="form-radio h-5 w-5 text-blue-500"
                />
                <span className="text-gray-700">Открытый тест</span>
              </label>
              <p className="text-sm text-gray-500 ml-8">
                Тест будет доступен всем пользователям
              </p>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="testType"
                  value="private"
                  checked={testData.isPrivate === true}
                  onChange={handleInputChange}
                  className="form-radio h-5 w-5 text-blue-500"
                />
                <span className="text-gray-700">Закрытый тест</span>
              </label>
              <p className="text-sm text-gray-500 ml-8">
                Тест будет доступен только по специальной ссылке
              </p>
            </div>
          </div>

          {error && <ErrorMessage message={error} />}
          
          <div className="flex justify-end">
            <button 
              onClick={handleNext}
              className="bg-blue-500 text-white px-8 py-3 rounded hover:bg-blue-600 transition"
            >
              Далее
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateQuestionPage() {
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
        description: testData.description || '', // Добавляем описание
        image: testData.image, // Добавляем изображение в формате { name, type, data }
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
    <div className="bg-beige-100 text-black min-h-screen pt-32 px-8">
      <Header />
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
  );
}

// Добавьте этот компонент для отображения ошибок
function ErrorMessage({ message }) {
  return (
    <div className="text-red-500 text-sm mt-1">{message}</div>
  );
}

function QuestionForm({ onSave, questionNumber, isLast }) {
  const [answers, setAnswers] = useState(['', '']); // начальные два пустых ответа
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <CreateTestPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-questions" 
            element={
              <ProtectedRoute>
                <CreateQuestionPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/test/:testId" element={<TestPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
