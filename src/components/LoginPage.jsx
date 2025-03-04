import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import { Header } from './Header';
import { login as loginApi } from './../services/auth';
import { useAuth } from './AuthProvider';

export function LoginPage() {
    const { login } = useAuth();
    const [credentials, setCredentials] = useState({
      email: '',
      password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    const from = location.state?.from?.pathname || "/home";
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');
  
      try {
        await loginApi(credentials);
        login();
        navigate(from, { replace: true });
      } catch (error) {
        if (error === 401) {
          setError('Неверный email или пароль');
        } else if (error === 404) {
          setError('Пользователь не найден');
        } else if (error === 400) {
          setError('Пожалуйста, заполните все поля');
        } else if (!navigator.onLine) {
          setError('Отсутствует подключение к интернету');
        } else {
          setError(error.message || 'Произошла ошибка при входе');
        }
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="min-h-screen bg-beige-100">
        <Header />
        <div className="pt-20 px-4">
          <div className="pt-32 flex justify-center items-center">
            <div className="border p-8 shadow-lg rounded-md w-96 bg-white">
              <h2 className="text-2xl font-bold mb-6">Вход</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
  
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input 
                    type="text"
                    name="email"
                    value={credentials.email}
                    onChange={(e) => {
                      setCredentials(prev => ({ ...prev, email: e.target.value }));
                      setError('');
                    }}
                    placeholder="Почта"
                    className={`border p-2 w-full mb-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      error ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <input 
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={(e) => {
                      setCredentials(prev => ({ ...prev, password: e.target.value }));
                      setError('');
                    }}
                    placeholder="Пароль"
                    className={`border p-2 w-full mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      error ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2 px-4 rounded-md transition-colors duration-200 ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {isLoading ? (
                    <div className="flex justify-center items-center">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    </div>
                  ) : 'Войти'}
                </button>
              </form>
              <div className="mt-4">
                <Link 
                  to="/register" 
                  className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
                >
                  Регистрация
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }