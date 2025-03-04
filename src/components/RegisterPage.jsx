import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth';
import { ErrorNotification } from './ErrorNotification';
import { useAuth } from './AuthProvider';
import { Header } from './Header';

export function RegisterPage() {
  const { login } = useAuth();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userData.name || !userData.email || !userData.password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register(userData);
      login();
      navigate('/home');
    } catch (error) {
      switch (error) {
        case 400:
          setError('Некорректные данные. Проверьте введённую информацию');
          break;
        case 409:
          setError('Пользователь с такой почтой уже существует');
          break;
        case 422:
          setError('Неверный формат email или слишком короткий пароль');
          break;
        case 0:
          setError('Отсутствует подключение к интернету');
          break;
        case 500:
          setError('Ошибка сервера. Попробуйте позже');
          break;
        default:
          setError(error.message || 'Произошла ошибка при регистрации');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-beige-100 text-black min-h-screen">
      <Header />
      <div className="pt-32 flex justify-center items-center">
        <div className="border p-8 shadow-lg rounded-md w-96 bg-white">
          <h2 className="text-2xl font-bold mb-6">Регистрация</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input 
                type="text"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                placeholder="Имя"
                className={`border p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            <div>
              <input 
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                placeholder="Почта"
                className={`border p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            <div>
              <input 
                type="password"
                name="password"
                value={userData.password}
                onChange={handleInputChange}
                placeholder="Пароль"
                className={`border p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
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
                'Зарегистрироваться'
              )}
            </button>
          </form>
          <div className="mt-4 text-center">
            <a href="/login" className="text-sm text-blue-500 hover:underline">
              Уже есть аккаунт? Войти
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}