import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTeam } from '../contexts/TeamContext';
import Icon from '../components/Icon';

const UsersTeams = () => {
  const { t } = useLanguage();
  const { users, currentUser, login, logout, addUser, deleteUser } = useAuth();
  const { teams, addTeam, deleteTeam, renameTeam, addMember, removeMember } = useTeam();

  const [userName, setUserName] = useState('');
  const [teamName, setTeamName] = useState('');

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!userName.trim()) return;
    addUser(userName.trim());
    setUserName('');
  };

  const handleLoginExisting = (existingName) => {
    const name = (existingName || '').trim();
    if (!name) return;
    login(name);
  };

  const handleAddTeam = (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    addTeam(teamName.trim());
    setTeamName('');
  };

  const usersById = Object.fromEntries(users.map(u => [u.id, u]));
  const selectableUsers = currentUser ? users.filter(u => u.id !== currentUser.id) : users;

  return (
    <div className="page users-teams-page">
      <div className="header">
        <div className="header-content">
          <h1>{t('nav.usersTeams', 'Nutzer & Teams')}</h1>
          <p className="subtitle">{t('usersTeams.description', 'Lege Nutzer an und verwalte Teams & Mitglieder an einem Ort.')}</p>
        </div>
      </div>

      <div className="card" style={{ gridColumn: '1 / -1', background: 'rgba(52, 152, 219, 0.10)', borderLeft: '6px solid var(--primary-color)' }}>
        <p style={{ margin: 0 }}>
          {t('usersTeams.hint', 'Tipp: Lege zunächst Nutzer an, dann kannst du sie Teams hinzufügen.')}
        </p>
      </div>

      {/* Login-Bereich (ohne Freitext-Eingabe) */}
      <div className="card" style={{ maxWidth: 720, margin: '0 0 16px 0' }}>
        <h2 style={{ marginTop: 0 }}>{t('auth.loginTitle', 'Login')}</h2>
        <p style={{ opacity: 0.8, marginTop: 4 }}>
          {currentUser
            ? `${t('auth.currentUser', 'Angemeldet als')}: ${currentUser.name}`
            : t('auth.notLoggedIn', 'Nicht angemeldet')}
        </p>
        {currentUser && (
          <div className="form-row" style={{ gap: 8, marginTop: 8 }}>
            <button type="button" className="btn-secondary" onClick={() => logout()}>
              {t('auth.logoutButton', 'Abmelden')}
            </button>
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: '8px 0' }}>{t('auth.existingUsers', 'Vorhandene Nutzer')}</h3>
          {users.length === 0 ? (
            <p style={{ opacity: 0.8 }}>{t('auth.noUsersYet', 'Noch keine Nutzer angelegt')}</p>
          ) : (
            <div className="users-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
              {selectableUsers.map(u => (
                <button key={u.id} className="btn-secondary" onClick={() => handleLoginExisting(u.name)}>
                  {u.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        {/* Nutzerverwaltung */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ maxWidth: 520 }}>
            <form onSubmit={handleAddUser}>
              <div className="form-group" style={{ width: '100%' }}>
                <label>{t('users.nameLabel', 'Name')}</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={t('users.namePlaceholder', 'z.B. Max Mustermann')}
                />
              </div>
              <div className="form-row" style={{ gap: 8, marginTop: 12 }}>
                <button type="submit" className="btn-primary">{t('users.addUserButton', 'Nutzer hinzufügen')}</button>
              </div>
            </form>
          </div>

          <div className="card" style={{ maxWidth: 720 }}>
            <h2>{t('users.listTitle', 'Nutzer')}</h2>
            {users.length === 0 ? (
              <p style={{ opacity: 0.8 }}>{t('users.empty', 'Noch keine Nutzer')}</p>
            ) : (
              <div className="users-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                {users.map(u => (
                  <div key={u.id} className="user-card" style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon name="notes" />
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                    <button className="btn-danger btn-small" onClick={() => deleteUser(u.id)} title={t('common.delete', 'Löschen')}>
                      <Icon name="trash" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Teamverwaltung */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ maxWidth: 520 }}>
            <form onSubmit={handleAddTeam}>
              <div className="form-group" style={{ width: '100%' }}>
                <label>{t('teams.nameLabel', 'Teamname')}</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder={t('teams.namePlaceholder', 'z.B. Kameraunit A')}
                />
              </div>
              <div className="form-row" style={{ gap: 8, marginTop: 12 }}>
                <button type="submit" className="btn-primary">{t('teams.addTeamButton', 'Team hinzufügen')}</button>
              </div>
            </form>
          </div>

          <div className="card" style={{ maxWidth: 900 }}>
            <h2>{t('teams.listTitle', 'Teams')}</h2>
            {teams.length === 0 ? (
              <p style={{ opacity: 0.8 }}>{t('teams.empty', 'Noch keine Teams')}</p>
            ) : (
              <div className="teams-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                {teams.map(team => {
                  const memberObjs = team.memberIds.map(id => usersById[id]).filter(Boolean);
                  const availableUsers = users.filter(u => !team.memberIds.includes(u.id));
                  return (
                    <div key={team.id} className="team-card" style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Icon name="folder" />
                          <input
                            type="text"
                            defaultValue={team.name}
                            onBlur={(e) => renameTeam(team.id, e.target.value)}
                            style={{ fontWeight: 600 }}
                          />
                        </div>
                        <button className="btn-danger btn-small" onClick={() => deleteTeam(team.id)} title={t('teams.delete', 'Löschen')}>
                          <Icon name="trash" />
                        </button>
                      </div>

                      <div>
                        <div style={{ fontWeight: 600 }}>{t('teams.members', 'Mitglieder')}</div>
                        {memberObjs.length === 0 ? (
                          <div style={{ opacity: 0.7 }}>{t('teams.noMembers', 'Keine Mitglieder')}</div>
                        ) : (
                          <ul style={{ margin: 0, paddingLeft: 16 }}>
                            {memberObjs.map(m => (
                              <li key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                <span>{m.name}</span>
                                <button className="btn-secondary btn-small" onClick={() => removeMember(team.id, m.id)}>
                                  {t('teams.removeMember', 'Entfernen')}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <select onChange={(e) => { const uid = parseInt(e.target.value); if (uid) addMember(team.id, uid); e.target.value = ''; }}>
                          <option value="">{t('teams.addMemberPlaceholder', 'Mitglied hinzufügen…')}</option>
                          {availableUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTeams;