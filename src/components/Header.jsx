import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { TokenService } from '../services/tokenService';
import { useState, useEffect, useRef } from 'react';

export function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [showPrivateInput, setShowPrivateInput] = useState(false);
  const [privateLink, setPrivateLink] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPrivateInput(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    TokenService.clearAllTokens();
    logout();
    navigate('/home', { replace: true });
  };

  const handlePrivateTest = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (privateLink.trim()) {
      const testCode = privateLink.trim();
      console.log('Redirecting to:', `/test/${testCode}`);
      navigate(`/test/${testCode}`);
      setPrivateLink('');
      setShowPrivateInput(false);
    }
  };

  return (
    <header className="fixed w-full top-0 left-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link 
            to="/home" 
            className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
          >
            Quizzer
          </Link>
          <nav className="flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/create" 
                  className="text-gray-900 hover:text-gray-600 transition-colors"
                >
                  Создать тест
                </Link>
                <Link 
                  to="/tests" 
                  className="text-gray-900 hover:text-gray-600 transition-colors"
                >
                  Все тесты
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPrivateInput(!showPrivateInput);
                    }}
                    className="text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    Закрытый тест
                  </button>
                  
                  {showPrivateInput && (
                    <div 
                      className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg p-4 min-w-[300px]"
                    >
                      <form 
                        onSubmit={handlePrivateTest}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={privateLink}
                          onChange={(e) => setPrivateLink(e.target.value)}
                          placeholder="Вставьте код теста"
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                        >
                          Перейти
                        </button>
                      </form>
                    </div>
                  )}
                </div>
                <Link 
                  to="/profile"
                  className="text-gray-900 hover:text-gray-600 transition-colors"
                >
                  Личный кабинет
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-900 hover:text-gray-600 transition-colors"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition"
                >
                  Войти
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
