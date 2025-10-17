import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Code = ({ children }) => (
  <pre style={{ background: 'var(--code-bg, #0f172a)', color: 'var(--code-fg, #e5e7eb)', padding: 12, borderRadius: 8, overflowX: 'auto' }}>{children}</pre>
);

const Card = ({ title, children }) => (
  <div className="card" style={{ padding: 16, marginBottom: 16 }}>
    <h2 style={{ margin: '0 0 8px 0' }}>{title}</h2>
    {children}
  </div>
);

const ToolsDocs = () => {
  const { t } = useLanguage();

  return (
    <div className="page" style={{ padding: 16 }}>
      <div className="header" style={{ marginBottom: 12 }}>
        <div className="header-content">
          <h1>{t('docs.tools.title', 'Tools – Dokumentation')}</h1>
          <p className="subtitle">{t('docs.tools.subtitle', 'Import/Export‑Formate, Duplikatschutz und bewährte Vorgehensweisen')}</p>
        </div>
      </div>

      <Card title={t('docs.lenses.title', 'Objektiv‑Editor – JSON‑Import')}>
        <p style={{ margin: '8px 0' }}>{t('docs.common.supported', 'Unterstützt Arrays oder Objekte mit den Schlüsseln')} <code>items</code> / <code>lenses</code>.</p>
        <Code>{`[
  { "manufacturer": "ARRI", "lens": "50mm f/1.4" },
  { "manufacturer": "Canon", "name": "24-70mm f/2.8" }
]`}</Code>
        <p style={{ margin: '8px 0' }}>{t('docs.common.duplicates', 'Duplikate gegen offizielle Datenbank und Ergänzungen anderer Nutzer werden übersprungen.')}</p>
        <p style={{ margin: '8px 0' }}>{t('docs.common.ownership', 'Importierte Einträge werden dem aktuell angemeldeten Nutzer zugeordnet.')}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Link className="button" to="/lens-editor" title={t('docs.gotoLensEditor', 'Zum Objektiv‑Editor')}>{t('docs.gotoLensEditor', 'Zum Objektiv‑Editor')}</Link>
          <Link className="button" to="/lens-audit" title={t('docs.gotoLensAudit', 'Zum Objektiv‑Audit')}>{t('docs.gotoLensAudit', 'Zum Objektiv‑Audit')}</Link>
        </div>
      </Card>

      <Card title={t('docs.cameras.title', 'Kamera/Sensor‑Editor – JSON‑Import')}>
        <p style={{ margin: '8px 0' }}>{t('docs.common.supported', 'Unterstützt Arrays oder Objekte mit den Schlüsseln')} <code>items</code> / <code>cameras</code> / <code>formats</code>.</p>
        <Code>{`[
  { "manufacturer": "RED", "camera": "Komodo", "sensorWidth": 27.03, "sensorHeight": 14.26 },
  { "manufacturer": "Sony", "name": "A7S III", "width": 35.6, "height": 23.8 }
]`}</Code>
        <p style={{ margin: '8px 0' }}>{t('docs.common.duplicates', 'Duplikate gegen offizielle Datenbank und Ergänzungen anderer Nutzer werden übersprungen.')}</p>
        <p style={{ margin: '8px 0' }}>{t('docs.common.ownership', 'Importierte Einträge werden dem aktuell angemeldeten Nutzer zugeordnet.')}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Link className="button" to="/camera-sensor-editor" title={t('docs.gotoCameraSensorEditor', 'Zum Kamera/Sensor‑Editor')}>{t('docs.gotoCameraSensorEditor', 'Zum Kamera/Sensor‑Editor')}</Link>
          <Link className="button" to="/camera-format-audit" title={t('docs.gotoCameraAudit', 'Zum Kamera/Format Audit')}>{t('docs.gotoCameraAudit', 'Zum Kamera/Format Audit')}</Link>
        </div>
      </Card>

      <Card title={t('docs.bestPractices.title', 'Best Practices')}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>{t('docs.bp.mmField', 'Bei mm‑Angaben das Format "28.0 x 15.7 mm" verwenden.')}</li>
          <li>{t('docs.bp.pixelField', 'Bei Pixel‑Auflösung "4608 x 2592" verwenden, nicht „4.6K“.')}</li>
          <li>{t('docs.bp.arField', 'AR‑Angaben als Verhältnis (z. B. "16:9" oder "2.39:1").')}</li>
          <li>{t('docs.bp.noOverwrite', 'Offizielle Daten werden niemals überschrieben – Duplikate werden geblockt.')}</li>
          <li>{t('docs.bp.clipboardExport', 'Export kopiert JSON in die Zwischenablage, Import liest aus Datei.')}</li>
        </ul>
      </Card>

      <Card title={t('docs.troubleshooting.title', 'Troubleshooting')}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>{t('docs.ts.invalidJson', 'Fehler „Ungültiges JSON“: eine Array‑Struktur oder ein Objekt mit "items"/"lenses"/"cameras"/"formats" wird erwartet.')}</li>
          <li>{t('docs.ts.skipped', '„Übersprungen“ beim Import bedeutet Duplikat oder unvollständige Felder.')}</li>
          <li>{t('docs.ts.userScope', '„Meine“ zeigt nur eigene Ergänzungen; „Alle“ zeigt Ergänzungen aller Nutzerprofile auf diesem Gerät.')}</li>
        </ul>
      </Card>
    </div>
  );
};

export default ToolsDocs;