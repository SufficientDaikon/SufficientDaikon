const DATA = {
  archon: {
    name: 'ARCHON', codename: 'THE ARCHITECT',
    status: 'PRODUCTION' as const,
    stats: [
      { label: 'SKILLS', value: '83' },
      { label: 'AGENTS', value: '10' },
      { label: 'PLATFORMS', value: '5 AI EDITORS' },
      { label: 'LICENSE', value: 'MIT' },
    ],
    desc: 'Cross-platform AI skills framework. Write once, deploy across Claude, Copilot, Cursor, Windsurf, and Antigravity.',
    href: 'https://github.com/SufficientDaikon',
  },
  aether: {
    name: 'AETHER', codename: 'THE NEXUS',
    status: 'PAUSED' as const,
    stats: [
      { label: 'SUBSYSTEMS', value: '28' },
      { label: 'RUNTIME', value: 'BUN + TS' },
      { label: 'ARCHITECTURE', value: 'MULTI-AGENT LLM' },
      { label: 'STATUS', value: 'ARCH. COMPLETE' },
    ],
    desc: 'Autonomous multi-agent orchestration framework. Agents that coordinate other agents — recursively.',
    href: 'https://github.com/SufficientDaikon',
  },
  axon: {
    name: 'AXON', codename: 'THE COMPILER',
    status: 'ACTIVE' as const,
    stats: [
      { label: 'IMPL', value: 'RUST' },
      { label: 'COMPONENTS', value: 'LEXER + PARSER + BORROW' },
      { label: 'TARGET', value: 'ML / GPU-NATIVE' },
      { label: 'STATUS', value: 'RESEARCH' },
    ],
    desc: 'ML/AI-first systems language built from scratch. Compile-time tensor shapes, ownership safety, GPU execution semantics.',
    href: 'https://github.com/SufficientDaikon',
  },
}

interface Props {
  project: keyof typeof DATA
}

export default function ProjectCard({ project }: Props) {
  const d = DATA[project] ?? DATA.archon
  const active = d.status === 'PRODUCTION' || d.status === 'ACTIVE'

  return (
    <div
      className="mt-3 p-5 space-y-4"
      style={{ background: '#201f1f', outline: '1px solid rgba(59,73,75,0.25)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '8px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#849495', display: 'block', marginBottom: '2px' }}
          >
            {d.codename}
          </span>
          <span
            style={{ fontFamily: "'Manrope', sans-serif", fontSize: '22px', fontWeight: 800, color: '#E5E2E1', lineHeight: 1 }}
          >
            {d.name}
          </span>
        </div>
        <span
          style={{
            fontFamily: "'Space Grotesk', monospace",
            fontSize: '8px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            color: active ? '#00F0FF' : '#fbbf24',
            background: active ? 'rgba(0,240,255,0.08)' : 'rgba(251,191,36,0.08)',
            flexShrink: 0,
          }}
        >
          {d.status}
        </span>
      </div>

      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#849495', lineHeight: 1.6 }}>
        {d.desc}
      </p>

      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(59,73,75,0.15)' }}
      >
        {d.stats.map(s => (
          <div key={s.label} style={{ background: '#0e0e0e', padding: '10px 12px' }}>
            <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '7px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3B494B', display: 'block' }}>
              {s.label}
            </span>
            <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '11px', fontWeight: 600, color: '#E5E2E1' }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      <a
        href={d.href}
        target="_blank"
        rel="noopener"
        style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#00F0FF', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>open_in_new</span>
        VIEW ON GITHUB
      </a>
    </div>
  )
}
