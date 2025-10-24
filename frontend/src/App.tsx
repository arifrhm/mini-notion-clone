import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { NotesList } from './pages/NotesList';
import { NoteEditor } from './pages/NoteEditor';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/notes" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <NotesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes/:id"
            element={
              <ProtectedRoute>
                <NoteEditor />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
