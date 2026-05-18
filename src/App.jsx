// App.jsx
import { useState } from 'react';
import { Dna, AlertTriangle, ChevronRight } from 'lucide-react';
import SearchBar from './components/SearchBar';
import GeneCard from './components/GeneCard';
import ChromosomeViewer from './components/ChromosomeViewer';
import DiseaseInfo from './components/DiseaseInfo';
import { searchGenesByQuery, searchDiseaseGenes, getDiseasesForGene } from './services/api';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedGene, setSelectedGene] = useState(null);
  const [omimIds, setOmimIds] = useState([]);
  const [lastQuery, setLastQuery] = useState('');
  const [loadingOmim, setLoadingOmim] = useState(false);

  const handleSearch = async (query, mode) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setSelectedGene(null);
    setOmimIds([]);
    setLastQuery(query);

    try {
      let hits = [];
      if (mode === 'gene') {
        hits = await searchGenesByQuery(query);
      } else {
        hits = await searchDiseaseGenes(query);
      }

      if (hits.length === 0) {
        setError(`No genes found for "${query}". Try a different term.`);
      } else {
        setResults(hits);
        // Auto-select first result
        handleSelectGene(hits[0]);
      }
    } catch (err) {
      setError(`Error fetching data: ${err.message}. Check your internet connection.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGene = async (gene) => {
    setSelectedGene(gene);
    setOmimIds([]);
    setLoadingOmim(true);
    try {
      const ids = await getDiseasesForGene(gene.symbol);
      setOmimIds(ids);
    } catch {
      setOmimIds([]);
    } finally {
      setLoadingOmim(false);
    }
  };

  const pos = selectedGene?.genomic_pos;
  const chr = pos?.chr || selectedGene?.chromosome;
  const start = pos?.start;
  const end = pos?.end;

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <Dna size={22} color="var(--accent-green)" />
            </div>
            <div>
              <div style={styles.logoTitle}>Disease–Gene Explorer</div>
              <div style={styles.logoSub}>Powered by NCBI · MyGene.info</div>
            </div>
          </div>
          <div style={styles.statusDot}>
            <div style={styles.dot} />
            <span style={styles.statusText}>Live</span>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Hero search section */}
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>
            Explore the Genomic<br />
            <span style={styles.heroAccent}>Architecture of Disease</span>
          </h1>
          <p style={styles.heroSub}>
            Search any gene symbol or disease name to retrieve chromosome locations,
            biological metadata, and disease associations from live biological databases.
          </p>
          <SearchBar onSearch={handleSearch} loading={loading} />
        </section>

        {/* Results */}
        {(results.length > 0 || error) && (
          <section style={styles.results}>
            {/* Breadcrumb */}
            <div style={styles.breadcrumb}>
              <span style={styles.breadHome}>Search</span>
              <ChevronRight size={12} color="var(--text-muted)" />
              <span style={styles.breadCurrent}>"{lastQuery}"</span>
              <span style={styles.breadCount}>{results.length} results</span>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <AlertTriangle size={16} color="var(--accent-red)" />
                <span>{error}</span>
              </div>
            )}

            <div style={styles.layout}>
              {/* Left: gene list */}
              <div style={styles.geneList}>
                <div style={styles.sectionLabel}>GENE RESULTS</div>
                {results.map((gene, i) => (
                  <div
                    key={gene._id || gene.entrezgene || i}
                    className={`fade-in stagger-${Math.min(i + 1, 4)}`}
                  >
                    <GeneCard
                      gene={gene}
                      isSelected={selectedGene?._id === gene._id || selectedGene?.entrezgene === gene.entrezgene}
                      onClick={() => handleSelectGene(gene)}
                    />
                  </div>
                ))}
              </div>

              {/* Right: detail panel */}
              {selectedGene && (
                <div style={styles.detailPanel}>
                  <div style={styles.sectionLabel}>GENOMIC DETAILS — {selectedGene.symbol}</div>

                  {/* Chromosome visualization */}
                  <ChromosomeViewer
                    chromosome={chr}
                    start={start}
                    end={end}
                    symbol={selectedGene.symbol}
                  />

                  {/* Disease associations */}
                  <div style={{ marginTop: 16 }}>
                    {loadingOmim ? (
                      <div style={styles.loadingOmim}>
                        <div style={styles.dot} />
                        Loading disease associations...
                      </div>
                    ) : (
                      <DiseaseInfo omimIds={omimIds} symbol={selectedGene.symbol} />
                    )}
                  </div>

                  {/* External links */}
                  <div style={styles.linksRow}>
                    {selectedGene.entrezgene && (
                      <ExtLink
                        href={`https://www.ncbi.nlm.nih.gov/gene/${selectedGene.entrezgene}`}
                        label="NCBI Gene"
                      />
                    )}
                    {selectedGene.symbol && (
                      <ExtLink
                        href={`https://www.genecards.org/cgi-bin/carddisp.pl?gene=${selectedGene.symbol}`}
                        label="GeneCards"
                      />
                    )}
                    {selectedGene.symbol && (
                      <ExtLink
                        href={`https://www.uniprot.org/uniprot/?query=gene:${selectedGene.symbol}+AND+organism_id:9606`}
                        label="UniProt"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Empty state */}
        {results.length === 0 && !error && !loading && (
          <section style={styles.emptyState}>
            <div style={styles.emptyGrid}>
              {['BRCA1', 'TP53', 'EGFR', 'APOE', 'CFTR', 'HTT'].map(g => (
                <button
                  key={g}
                  style={styles.exampleChip}
                  onClick={() => handleSearch(g, 'gene')}
                >
                  <span style={styles.chipDot} />{g}
                </button>
              ))}
            </div>
            <p style={styles.emptyHint}>Click a gene above or type to search</p>
          </section>
        )}
      </main>

      <footer style={styles.footer}>
        <span>Data: NCBI Entrez · MyGene.info · OMIM</span>
        <span style={{ color: 'var(--text-muted)' }}>For educational use</span>
      </footer>
    </div>
  );
}

