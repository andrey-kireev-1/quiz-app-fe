import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './components/AuthProvider';
import { RegisterPage } from './components/RegisterPage';
import { TestPage } from './components/TestPage';
import { ProfilePage } from './components/ProfilePage';
import { AllTestsPage } from './components/AllTestsPage';
import { PageTransition } from './components/PageTransition';
import { WelcomePage } from './components/WelcomePage';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { CreateTestPage } from './components/CreateTestPage';
import { CreateQuestionPage } from './components/CreateQuestionPage';
import './index.css';


function App() {
  const location = useLocation();

  return (
      <AuthProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={ <PageTransition><WelcomePage /></PageTransition>} />
          <Route path="/login" element={ <PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={ <PageTransition><RegisterPage /></PageTransition>} />
          <Route path="/home" element={ <PageTransition><HomePage /></PageTransition>} />
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <PageTransition><CreateTestPage /></PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-questions" 
            element={
              <ProtectedRoute>
                <PageTransition><CreateQuestionPage /></PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/test/:id" 
            element={
              <ProtectedRoute>
                <PageTransition><TestPage /></PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <PageTransition><ProfilePage /></PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tests" 
            element={
              <ProtectedRoute>
                <PageTransition><AllTestsPage /></PageTransition>
              </ProtectedRoute>
            } 
          />
        </Routes>
        </AnimatePresence>
      </AuthProvider>
  );
}

export default App;
