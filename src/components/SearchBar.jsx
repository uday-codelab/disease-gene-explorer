import { useState, useEffect } from 'react';
import { Search, Dna, Microscope } from 'lucide-react';

const SUGGESTIONS = [
  { label: 'BRCA1', type: 'gene' },
  { label: 'TP53', type: 'gene' },
  { label: 'EGFR', type: 'gene' },
  { label: 'APOE', type: 'gene' },
  { label: 'Breast Cancer', type: 'disease' },
  { label: 'Diabetes', type: 'disease' },
  { label: 'Alzheimer', type: 'disease' },
];

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('gene'); // 'gene' | 'disease'
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // CRITICAL NEW STATE: Track the active selected suggestion via index keys
  const [activeIndex, setActiveIndex] = useState(-1);

  const filtered = SUGGESTIONS.filter(
    s => s.type === mode && s.label.toLowerCase().includes(query.toLowerCase()) && query.length > 0
  );

  // Reset the keyboard selection index whenever the list filtered values update or mode flips
  useEffect(() => {
    setActiveIndex(-1);
  }, [query, mode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowSuggestions(false);
    onSearch(query.trim(), mode);
  };

  const pickSuggestion = (s) => {
    setQuery(s.label);
    setShowSuggestions(false);
    setActiveIndex(-1);
    onSearch(s.label, mode);
  };

  // NEW INTERCEPTOR: Capture key bindings on the text input block
  const handleKeyDown = (e) => {
    if (!showSuggestions || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault(); // Stifles regular cursor jumps to string tail bounds
      setActiveIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault(); // Stifles normal cursor jumps back to string head bounds
      setActiveIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
    } 
    else if (e.key === 'Enter') {
      // If the user has explicitly highlighted an option, select it
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        e.preventDefault();
        pickSuggestion(filtered[activeIndex]);
      }
    } 
    else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Mode toggle */}
      <div style={styles.modeRow}>
        <button
          style={{ ...styles.modeBtn, ...(mode === 'gene' ? styles.modeBtnActive : {}) }}
          onClick={() => setMode('gene')}
          type="button"
        >
          <Dna size={14} /> Gene Symbol
        </button>
        <button
          style={{ ...styles.modeBtn, ...(mode === 'disease' ? styles.modeBtnActive : {}) }}
          onClick={() => setMode('disease')}
          type="button"
        >
          <Microscope size={14} /> Disease Name
        </button>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} style={styles.form} autoComplete="off">
        <div style={styles.inputWrap}>
          <Search size={18} style={styles.icon} />
          <input
            style={styles.input}
            type="text"
            placeholder={mode === 'gene' ? 'e.g. BRCA1, TP53, EGFR...' : 'e.g. Alzheimer, Diabetes...'}
            value={query}
            onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown} // Binds our new keyboard navigation event controller
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            disabled={loading}
          />
          {query && (
            <button type="button" style={styles.clearBtn} onClick={() => setQuery('')}>✕</button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && filtered.length > 0 && (
          <div style={styles.dropdown}>
            {filtered.map((s, index) => {
              const isHighlighted = index === activeIndex;
              
              return (
                <button 
                  key={s.label} 
                  type="button" 
                  style={{
                    ...styles.suggestion,
                    ...(isHighlighted ? styles.suggestionActive : {}) // Dynamically swaps styles when active
                  }} 
                  onMouseDown={() => pickSuggestion(s)}
                  onMouseEnter={() => setActiveIndex(index)} // Syncs hovering with key bindings seamlessly
                >
                  <span style={styles.suggDot} />
                  {s.label}
                </button>
              );
            })}
          </div>
        )}

        <button style={{ ...styles.searchBtn, ...(loading ? styles.searchBtnDisabled : {}) }} type="submit" disabled={loading}>
          {loading ? <span style={styles.loadingDots}>Scanning<span className="blink">...</span></span> : 'Search →'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrapper: {
    width: '100%',
    maxWidth: 640,
    margin: '0 auto',
  },
  modeRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
    justifyContent: 'center',
  },
  modeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 16px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 4,
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modeBtnActive: {
    borderColor: 'var(--accent-green)',
    color: 'var(--accent-green)',
    background: 'rgba(0,229,160,0.08)',
  },
  form: {
    position: 'relative',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 6,
    padding: '0 12px',
    gap: 10,
    transition: 'border-color 0.2s',
  },
  icon: {
    color: 'var(--text-muted)',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: 15,
    padding: '14px 0',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 13,
    padding: '4px',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 6,
    zIndex: 100,
    overflow: 'hidden',
  },
  suggestion: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s, color 0.15s',
  },
  // Added styled rule to match your exact setup's neon green glow accent palette
  suggestionActive: {
    background: 'rgba(0, 229, 160, 0.12)',
    color: 'var(--accent-green)',
  },
  suggDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--accent-green)',
    flexShrink: 0,
  },
  searchBtn: {
    marginTop: 10,
    width: '100%',
    padding: '13px',
    background: 'var(--accent-green)',
    border: 'none',
    borderRadius: 6,
    color: '#070d1a',
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    letterSpacing: '0.05em',
    transition: 'opacity 0.2s',
  },
  searchBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  loadingDots: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
  },
};