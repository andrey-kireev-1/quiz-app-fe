import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getHomeTests, getTestsCount } from './../services/api';
import { Header } from './Header';
import { format } from 'date-fns';

export function HomePage() {
    const [tests, setTests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const TESTS_PER_PAGE = 5;
  
    useEffect(() => {
      const loadTests = async () => {
        try {
          setIsLoading(true);
          const [testsData, countData] = await Promise.all([
            getHomeTests(currentPage),
            getTestsCount()
          ]);
          
          setTests(testsData);
          setTotalPages(Math.ceil(countData / TESTS_PER_PAGE));
        } catch (error) {
          setError('Ошибка при загрузке тестов');
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
  
      loadTests();
    }, [currentPage]);
  
    const handlePageChange = (page) => {
      setCurrentPage(page);
      window.scrollTo(0, 0);
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
      <div className="min-h-screen bg-beige-100">
        <Header />
        <div className="pt-20 px-4">
          <div className="p-4 w-full max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold mb-8">Популярные тесты</h2>
            <div className="flex flex-col gap-6">
              {tests.map((test) => (
                <div key={test.id} className="border p-6 rounded shadow w-full flex flex-row">
                  <img 
                    src={test.image}
                    alt={test.title}
                    className="w-48 h-40 object-cover rounded"
                  />
                  <div className="flex flex-col justify-between flex-grow ml-6">
                    <div>
                      <h3 className="text-xl font-semibold">{test.title}</h3>
                      <p className="mt-2">{test.description}</p>
                      <div className="text-sm text-gray-600 mt-2">
                        <span>Автор: {test.authorName}</span>
                        <span className="mx-2">•</span>
                        <span>
                          Создан: {format(new Date(test.createdAt), 'dd.MM.yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Link
                        to={`/test/${test.id}`}
                        className="border border-black text-black px-6 py-3 rounded bg-transparent hover:bg-black hover:text-white transition"
                      >
                        Пройти
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 mb-8">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ←
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 rounded transition ${
                      currentPage === i + 1 
                        ? 'bg-blue-500 text-white' 
                        : 'border hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }