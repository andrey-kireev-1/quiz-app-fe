import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function WelcomePage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    setTimeout(() => navigate('/home'), 3000);
  }, [navigate]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-beige-100 text-black">
      <div className="text-2xl mb-4">
        Добро пожаловать в сервис по созданию тестов
      </div>
      <div className="text-4xl font-bold">
        QUIZZER
      </div>
    </div>
  );
}