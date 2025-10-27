import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './Notes.css';
import DrawingCanvas from '../components/DrawingCanvas';

const Notes = () => {
  const { t } = useLanguage();
  const [notes, setNotes] = useState([
    { id: 1, title: 'Besprechung mit VFX Team', content: 'Diskussion über Explosion-Effekte für SH_001. Team benötigt mehr Referenzmaterial.', date: '2023-06-15', tags: ['Meeting', 'SH_001'] },
    { id: 2, title: 'Kamera-Setup für Greenscreen', content: 'Beleuchtung muss gleichmäßiger sein. Tracking-Marker neu positionieren.', date: '2023-06-16', tags: ['Greenscreen', 'Beleuchtung'] },
    { id: 3, title: 'Drohnenflug Planung', content: 'Genehmigung für Flug über Stadtgebiet einholen. Backup-Plan für schlechtes Wetter erstellen.', date: '2023-06-17', tags: ['Drohne', 'Planung'] }
  ]);

  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });
  const [filter, setFilter] = useState('');
  const [canvasImage, setCanvasImage] = useState(null);

  const handleAddNote = () => {
    if (newNote.title.trim() === '' || newNote.content.trim() === '') return;
    
    const tagsArray = newNote.tags ? newNote.tags.split(',').map(tag => tag.trim()) : [];
    
    setNotes([
      ...notes,
      {
        id: notes.length + 1,
        title: newNote.title,
        content: newNote.content,
        date: new Date().toISOString().split('T')[0],
        tags: tagsArray,
        imageDataUrl: canvasImage || null,
      }
    ]);
    
    setNewNote({ title: '', content: '', tags: '' });
    setCanvasImage(null);
  };

  const handleNoteChange = (e) => {
    const { name, value } = e.target;
    setNewNote({
      ...newNote,
      [name]: value
    });
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const filteredNotes = notes.filter(note => {
    if (!filter) return true;
    const filterLower = filter.toLowerCase();
    return (
      note.title.toLowerCase().includes(filterLower) ||
      note.content.toLowerCase().includes(filterLower) ||
      (Array.isArray(note.tags) && note.tags.some(tag => tag.toLowerCase().includes(filterLower)))
    );
  });

  // Alle Tags sammeln für die Filterauswahl
  const allTags = [...new Set(notes.flatMap(note => Array.isArray(note.tags) ? note.tags : []))];

  return (
    <div className="notes-page">
      <h1>{t('nav.notes')}</h1>
      
      <div className="notes-controls">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder={t('search.notesPlaceholder')} 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        
        <div className="tags-filter">
          <span className="filter-label">{t('notes.filterByTags')}</span>
          <div className="tags-list">
            {allTags.map(tag => (
              <button 
                key={tag} 
                className={`btn-outline ${filter === tag ? 'active' : ''}`}
                onClick={() => setFilter(filter === tag ? '' : tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="notes-grid">
        {filteredNotes.map(note => (
          <div className="note-card card" key={note.id}>
            <div className="note-header">
              <h3>{note.title}</h3>
              <button 
                className="btn-danger" 
                onClick={() => handleDeleteNote(note.id)}
              >
                {t('action.delete')}
              </button>
            </div>
            <div className="note-date">{note.date}</div>
            <div className="note-content">{note.content}</div>
            {note.imageDataUrl && (
              <div className="note-image" style={{ marginTop: 8 }}>
                <img src={note.imageDataUrl} alt="Skizze" style={{ maxWidth: '100%', borderRadius: 8 }} />
              </div>
            )}
            {Array.isArray(note.tags) && note.tags.length > 0 && (
              <div className="note-tags">
                {note.tags.map(tag => (
                  <span className="tag" key={tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="add-note card">
        <h2>{t('shot.newNote')}</h2>

        <DrawingCanvas onSave={(url) => setCanvasImage(url)} width={800} height={400} actionsPlacement="start" />
        {canvasImage && (
          <div style={{ marginBottom: 12 }}>
            <strong>Skizzen‑Vorschau</strong>
            <img src={canvasImage} alt="Skizze" style={{ maxWidth: '100%', borderRadius: 8, marginTop: 8 }} />
          </div>
        )}

        <div className="form-group">
          <label>{t('notes.titleLabel')}:</label>
          <input 
            type="text" 
            name="title" 
            value={newNote.title} 
            onChange={handleNoteChange}
            placeholder={t('notes.titlePlaceholder')}
          />
        </div>
        <div className="form-group">
          <label>{t('notes.contentLabel')}:</label>
          <textarea 
            name="content" 
            value={newNote.content} 
            onChange={handleNoteChange}
            placeholder={t('notes.contentPlaceholder')}
            rows="4"
          ></textarea>
        </div>
        <div className="form-group">
          <label>{t('notes.tagsLabel')}</label>
          <input 
            type="text" 
            name="tags" 
            value={newNote.tags} 
            onChange={handleNoteChange}
            placeholder={t('notes.tagsPlaceholder')}
          />
        </div>
        <button className="btn-primary" onClick={handleAddNote}>{t('notes.addNote')}</button>
      </div>
    </div>
  );
};

export default Notes;