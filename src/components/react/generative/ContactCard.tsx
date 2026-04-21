const LINKS = [
  { label: 'EMAIL', value: 'tahaa755@gmail.com', href: 'mailto:tahaa755@gmail.com' },
  { label: 'GITHUB', value: '/SufficientDaikon', href: 'https://github.com/SufficientDaikon' },
  { label: 'LINKEDIN', value: '/ahmed-taha225', href: 'https://linkedin.com/in/ahmed-taha225' },
  { label: 'LOCATION', value: 'CAIRO, EGYPT', href: null },
  { label: 'AVAILABILITY', value: 'OPEN TO REMOTE ROLES', href: null },
]

export default function ContactCard() {
  return (
    <div style={{ marginTop: '12px', background: '#201f1f', outline: '1px solid rgba(59,73,75,0.25)', padding: '16px' }}>
      <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#00F0FF', display: 'block', marginBottom: '14px' }}>
        CONTACT DOSSIER
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(59,73,75,0.1)' }}>
        {LINKS.map(l => (
          <div key={l.label} style={{ background: '#0e0e0e', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#849495' }}>
              {l.label}
            </span>
            {l.href ? (
              <a
                href={l.href}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener"
                style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#00F0FF', textDecoration: 'none' }}
              >
                {l.value}
              </a>
            ) : (
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#E5E2E1' }}>
                {l.value}
              </span>
            )}
          </div>
        ))}
      </div>
      <a
        href="mailto:tahaa755@gmail.com"
        style={{ display: 'block', marginTop: '12px', textAlign: 'center', fontFamily: "'Space Grotesk', monospace", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#00363A', background: '#00F0FF', padding: '10px', textDecoration: 'none', fontWeight: 600 }}
      >
        INITIATE CONTACT
      </a>
    </div>
  )
}
