import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { useContext } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

// Componente para proteger rotas privadas
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { signed } = useContext(AuthContext);
  return signed ? children : <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Rota Protegida (Dashboard) */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />

          
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;