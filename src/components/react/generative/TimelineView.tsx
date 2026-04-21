const ENTRIES = [
  { year: '2025', title: 'COPILOT ECOSYSTEM', status: 'SHIPPED', desc: '17 agents, 4-agent SDD CLI pipeline, full software lifecycle automated.' },
  { year: '2024', title: 'ARCHON DEPLOYED', status: 'PRODUCTION', desc: '83 skills, 10 agents, 5 AI platforms. Cross-platform, MIT licensed.' },
  { year: '2024', title: 'AXON LANGUAGE', status: 'ACTIVE', desc: 'ML-first systems language in Rust. Full lexer, parser, borrow checker.' },
  { year: '2024', title: 'AETHER FRAMEWORK', status: 'PAUSED', desc: '28 subsystems, autonomous multi-agent orchestration on Bun + TypeScript.' },
  { year: '2023', title: 'FULL-STACK ERA', status: 'SHIPPED', desc: 'HugBrowse (Tauri+React+Rust), Django, Go, Spring Boot APIs. Production across the stack.' },
  { year: '2020', title: 'FIRST COMMIT', status: 'ORIGIN', desc: '6 years → 62 repos, 11 languages, trajectory from web apps to autonomous systems.' },
]

function statusColor(s: string) {
  if (s === 'PRODUCTION' || s === 'ACTIVE' || s === 'SHIPPED') return '#00F0FF'
  if (s === 'PAUSED') return '#fbbf24'
  return '#849495'
}

export default function TimelineView() {
  return (
    <div style={{ marginTop: '12px', background: '#201f1f', outline: '1px solid rgba(59,73,75,0.25)', padding: '16px' }}>
      <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#00F0FF', display: 'block', marginBottom: '14px' }}>
        OPERATION HISTORY
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ENTRIES.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '9px', color: '#849495', width: '32px', flexShrink: 0, paddingTop: '1px' }}>
              {e.year}
            </span>
            <div style={{ width: '1px', background: 'rgba(0,240,255,0.15)', alignSelf: 'stretch', flexShrink: 0, marginTop: '3px' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '10px', fontWeight: 600, color: '#E5E2E1', letterSpacing: '0.05em' }}>
                  {e.title}
                </span>
                <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '7px', letterSpacing: '0.15em', textTransform: 'uppercase', color: statusColor(e.status) }}>
                  {e.status}
                </span>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: '#849495', lineHeight: 1.5, margin: 0 }}>
                {e.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
