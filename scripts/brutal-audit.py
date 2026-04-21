"""
Brutal Gemini 2.5 Pro vision audit of the LIVE production site.
Screenshots the actual deployed site, feeds each to Gemini for honest scoring.
"""
import os, time, base64
from playwright.sync_api import sync_playwright
from google import genai
from google.genai import types

API_KEY = "AIzaSyAymoFBMFkJj-Uma-0_ciAOSKFRuewXNOA"
client = genai.Client(api_key=API_KEY)
MODEL = "gemini-3.1-pro-preview"

BRUTAL_PROMPT = """You are the most demanding Awwwards judge alive. You've seen 10,000 portfolios. 
You are BRUTALLY honest. No sugarcoating. No diplomacy. 

Analyze this portfolio screenshot. Score 1-10 where:
- 1-3: Embarrassing, amateur
- 4-5: Generic, forgettable  
- 6-7: Decent but not award-worthy
- 8-9: Strong, close to Awwwards level
- 10: Groundbreaking, never seen before

For EACH issue, be extremely specific:
- What's wrong (exact location on screen)
- Why it fails (visual design principle violated)
- What would fix it

Also specifically check:
1. Are there ANY canvas effects visible? (particles, ASCII rain, neural networks, code rain)
2. Is the custom cursor visible?
3. Are there crosshair lines following the mouse?
4. Do any animations appear to be running?
5. Is there visual depth or does it look FLAT?
6. Are the images actually good or AI slop?
7. Does this look like a mission control interface or a generic dark template?

Format: SCORE: X/10 then detailed breakdown."""

def screenshot_and_analyze(url, actions, name, wait_after=3):
    """Take screenshot with specific nav actions, then analyze with Gemini."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(url, wait_until="networkidle", timeout=30000)
        time.sleep(2)
        
        # Skip boot
        page.keyboard.press("Escape")
        time.sleep(2)
        
        # Remove dev toolbar
        page.evaluate("document.querySelector('astro-dev-toolbar')?.remove()")
        
        # Execute actions
        for action in actions:
            if action[0] == "click":
                el = page.locator(action[1])
                if el.count() > 0:
                    el.first.click(force=True)
            elif action[0] == "scroll":
                inner = page.locator("#kore-node-tech .kore-world-inner")
                if inner.count() > 0:
                    inner.first.evaluate(f"el => el.scrollTop = {action[1]}")
            elif action[0] == "wait":
                time.sleep(action[1])
            elif action[0] == "eval":
                page.evaluate(action[1])
        
        time.sleep(wait_after)
        
        # Check canvas state
        canvas_info = page.evaluate("""() => {
            const canvases = document.querySelectorAll('canvas');
            return {
                count: canvases.length,
                details: Array.from(canvases).map(c => ({
                    id: c.id, 
                    class: c.className,
                    width: c.width, 
                    height: c.height,
                    display: getComputedStyle(c).display,
                    opacity: getComputedStyle(c).opacity,
                    visibility: getComputedStyle(c).visibility,
                    zIndex: getComputedStyle(c).zIndex,
                    position: getComputedStyle(c).position,
                }))
            };
        }""")
        
        path = f"screenshots/brutal-{name}.png"
        page.screenshot(path=path)
        print(f"📸 {name}: captured ({canvas_info['count']} canvases found)")
        for c in canvas_info['details']:
            print(f"   Canvas: id={c['id']} class={c['class']} {c['width']}x{c['height']} display={c['display']} opacity={c['opacity']} z={c['zIndex']}")
        
        browser.close()
        return path

def analyze_with_gemini(image_path, section_name):
    """Feed screenshot to Gemini 2.5 Pro for brutal analysis."""
    with open(image_path, 'rb') as f:
        img_bytes = f.read()
    
    parts = [
        types.Part(text=f'Section: "{section_name}"\n\n{BRUTAL_PROMPT}'),
        types.Part(inline_data=types.Blob(data=img_bytes, mime_type='image/png'))
    ]
    
    response = client.models.generate_content(
        model=MODEL,
        contents=[types.Content(parts=parts, role='user')]
    )
    return response.text.strip()

# Define all sections to capture
URL = "https://ahmed-taha-portfolio.pages.dev/"

sections = [
    ("hub", [("wait", 1)], "Hub / WorldSelector"),
    ("tech-hero", [("click", '[data-target="tech"]'), ("wait", 2)], "Tech World Hero"),
    ("archon", [("click", '[data-target="tech"]'), ("wait", 2), ("scroll", 1063), ("wait", 2)], "Archon Case Study"),
    ("aether", [("click", '[data-target="tech"]'), ("wait", 2), ("scroll", 2157), ("wait", 2)], "Aether Case Study"),
    ("metrics", [("click", '[data-target="tech"]'), ("wait", 2), ("scroll", 4400), ("wait", 3), 
                 ("eval", "document.querySelectorAll('.counter-value').forEach(el => { const f = el.getAttribute('data-final'); if (f) el.textContent = f; })")], 
     "Metrics + Radar"),
    ("contact", [("click", '[data-target="tech"]'), ("wait", 2), ("scroll", 9000), ("wait", 2)], "Contact + Terminal"),
    ("design", [("click", '[data-target="design"]'), ("wait", 2)], "Design World"),
    ("business", [("click", '[data-target="business"]'), ("wait", 2)], "Business World"),
]

print("=" * 60)
print("BRUTAL GEMINI 2.5 PRO AUDIT — LIVE PRODUCTION SITE")
print("=" * 60)
print()

results = []
for name, actions, label in sections:
    print(f"\n{'='*40}")
    print(f"📸 Capturing: {label}")
    img_path = screenshot_and_analyze(URL, actions, name)
    
    print(f"🔍 Analyzing with Gemini 2.5 Pro...")
    analysis = analyze_with_gemini(img_path, label)
    results.append((label, analysis))
    
    print(f"\n{label}:")
    print(analysis)
    print()

print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
for label, analysis in results:
    # Extract score
    score_line = [l for l in analysis.split('\n') if 'SCORE' in l.upper()]
    score = score_line[0] if score_line else "No score found"
    print(f"  {label}: {score}")
