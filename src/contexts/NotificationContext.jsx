import { createContext, useContext, useCallback, useState, useMemo, useEffect } from 'react'

const NotificationContext = createContext({
  notifications: [],
  notify: () => {},
  dismiss: () => {},
})

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const dismiss = useCallback((id) => {
    setNotifications((list) => list.filter((n) => n.id !== id))
  }, [])

  const notify = useCallback((opts) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`
    const n = {
      id,
      type: opts?.type || 'error',
      message: opts?.message || 'Fehler',
      detail: opts?.detail || '',
      timeoutMs: typeof opts?.timeoutMs === 'number' ? opts.timeoutMs : 6000,
    }
    setNotifications((list) => [n, ...list].slice(0, 5))
    if (n.timeoutMs && n.timeoutMs > 0) {
      setTimeout(() => dismiss(id), n.timeoutMs)
    }
    return id
  }, [dismiss])

  const value = useMemo(() => ({ notifications, notify, dismiss }), [notifications, notify, dismiss])
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  return useContext(NotificationContext)
}

export function useNotify() {
  const { notify } = useNotifications()
  const notifyError = useCallback((message, detail='') => notify({ type: 'error', message, detail }), [notify])
  const notifyInfo = useCallback((message, detail='') => notify({ type: 'info', message, detail, timeoutMs: 4000 }), [notify])
  return { notify, notifyError, notifyInfo }
}