import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Header } from './Header';

export function CreateTestPage() {
    const [testData, setTestData] = useState({
      title: '',
      description: '',
      image: null,
      isStrict: null,
      isPrivate: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
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
            image: imageData
          };
  
          localStorage.setItem('testData', JSON.stringify(dataToSave));
          navigate('/create-questions');
        } catch (error) {
          setError('Ошибка при обработке изображения');
        }
      }
    };
  
    return (
      <div className="min-h-screen bg-beige-100">
        <Header />
        <div className="pt-20 px-4">
          {error && <ErrorNotification message={error} />}
          <div className="p-4 w-full max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-12">Создание теста</h2>
            
            <div className="bg-white p-8 rounded-lg shadow-md space-y-8">
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
      </div>
    );
  }