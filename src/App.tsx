import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Navigation/Header';
import { Home } from './pages/Home';
import { Quiz } from './pages/Quiz';
import { GameViewer } from './pages/GameViewer';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/game/:gameId" element={<GameViewer />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
