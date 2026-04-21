const METRICS = [
  { label: 'REPOS', value: '62', sub: '51 PUBLIC / 11 PRIVATE' },
  { label: 'AI AGENTS', value: '17', sub: 'CLI · MCP · COPILOT · AUTONOMOUS' },
  { label: 'SKILLS', value: '83', sub: 'ARCHON · 5 PLATFORMS' },
  { label: 'LANGUAGES', value: '11', sub: 'TS · PY · RUST · GO · +7' },
]

const SKILLS = [
  { label: 'AI AGENT ARCHITECTURE', pct: 96 },
  { label: 'LLM ORCHESTRATION', pct: 91 },
  { label: 'FULL-STACK ENGINEERING', pct: 93 },
  { label: 'SYSTEMS PROGRAMMING', pct: 85 },
]

export default function MetricsPanel() {
  return (
    <div style={{ marginTop: '12px', background: '#201f1f', outline: '1px solid rgba(59,73,75,0.25)', padding: '16px' }}>
      <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#00F0FF', display: 'block', marginBottom: '14px' }}>
        PERFORMANCE LEDGER
      </span>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(59,73,75,0.15)', marginBottom: '16px' }}>
        {METRICS.map(m => (
          <div key={m.label} style={{ background: '#0e0e0e', padding: '12px' }}>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '26px', fontWeight: 800, color: '#E5E2E1', lineHeight: 1 }}>
              {m.value}
            </span>
            <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#849495', display: 'block', marginTop: '2px' }}>
              {m.label}
            </span>
            <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '7px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(59,73,75,0.6)', display: 'block' }}>
              {m.sub}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {SKILLS.map(s => (
          <div key={s.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#849495' }}>
                {s.label}
              </span>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '8px', color: '#00F0FF' }}>
                {s.pct}%
              </span>
            </div>
            <div style={{ height: '2px', background: '#2a2a2a' }}>
              <div style={{ height: '100%', width: `${s.pct}%`, background: '#00F0FF', boxShadow: '0 0 8px rgba(0,240,255,0.4)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
