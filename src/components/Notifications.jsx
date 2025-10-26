import { useNotifications } from '../contexts/NotificationContext'

export default function Notifications() {
  const { notifications, dismiss } = useNotifications()
  if (!notifications || notifications.length === 0) return null
  return (
    <div className="notifications-container" aria-live="polite" aria-atomic="true">
      {notifications.map((n) => (
        <div key={n.id} className={`notification ${n.type}`} role={n.type === 'error' ? 'alert' : 'status'}>
          <div className="notification-content">
            <strong className="notification-title">{n.type === 'error' ? 'Fehler' : 'Hinweis'}</strong>
            <div className="notification-message">{n.message}</div>
            {n.detail ? <pre className="notification-detail">{n.detail}</pre> : null}
          </div>
          <button className="notification-close" onClick={() => dismiss(n.id)} aria-label="Schließen">×</button>
        </div>
      ))}
    </div>
  )
}