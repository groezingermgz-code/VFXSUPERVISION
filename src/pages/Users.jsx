import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';

const Users = () => {
  const { t } = useLanguage();
  const { users, addUser, deleteUser } = useAuth();
  const [name, setName] = useState('');

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addUser(name.trim());
    setName('');
  };

  return (
    <div className="page users-page">
      <div className="header">
        <div className="header-content">
          <h1>{t('users.title', 'Benutzerverzeichnis')}</h1>
          <p className="subtitle">{t('users.description', 'Lege Nutzer an, die Shots erstellen können.')}</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <form onSubmit={handleAddUser}>
          <div className="form-group" style={{ width: '100%' }}>
            <label>{t('users.nameLabel', 'Name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('users.namePlaceholder', 'z.B. Max Mustermann')}
            />
          </div>
          <div className="form-row" style={{ gap: 8, marginTop: 12 }}>
            <button type="submit" className="btn-primary">{t('users.addUserButton', 'Nutzer hinzufügen')}</button>
          </div>
        </form>
      </div>

      <div className="card" style={{ maxWidth: 720, margin: '16px auto' }}>
        <h2>{t('users.listTitle', 'Nutzer')}</h2>
        {users.length === 0 ? (
          <p style={{ opacity: 0.8 }}>{t('users.empty', 'Noch keine Nutzer')}</p>
        ) : (
          <div className="users-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
            {users.map(u => (
              <div key={u.id} className="user-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="notes" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ opacity: 0.7, fontSize: 12 }}>{t('users.userId', 'ID')}: {u.id}</div>
                  </div>
                </div>
                <button className="btn-danger btn-small" onClick={() => deleteUser(u.id)} title={t('users.delete', 'Löschen')}>
                  <Icon name="trash" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;