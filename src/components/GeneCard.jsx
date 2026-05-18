// components/GeneCard.jsx
import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

export default function GeneCard({ gene, isSelected, onClick }) {
  const [expanded, setExpanded] = useState(false);

  const pos = gene.genomic_pos;
  const chr = pos?.chr || gene.chromosome || '?';
  const start = pos?.start;
  const end = pos?.end;

  return (
    <div
      style={{
        ...styles.card,
        ...(isSelected ? styles.cardSelected : {}),
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.symbolWrap}>
          <span style={styles.symbol}>{gene.symbol || 'UNKNOWN'}</span>
          {gene.type_of_gene && (
            <span style={styles.typeTag}>{gene.type_of_gene}</span>
          )}
        </div>
        <div style={styles.chromTag}>
          Chr {String(chr).replace('chr', '')}
        </div>
      </div>

      {/* Gene full name */}
      <p style={styles.name}>{gene.name || 'Gene name not available'}</p>

      {/* Genomic coordinates */}
      {start && end && (
        <div style={styles.coordsRow}>
          <span style={styles.coordLabel}>LOCUS</span>
          <span style={styles.coords}>
            {String(chr).replace('chr', '')}:{start?.toLocaleString()}–{end?.toLocaleString()}
          </span>
        </div>
      )}

      {/* Entrez ID */}
      {gene.entrezgene && (
        <div style={styles.coordsRow}>
          <span style={styles.coordLabel}>NCBI ID</span>
          <a
            href={`https://www.ncbi.nlm.nih.gov/gene/${gene.entrezgene}`}
            target="_blank"
            rel="noreferrer"
            style={styles.link}
            onClick={e => e.stopPropagation()}
          >
            {gene.entrezgene} <ExternalLink size={10} />
          </a>
        </div>
      )}

      {/* Summary with expand toggle */}
      {gene.summary && (
        <div style={styles.summaryWrap}>
          <div style={{ ...styles.summary, ...(expanded ? {} : styles.summaryCollapsed) }}>
            {gene.summary}
          </div>
          <button
            style={styles.toggleBtn}
            onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
          >
            {expanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> More</>}
          </button>
        </div>
      )}

      {/* Selected indicator */}
      {isSelected && <div style={styles.selectedBar} />}
    </div>
  );
}

const styles = {
  card: {
    position: 'relative',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: 18,
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: 'var(--accent-green)',
    background: 'var(--bg-card-hover)',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
  },
  symbolWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  symbol: {
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    fontSize: 18,
    color: 'var(--accent-green)',
    letterSpacing: '0.02em',
  },
  typeTag: {
    fontSize: 10,
    padding: '2px 7px',
    background: 'rgba(77,159,255,0.12)',
    border: '1px solid rgba(77,159,255,0.3)',
    borderRadius: 3,
    color: 'var(--accent-blue)',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.05em',
  },
  chromTag: {
    fontSize: 11,
    padding: '3px 9px',
    background: 'rgba(245,200,66,0.1)',
    border: '1px solid rgba(245,200,66,0.3)',
    borderRadius: 3,
    color: 'var(--accent-yellow)',
    fontFamily: 'var(--font-mono)',
    whiteSpace: 'nowrap',
  },
  name: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
    marginBottom: 10,
  },
  coordsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 5,
  },
  coordLabel: {
    fontSize: 9,
    letterSpacing: '0.15em',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    minWidth: 52,
  },
  coords: {
    fontSize: 11,
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
  },
  link: {
    fontSize: 11,
    color: 'var(--accent-blue)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontFamily: 'var(--font-mono)',
  },
  summaryWrap: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1px solid var(--border)',
  },
  summary: {
    fontSize: 12,
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
  },
  summaryCollapsed: {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  toggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    background: 'none',
    border: 'none',
    color: 'var(--accent-blue)',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    cursor: 'pointer',
    padding: 0,
  },
  selectedBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    background: 'var(--accent-green)',
    borderRadius: '8px 0 0 8px',
  },
};