function ExtLink({ href, label }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" style={extLinkStyle}>
      {label} ↗
    </a>
  );
}

const extLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 12px',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--accent-blue)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  textDecoration: 'none',
  transition: 'border-color 0.15s',
};

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    borderBottom: '1px solid var(--border)',
    background: 'rgba(7,13,26,0.8)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  headerInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    background: 'rgba(0,229,160,0.1)',
    border: '1px solid rgba(0,229,160,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 16,
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
  },
  logoSub: {
    fontSize: 10,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.05em',
  },
  statusDot: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'var(--accent-green)',
    animation: 'pulse-dot 2s ease-in-out infinite',
  },
  statusText: {
    fontSize: 11,
    color: 'var(--accent-green)',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.05em',
  },
  main: {
    flex: 1,
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px 60px',
    width: '100%',
  },
  hero: {
    textAlign: 'center',
    padding: '64px 0 48px',
  },
  heroTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 'clamp(28px, 5vw, 52px)',
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    marginBottom: 16,
    color: 'var(--text-primary)',
  },
  heroAccent: {
    color: 'var(--accent-green)',
  },
  heroSub: {
    fontSize: 14,
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    maxWidth: 520,
    margin: '0 auto 32px',
    fontFamily: 'var(--font-mono)',
  },
  results: {
    paddingTop: 8,
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    fontFamily: 'var(--font-mono)',
  },
  breadHome: {
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  breadCurrent: {
    fontSize: 12,
    color: 'var(--text-primary)',
  },
  breadCount: {
    fontSize: 11,
    padding: '2px 8px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    color: 'var(--accent-green)',
    marginLeft: 4,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 18px',
    background: 'rgba(255,107,107,0.08)',
    border: '1px solid rgba(255,107,107,0.3)',
    borderRadius: 6,
    color: 'var(--accent-red)',
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
    marginBottom: 20,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '360px 1fr',
    gap: 24,
    alignItems: 'start',
  },
  geneList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  detailPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: '0.15em',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  loadingOmim: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: 'var(--text-muted)',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    padding: '16px 0',
  },
  linksRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 14,
  },
  emptyState: {
    textAlign: 'center',
    paddingTop: 40,
  },
  emptyGrid: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  exampleChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '8px 16px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    cursor: 'pointer',
    transition: 'border-color 0.2s, color 0.2s',
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--accent-green)',
    flexShrink: 0,
  },
  emptyHint: {
    fontSize: 12,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  footer: {
    borderTop: '1px solid var(--border)',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
  },
};
