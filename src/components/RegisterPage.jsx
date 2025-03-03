import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth';
import { ErrorNotification } from './ErrorNotification';
import { useAuth } from './AuthProvider';

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
      login(); // Устанавливаем состояние авторизации
      navigate('/home');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-beige-100 text-black">
      <div className="border p-8 shadow-lg rounded-md w-96 bg-white">
        <h2 className="text-2xl font-bold mb-6">Регистрация</h2>
        {error && <ErrorNotification message={error} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="text"
              name="name"
              value={userData.name}
              onChange={handleInputChange}
              placeholder="Имя"
              className="border p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input 
              type="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              placeholder="Почта"
              className="border p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input 
              type="password"
              name="password"
              value={userData.password}
              onChange={handleInputChange}
              placeholder="Пароль"
              className="border p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  );
}