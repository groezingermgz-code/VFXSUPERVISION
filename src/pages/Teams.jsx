import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTeam } from '../contexts/TeamContext';
import Icon from '../components/Icon';

const Teams = () => {
  const { t } = useLanguage();
  const { users } = useAuth();
  const { teams, addTeam, deleteTeam, renameTeam, addMember, removeMember } = useTeam();
  const [name, setName] = useState('');

  const handleAddTeam = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addTeam(name.trim());
    setName('');
  };

  const usersById = Object.fromEntries(users.map(u => [u.id, u]));

  return (
    <div className="page teams-page">
      <div className="header">
        <div className="header-content">
          <h1>{t('teams.title', 'Teams')}</h1>
          <p className="subtitle">{t('teams.description', 'Lege Teams an und verwalte Mitglieder für Projekte.')}</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <form onSubmit={handleAddTeam}>
          <div className="form-group" style={{ width: '100%' }}>
            <label>{t('teams.nameLabel', 'Teamname')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('teams.namePlaceholder', 'z.B. Kameraunit A')}
            />
          </div>
          <div className="form-row" style={{ gap: 8, marginTop: 12 }}>
            <button type="submit" className="btn-primary">{t('teams.addTeamButton', 'Team hinzufügen')}</button>
          </div>
        </form>
      </div>

      <div className="card" style={{ maxWidth: 900, margin: '16px auto' }}>
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
  );
};

export default Teams;