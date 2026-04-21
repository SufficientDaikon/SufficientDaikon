"""Targeted Gemini audit on problem sections."""
import os
from google import genai
from google.genai import types

client = genai.Client(api_key='AIzaSyAymoFBMFkJj-Uma-0_ciAOSKFRuewXNOA')

sections = [
    ('now-tech-scroll1.png', 'Tech Ticker + First Project (prev 7/10 truncation)'),
    ('now-tech-metrics.png', 'Metrics + Radar (prev 6/10 - data inconsistency + decorative radar)'),
    ('now-tech-timeline.png', 'Timeline (prev 9/10 - faint labels)'),
]

for filename, label in sections:
    path = os.path.join('screenshots', filename)
    with open(path, 'rb') as f:
        img_bytes = f.read()
    
    parts = [
        types.Part(text=f'You are an Awwwards judge scoring "{label}". Score 1-10. Check: 1) Is all text readable? 2) Do numbers/data look correct? 3) Is the radar meaningful (has labeled domains)? 4) Any truncation? Format: SCORE: X/10 | 3 sentences max.'),
        types.Part(inline_data=types.Blob(data=img_bytes, mime_type='image/png'))
    ]
    
    response = client.models.generate_content(
        model='gemini-3.1-pro-preview',
        contents=[types.Content(parts=parts, role='user')]
    )
    print(f'{label}:')
    print(response.text.strip())
    print()
