import { useEffect, useState, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import { TeamProvider } from './contexts/TeamContext'
import Navbar from './components/Navbar'
import SplashLogin from './components/SplashLogin'
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ShotList = lazy(() => import('./pages/ShotList'))
const ShotDetails = lazy(() => import('./pages/ShotDetails'))
const CameraSettings = lazy(() => import('./pages/CameraSettings'))
const Notes = lazy(() => import('./pages/Notes'))
const Settings = lazy(() => import('./pages/Settings'))
const SensorPreview = lazy(() => import('./pages/SensorPreview'))
const FovCalculator = lazy(() => import('./pages/FovCalculator'))
const LensMapper = lazy(() => import('./pages/LensMapper'))
const LightingTools = lazy(() => import('./pages/LightingTools'))
const FlickerControll = lazy(() => import('./pages/FlickerControll'))
const Login = lazy(() => import('./pages/Login'))
const Users = lazy(() => import('./pages/Users'))
const Teams = lazy(() => import('./pages/Teams'))
const Quickstart = lazy(() => import('./pages/Quickstart'))
const Feedback = lazy(() => import('./pages/Feedback'))
// add combined page
const UsersTeams = lazy(() => import('./pages/UsersTeams'))
// audit page
const CameraFormatAudit = lazy(() => import('./pages/CameraFormatAudit'))
const LensAudit = lazy(() => import('./pages/LensAudit'))
// editor pages
const LensEditor = lazy(() => import('./pages/LensEditor'))
const CameraSensorEditor = lazy(() => import('./pages/CameraSensorEditor'))
// Tools docs
const ToolsDocs = lazy(() => import('./pages/ToolsDocs'));
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
      <AuthProvider>
        <TeamProvider>
        <Router>
          <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            {/* Splash Login Modal (first visit) */}
            <SplashLogin />
            <main className="main-content">
              <Suspense fallback={<div className="route-loading">Lädt…</div>}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/quickstart" element={<Quickstart />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/teams" element={<Teams />} />
                  <Route path="/users-teams" element={<UsersTeams />} />
                  <Route path="/shots" element={<ShotList />} />
                  <Route path="/shots/:id" element={<ShotDetails />} />
                  <Route path="/camera" element={<CameraSettings />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/settings" element={<Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
                  <Route path="/sensor-preview" element={<SensorPreview />} />
                  <Route path="/fov-calculator" element={<FovCalculator />} />
                  <Route path="/lens-mapper" element={<LensMapper />} />
                  <Route path="/lighting-tools" element={<LightingTools />} />
                  <Route path="/flicker-controll" element={<FlickerControll />} />

                  <Route path="/camera-format-audit" element={<CameraFormatAudit />} />
                  <Route path="/lens-audit" element={<LensAudit />} />

                  <Route path="/lens-editor" element={<LensEditor />} />
                  <Route path="/camera-sensor-editor" element={<CameraSensorEditor />} />
                  <Route path="/tools-docs" element={<ToolsDocs />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </Router>
        </TeamProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App