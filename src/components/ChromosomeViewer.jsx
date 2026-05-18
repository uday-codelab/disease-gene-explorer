import React, { useState, useRef } from 'react';

// Human chromosome sizes in Mb (GRCh38 approximate)
const CHROM_SIZES = {
  '1': 249, '2': 242, '3': 198, '4': 190, '5': 181,
  '6': 170, '7': 159, '8': 145, '9': 138, '10': 133,
  '11': 135, '12': 133, '13': 114, '14': 107, '15': 101,
  '16': 90,  '17': 83,  '18': 80,  '19': 59,  '20': 64,
  '21': 47,  '22': 51,  'X': 156, 'Y': 57,
};

export default function ChromosomeViewer({ chromosome, start, end, symbol }) {
  const chr = String(chromosome || '').replace('chr', '');
  const chromSize = CHROM_SIZES[chr] || 200;

  // New states for interaction
  const [hoverMb, setHoverMb] = useState(null);
  const [tooltipX, setTooltipX] = useState(0);
  const [lockedMb, setLockedMb] = useState(null);
  
  const barRef = useRef(null);

  // Position as fraction (0–1)
  const startMb = start ? start / 1_000_000 : null;
  const endMb = end ? end / 1_000_000 : null;
  const midMb = startMb != null && endMb != null ? (startMb + endMb) / 2 : null;
  const posFraction = midMb != null ? Math.max(0.02, Math.min(0.98, midMb / chromSize)) : null;
  const bandWidth = endMb != null && startMb != null
    ? Math.max(0.02, Math.min(0.15, (endMb - startMb) / chromSize))
    : 0.04;

  const hasPosition = posFraction !== null;

  // Track mouse scanning movement across the chromosome
  const handleMouseMove = (e) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // Pixel position relative to the element bar
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const positionInMb = (percentage * chromSize).toFixed(2);

    setHoverMb(positionInMb);
    setTooltipX(x);
  };

  const handleMouseLeave = () => {
    setHoverMb(null);
  };

  // Click handler to drop a pin / inspect a coordinate frame
  const handleBarClick = () => {
    if (hoverMb) {
      // Toggle lock if clicked on the same spot, else update target lock
      setLockedMb(lockedMb === hoverMb ? null : hoverMb);
    }
  };

  return (
    <div style={styles.card} className="fade-in stagger-3">
      <div style={styles.header}>
        <span style={styles.label}>CHROMOSOME MAP</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {lockedMb && (
            <span style={styles.lockBadge} onClick={() => setLockedMb(null)}>
              📍 Inspecting: {lockedMb} Mb ×
            </span>
          )}
          <span style={styles.chrBadge}>Chr {chr || '?'}</span>
        </div>
      </div>

      <div style={styles.chromWrap}>
        {/* INTERACTIVE Chromosome body */}
        <div 
          ref={barRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleBarClick}
          style={{ ...styles.chromBar, cursor: 'crosshair' }}
        >
          {/* Centromere */}
          <div style={styles.centromere} />
          
          {/* Gene position marker */}
          {hasPosition && (
            <div
              style={{
                ...styles.geneMarker,
                left: `${posFraction * 100}%`,
                width: `${bandWidth * 100}%`,
              }}
            />
          )}

          {/* Interactive Inspection Lock Line */}
          {lockedMb && (
            <div 
              style={{
                ...styles.lockLine,
                left: `${(lockedMb / chromSize) * 100}%`
              }}
            />
          )}

          {/* Scan line animation (Only active when not hovering) */}
          {!hoverMb && <div style={styles.scanLine} />}

          {/* DYNAMIC HOVER TOOLTIP */}
          {hoverMb && (
            <div 
              style={{
                ...styles.hoverTooltip,
                left: `${tooltipX}px`,
              }}
            >
              {hoverMb} Mb
            </div>
          )}
        </div>

        {/* Tick marks */}
        <div style={styles.tickRow}>
          {[0, 25, 50, 75, 100].map(pct => (
            <div key={pct} style={{ ...styles.tick, left: `${pct}%` }}>
              <div style={styles.tickLine} />
              <span style={styles.tickLabel}>{Math.round(chromSize * pct / 100)}Mb</span>
            </div>
          ))}
        </div>

        {/* Gene label below marker */}
        {hasPosition && (
          <div style={{ ...styles.geneLabelWrap, left: `${posFraction * 100}%` }}>
            <div style={styles.geneLabelLine} />
            <div style={styles.geneLabel}>
              <span style={styles.geneLabelText}>{symbol}</span>
              {startMb && <span style={styles.geneLabelPos}>{startMb.toFixed(2)}–{endMb?.toFixed(2)} Mb</span>}
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={styles.statsRow}>
        <Stat label="Chromosome" value={`Chr ${chr || 'N/A'}`} color="var(--accent-green)" />
        <Stat label="Start" value={start ? `${(start/1e6).toFixed(2)} Mb` : 'N/A'} color="var(--accent-blue)" />
        <Stat label="End" value={end ? `${(end/1e6).toFixed(2)} Mb` : 'N/A'} color="var(--accent-blue)" />
        <Stat label="Size" value={start && end ? `${((end-start)/1000).toFixed(0)} kb` : 'N/A'} color="var(--accent-yellow)" />
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={statStyles.wrap}>
      <span style={statStyles.label}>{label}</span>
      <span style={{ ...statStyles.value, color }}>{value}</span>
    </div>
  );
}

// Keep your existing statStyles intact
const statStyles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 3 },
  label: { fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' },
  value: { fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' },
};

// Merged and expanded inline styles containing interaction rules
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
    marginBottom: 24,
  },
  label: {
    fontSize: 10,
    letterSpacing: '0.15em',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  chrBadge: {
    background: 'rgba(0,229,160,0.12)',
    border: '1px solid var(--accent-green)',
    borderRadius: 4,
    padding: '3px 10px',
    color: 'var(--accent-green)',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
  },
  lockBadge: {
    background: 'rgba(59, 130, 246, 0.15)',
    border: '1px solid var(--accent-blue)',
    borderRadius: 4,
    padding: '3px 8px',
    color: 'var(--accent-blue)',
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
  },
  chromWrap: {
    position: 'relative',
    marginBottom: 40,
    paddingBottom: 32,
  },
  chromBar: {
    position: 'relative',
    height: 28,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-bright)',
    borderRadius: 14,
    overflow: 'visible', // Changed to visible so custom tooltips float gracefully
  },
  centromere: {
    position: 'absolute',
    left: '42%',
    top: 0,
    bottom: 0,
    width: 6,
    background: 'var(--border-bright)',
    borderRadius: 3,
    zIndex: 1,
  },
  geneMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    background: 'var(--accent-green)',
    opacity: 0.85,
    transition: 'left 0.3s ease, width 0.3s ease',
    borderRadius: 2,
    boxShadow: '0 0 10px var(--accent-green)',
    zIndex: 2,
  },
  lockLine: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    width: 2,
    background: 'var(--accent-blue)',
    boxShadow: '0 0 8px var(--accent-blue)',
    zIndex: 3,
  },
  hoverTooltip: {
    position: 'absolute',
    top: -36, 
    transform: 'translateX(-50%)',
    background: '#0b1329',
    border: '1px solid var(--border-bright)',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
    pointerEvents: 'none', // Prevents mouse event flickering
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '30%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
    animation: 'scan 3s linear infinite',
  },
  tickRow: {
    position: 'relative',
    height: 20,
    marginTop: 4,
  },
  tick: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  tickLine: {
    width: 1,
    height: 6,
    background: 'var(--border-bright)',
  },
  tickLabel: {
    fontSize: 9,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    whiteSpace: 'nowrap',
  },
  geneLabelWrap: {
    position: 'absolute',
    top: 36,
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    zIndex: 2,
  },
  geneLabelLine: {
    width: 1,
    height: 10,
    background: 'var(--accent-green)',
  },
  geneLabel: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--accent-green)',
    borderRadius: 4,
    padding: '2px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
  geneLabelText: {
    color: 'var(--accent-green)',
    fontSize: 11,
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
  },
  geneLabelPos: {
    color: 'var(--text-muted)',
    fontSize: 9,
    fontFamily: 'var(--font-mono)',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    paddingTop: 16,
    borderTop: '1px solid var(--border)',
    marginTop: 8,
  },
};