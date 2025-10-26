import { useEffect, useState, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import { TeamProvider } from './contexts/TeamContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Notifications from './components/Notifications'
import { NotificationProvider } from './contexts/NotificationContext'
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
const AcceptInvite = lazy(() => import('./pages/AcceptInvite'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
// add combined page
const UsersTeams = lazy(() => import('./pages/UsersTeams'))
// audit page
const CameraControl = lazy(() => import('./pages/CameraControl'))
const CameraFormatAudit = lazy(() => import('./pages/CameraFormatAudit'))
const LensAudit = lazy(() => import('./pages/LensAudit'))
const LdsLenses = lazy(() => import('./pages/LdsLenses'))
// editor pages
const LensEditor = lazy(() => import('./pages/LensEditor'))
const CameraSensorEditor = lazy(() => import('./pages/CameraSensorEditor'))
// Tools docs
const ToolsDocs = lazy(() => import('./pages/ToolsDocs'));
// Beta tools
const ColorWorkflows = lazy(() => import('./pages/ColorWorkflows'));
import './App.css'
import './styles/global.css'
import { runDailySnapshotIfDue } from './utils/versioningManager'
import { runCloudAutoSyncOnce } from './utils/cloudSyncManager'

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

  // Auto Cloud Sync Scheduler: prüft periodisch und bei App‑Resume
  useEffect(() => {
    const tick = () => {
      try { runCloudAutoSyncOnce(); } catch {}
    };
    tick();
    const interval = setInterval(tick, 5 * 60 * 1000); // alle 5 Minuten prüfen
    const onResume = () => tick();
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
        <NotificationProvider>
        <Router>
          <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <Notifications />
            <main className="main-content">
              <ErrorBoundary>
                <Suspense fallback={<div className="route-loading">Lädt…</div>}>
                  <Routes>
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/verify-email/:token" element={<VerifyEmail />} />
                    <Route path="/accept-invite" element={<AcceptInvite />} />
                    <Route path="/quickstart" element={<ProtectedRoute><Quickstart /></ProtectedRoute>} />
                    <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
                    <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
                    <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
                    <Route path="/users-teams" element={<ProtectedRoute><UsersTeams /></ProtectedRoute>} />
                    <Route path="/shots" element={<ProtectedRoute><ShotList /></ProtectedRoute>} />
                    <Route path="/shots/:id" element={<ProtectedRoute><ShotDetails /></ProtectedRoute>} />
                    <Route path="/camera" element={<ProtectedRoute><CameraSettings /></ProtectedRoute>} />
                    <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
                    <Route path="/sensor-preview" element={<ProtectedRoute><SensorPreview /></ProtectedRoute>} />
                    <Route path="/fov-calculator" element={<ProtectedRoute><FovCalculator /></ProtectedRoute>} />
                    <Route path="/lens-mapper" element={<ProtectedRoute><LensMapper /></ProtectedRoute>} />
                    <Route path="/lighting-tools" element={<ProtectedRoute><LightingTools /></ProtectedRoute>} />
                    <Route path="/flicker-controll" element={<ProtectedRoute><FlickerControll /></ProtectedRoute>} />

                    <Route path="/camera-format-audit" element={<ProtectedRoute><CameraFormatAudit /></ProtectedRoute>} />
                    <Route path="/lens-audit" element={<ProtectedRoute><LensAudit /></ProtectedRoute>} />
                    <Route path="/lds-lenses" element={<ProtectedRoute><LdsLenses /></ProtectedRoute>} />

                    <Route path="/lens-editor" element={<ProtectedRoute><LensEditor /></ProtectedRoute>} />
                    <Route path="/camera-sensor-editor" element={<ProtectedRoute><CameraSensorEditor /></ProtectedRoute>} />
                    <Route path="/tools-docs" element={<ProtectedRoute><ToolsDocs /></ProtectedRoute>} />
                    <Route path="/camera-control" element={<ProtectedRoute><CameraControl /></ProtectedRoute>} />
                    <Route path="/color-workflows" element={<ProtectedRoute><ColorWorkflows /></ProtectedRoute>} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>
          </div>
        </Router>
        </NotificationProvider>
        </TeamProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App