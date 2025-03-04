import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getAllTests } from '../services/api';
import { Header } from './Header';

export function AllTestsPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    testName: '',
    authorName: '',
    createdFrom: '',
    createdTo: '',
    isStrict: null, 
  });
  const [allTests, setAllTests] = useState([]);
  const [displayedTests, setDisplayedTests] = useState([]);
  const testsPerPage = 5;

  useEffect(() => {
    fetchTests(1, filters);
  }, []); 

  const fetchTests = async (page, filters) => {
    setIsLoading(true);
    try {
      const data = await getAllTests(filters, page);
      setAllTests(data.tests);
      setTotalPages(Math.ceil(data.tests.length / testsPerPage));
      updateDisplayedTests(data.tests, 1);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDisplayedTests = (tests, page) => {
    const startIndex = (page - 1) * testsPerPage;
    const endIndex = startIndex + testsPerPage;
    setDisplayedTests(tests.slice(startIndex, endIndex));
  };

  useEffect(() => {
    updateDisplayedTests(allTests, currentPage);
  }, [currentPage, allTests]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const formattedFilters = {
      ...filters,
      createdFrom: filters.createdFrom ? new Date(filters.createdFrom).toISOString() : null,
      createdTo: filters.createdTo ? new Date(filters.createdTo).toISOString() : null,
    };
    setCurrentPage(1);
    fetchTests(1, formattedFilters);
  };

  return (
    <div className="min-h-screen bg-beige-100">
      <Header />
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex gap-8">
            <div className="w-80 bg-white p-6 rounded-lg shadow-lg h-fit">
              <h2 className="text-xl font-semibold mb-4">Фильтры</h2>
              <form onSubmit={handleFilterSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Название теста</label>
                  <input
                    type="text"
                    value={filters.testName}
                    onChange={(e) => setFilters(prev => ({ ...prev, testName: e.target.value }))}
                    className="mt-1 w-full border rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Имя автора</label>
                  <input
                    type="text"
                    value={filters.authorName}
                    onChange={(e) => setFilters(prev => ({ ...prev, authorName: e.target.value }))}
                    className="mt-1 w-full border rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Дата создания От</label>
                  <input
                    type="date"
                    value={filters.createdFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, createdFrom: e.target.value }))}
                    className="mt-1 w-full border rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Дата создания До</label>
                  <input
                    type="date"
                    value={filters.createdTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, createdTo: e.target.value }))}
                    className="mt-1 w-full border rounded-md p-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Режим теста</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="strict-true"
                        name="isStrict"
                        checked={filters.isStrict === true}
                        onChange={() => setFilters(prev => ({ ...prev, isStrict: true }))}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="strict-true" className="ml-2 text-sm text-gray-700">
                        Строгий режим
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="strict-false"
                        name="isStrict"
                        checked={filters.isStrict === false}
                        onChange={() => setFilters(prev => ({ ...prev, isStrict: false }))}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="strict-false" className="ml-2 text-sm text-gray-700">
                        Не строгий режим
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="strict-any"
                        name="isStrict"
                        checked={filters.isStrict === null}
                        onChange={() => setFilters(prev => ({ ...prev, isStrict: null }))}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="strict-any" className="ml-2 text-sm text-gray-700">
                        Любой
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                >
                  Применить
                </button>
              </form>
            </div>

            <div className="flex-1">
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <>
                  <div className="space-y-4">
                    {displayedTests.map((test) => (
                      <div key={test.id} className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex gap-6">
                          <div className="w-48 h-48 flex-shrink-0">
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
                                <svg 
                                  className="w-12 h-12 text-gray-400" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                  />
                                </svg>
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="text-sm text-gray-600 space-y-2">
                              <h3 className="text-xl font-semibold mb-2 text-gray-800">{test.title}</h3>
                              <p>Автор: {test.authorName}</p>
                              <p>Дата создания: {format(new Date(test.createdAt), 'dd.MM.yyyy')}</p>
                              <p>Строгий режим: {test.isStrict ? 'Да' : 'Нет'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() => navigate(`/test/${test.id}`)}
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                          >
                            Перейти к тесту
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-center items-center gap-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-white text-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      Назад
                    </button>
                    
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded ${
                            currentPage === page
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-blue-500 hover:bg-blue-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded ${
                        currentPage === totalPages
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-white text-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      Вперед
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}