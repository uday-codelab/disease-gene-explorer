// components/DiseaseInfo.jsx
import { ExternalLink, AlertCircle } from 'lucide-react';

export default function DiseaseInfo({ omimIds, symbol }) {
  if (!omimIds || omimIds.length === 0) {
    return (
      <div style={styles.card} className="fade-in stagger-4">
        <div style={styles.header}>
          <span style={styles.label}>DISEASE ASSOCIATIONS</span>
        </div>
        <div style={styles.empty}>
          <AlertCircle size={16} color="var(--text-muted)" />
          <span>No OMIM disease associations found for {symbol}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card} className="fade-in stagger-4">
      <div style={styles.header}>
        <span style={styles.label}>DISEASE ASSOCIATIONS</span>
        <span style={styles.count}>{omimIds.length} OMIM entries</span>
      </div>
      <p style={styles.subtitle}>
        These OMIM entries are linked to <strong style={{ color: 'var(--accent-green)' }}>{symbol}</strong>.
        Click any entry to view details on OMIM.
      </p>
      <div style={styles.list}>
        {omimIds.map(({ omimId, url }) => (
          <a
            key={omimId}
            href={url}
            target="_blank"
            rel="noreferrer"
            style={styles.row}
          >
            <div style={styles.omimDot} />
            <div style={styles.rowContent}>
              <span style={styles.omimId}>OMIM #{omimId}</span>
              <span style={styles.rowSub}>Click to view on omim.org</span>
            </div>
            <ExternalLink size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </a>
        ))}
      </div>
      <p style={styles.note}>
        💡 OMIM (Online Mendelian Inheritance in Man) is a comprehensive database of human genes and genetic disorders.
      </p>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: 24,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    letterSpacing: '0.15em',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  count: {
    fontSize: 11,
    color: 'var(--accent-purple)',
    fontFamily: 'var(--font-mono)',
    background: 'rgba(167,139,250,0.1)',
    border: '1px solid rgba(167,139,250,0.3)',
    borderRadius: 4,
    padding: '2px 8px',
  },
  subtitle: {
    fontSize: 12,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    marginBottom: 14,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 14,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    textDecoration: 'none',
    transition: 'border-color 0.15s',
  },
  omimDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--accent-purple)',
    flexShrink: 0,
  },
  rowContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  omimId: {
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    fontWeight: 700,
  },
  rowSub: {
    color: 'var(--text-muted)',
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: 'var(--text-muted)',
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
    padding: '12px 0',
  },
  note: {
    fontSize: 11,
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    padding: '10px 12px',
    background: 'var(--bg-secondary)',
    borderRadius: 4,
    borderLeft: '3px solid var(--accent-purple)',
  },
};
