import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import ShotList from './pages/ShotList'
import ShotDetails from './pages/ShotDetails'
import CameraSettings from './pages/CameraSettings'
import Notes from './pages/Notes'
import Settings from './pages/Settings'
import './App.css'
import './styles/global.css'
import { runDailySnapshotIfDue } from './utils/versioningManager'

function App() {
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Täglicher Snapshot Scheduler: prüft beim Start und periodisch
  useEffect(() => {
    const check = () => {
      try { runDailySnapshotIfDue(); } catch {}
    };
    check();
    const interval = setInterval(check, 15 * 60 * 1000); // alle 15 Minuten prüfen
    const onResume = () => check();
    window.addEventListener('visibilitychange', onResume);
    window.addEventListener('focus', onResume);
    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', onResume);
      window.removeEventListener('focus', onResume);
    };
  }, []);

  return (
    <LanguageProvider>
      <Router>
        <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
          <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/shots" element={<ShotList />} />
              <Route path="/shots/:id" element={<ShotDetails />} />
              <Route path="/camera" element={<CameraSettings />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/settings" element={<Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            </Routes>
          </main>
        </div>
      </Router>
    </LanguageProvider>
  )
}

export default App