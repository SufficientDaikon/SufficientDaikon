const GROUPS = [
  { label: 'AI / LLM', items: ['Claude', 'GPT-4', 'DeepSeek', 'LangChain', 'MCP Servers', 'OpenRouter'] },
  { label: 'LANGUAGES', items: ['TypeScript', 'Python', 'Rust', 'Go', 'GDScript', 'PowerShell'] },
  { label: 'FRAMEWORKS', items: ['Astro', 'React', 'Svelte', 'Bun', 'Django', 'Tauri'] },
  { label: 'INFRA', items: ['Cloudflare', 'Docker', 'GitHub Actions', 'Supabase', 'Redis'] },
]

export default function TechStack() {
  return (
    <div style={{ marginTop: '12px', background: '#201f1f', outline: '1px solid rgba(59,73,75,0.25)', padding: '16px' }}>
      <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#00F0FF', display: 'block', marginBottom: '14px' }}>
        TECH ARSENAL
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {GROUPS.map(g => (
          <div key={g.label}>
            <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#849495', display: 'block', marginBottom: '6px' }}>
              {g.label}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {g.items.map(item => (
                <span
                  key={item}
                  style={{
                    fontFamily: "'Space Grotesk', monospace",
                    fontSize: '9px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#C8C6C5',
                    padding: '3px 8px',
                    border: '1px solid rgba(59,73,75,0.3)',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
