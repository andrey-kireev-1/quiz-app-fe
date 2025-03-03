import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { TokenService } from '../services/tokenService';

export function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    TokenService.clearAllTokens();
    logout();
    navigate('/home', { replace: true });
  };

  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center p-6 bg-gray-100 shadow-md text-black text-2xl">
      <div className="font-bold">Quizzer</div>
      <nav className="flex gap-8 items-center">
        {isAuthenticated ? (
          <>
            <Link to="/create" className="hover:text-blue-600">Создать тест</Link>
            <Link to="/home" className="hover:text-blue-600">Все тесты</Link>
            <Link to="/private" className="hover:text-blue-600">Закрытый тест</Link>
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition"
            >
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/home" className="hover:text-blue-600">Все тесты</Link>
            <Link 
              to="/login" 
              className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition"
            >
              Войти
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
