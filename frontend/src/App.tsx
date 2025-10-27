import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, Login, Register } from '@modules/auth';
import { NotesList, NoteEditor } from '@modules/notes';
import './styles/global.css';
import './styles/auth.css';
import './styles/notes.css';
import './styles/editor.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
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
