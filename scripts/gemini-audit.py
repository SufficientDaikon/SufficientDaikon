"""Full 9-section Gemini vision audit."""
import os
from google import genai
from google.genai import types

client = genai.Client(api_key='AIzaSyAymoFBMFkJj-Uma-0_ciAOSKFRuewXNOA')

sections = [
    ('now-hub.png', 'Hub / WorldSelector'),
    ('now-tech-hero.png', 'Tech World Hero'),
    ('now-tech-scroll1.png', 'Tech Ticker + First Project'),
    ('now-tech-archon.png', 'Archon Case Study'),
    ('now-tech-aether.png', 'Aether Case Study'),
    ('now-tech-axon.png', 'Axon Case Study'),
    ('now-tech-metrics.png', 'Metrics + Capability Matrix + Radar'),
    ('now-tech-timeline.png', 'Timeline'),
    ('now-tech-contact.png', 'Contact + Terminal'),
    ('now-design.png', 'Design World'),
    ('now-business.png', 'Business World'),
]

for filename, label in sections:
    path = os.path.join('screenshots', filename)
    with open(path, 'rb') as f:
        img_bytes = f.read()
    
    parts = [
        types.Part(text=f'You are an Awwwards judge. Score this portfolio section: "{label}". Score 1-10. Be extremely specific. 3 sentences max. Format: SCORE: X/10 | brief feedback'),
        types.Part(inline_data=types.Blob(data=img_bytes, mime_type='image/png'))
    ]
    
    response = client.models.generate_content(
        model='gemini-3.1-pro-preview',
    print()
