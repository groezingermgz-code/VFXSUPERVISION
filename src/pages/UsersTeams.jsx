import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTeam } from '../contexts/TeamContext';
import Icon from '../components/Icon';

const UsersTeams = () => {
  const { t } = useLanguage();
  // const { users, currentUser, login, logout, addUser, deleteUser } = useAuth();
  const auth = useAuth();
  const currentUser = auth.currentUser;
  const logout = typeof auth.logout === 'function' ? auth.logout : () => {};
  const users = Array.isArray(auth.users) ? auth.users : [];
  const addUser = typeof auth.addUser === 'function' ? auth.addUser : () => {};
  const deleteUser = typeof auth.deleteUser === 'function' ? auth.deleteUser : () => {};
  const loginByName = (name) => {
    // In der neuen Auth wird per Email/Passwort eingeloggt; Name-Login deaktiviert
    return typeof auth.users !== 'undefined' && typeof auth.login === 'function' ? auth.login(name) : undefined;
  };
  const { teams, addTeam, deleteTeam, renameTeam, addMember, removeMember } = useTeam();

  const [userName, setUserName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    const name = inviteName.trim();
    const email = inviteEmail.trim().toLowerCase();
    if (!name || !/.+@.+\..+/.test(email)) return;
    try {
      const { link } = await auth.inviteUser({ name, email });
      setInviteLink(link);
    } catch (err) {
      alert(err.message || 'Einladung fehlgeschlagen');
    }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!userName.trim()) return;
    addUser(userName.trim());
    setUserName('');
  };

  const handleLoginExisting = (existingName) => {
    const name = (existingName || '').trim();
    if (!name) return;
    // login(name);
    loginByName(name);
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

      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card" style={{ background: 'rgba(52, 152, 219, 0.10)', borderLeft: '6px solid var(--primary-color)' }}>
          <p style={{ margin: 0 }}>
            {t('usersTeams.hint', 'Tipp: Lege zunächst Nutzer an, dann kannst du sie Teams hinzufügen.')}
          </p>
        </div>

        {/* Login-Bereich (ohne Freitext-Eingabe) */}
        <div className="card">
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

        {/* Einladungen: Nutzer per Email einladen */}
        <div className="card">
          <h2>{t('invites.title', 'Nutzer einladen')}</h2>
          <form onSubmit={handleInviteSubmit}>
            <div className="form-row" style={{ gap: 8 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>{t('invites.nameLabel', 'Name')}</label>
                <input type="text" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder={t('invites.namePlaceholder', 'z.B. Max Mustermann')} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>{t('invites.emailLabel', 'Email')}</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="max@example.com" />
              </div>
            </div>
            <div className="form-row" style={{ gap: 8, marginTop: 12 }}>
              <button type="submit" className="btn-primary">{t('invites.send', 'Einladungslink erzeugen')}</button>
            </div>
          </form>
          {inviteLink && (
            <div className="card" style={{ marginTop: 12, background: 'rgba(46, 204, 113, 0.10)', borderLeft: '6px solid var(--success)' }}>
              <span style={{ wordBreak: 'break-all' }}>{inviteLink}</span>
            </div>
          )}
        </div>

        {/* Nutzerverwaltung: Formular + Liste in einer Karte */}
        <div className="card">
          <h2>{t('users.listTitle', 'Nutzer')}</h2>
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
          {users.length === 0 ? (
            <p style={{ opacity: 0.8, marginTop: 12 }}>{t('users.empty', 'Noch keine Nutzer')}</p>
          ) : (
            <div className="users-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8, marginTop: 12 }}>
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

        {/* Teamverwaltung: Formular + Liste in einer Karte */}
        <div className="card">
          <h2>{t('teams.listTitle', 'Teams')}</h2>
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
          {teams.length === 0 ? (
            <p style={{ opacity: 0.8, marginTop: 12 }}>{t('teams.empty', 'Noch keine Teams')}</p>
          ) : (
            <div className="teams-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10, marginTop: 12 }}>
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
  );
};

export default UsersTeams;