"""Debug: find section scroll positions in the tech world."""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.goto("http://localhost:4321", wait_until="networkidle", timeout=30000)
    time.sleep(2)
    pg.keyboard.press("Escape")
    time.sleep(2)
    pg.evaluate("if(document.querySelector('astro-dev-toolbar')) document.querySelector('astro-dev-toolbar').remove()")
    
    tech_btn = pg.locator('[data-target="tech"]')
    tech_btn.first.click(force=True)
    time.sleep(2)
    
    inner = pg.locator("#kore-node-tech .kore-world-inner")
    heights = inner.first.evaluate("""el => {
        const sections = el.querySelectorAll('section');
        return Array.from(sections).map(s => ({id: s.id, top: s.offsetTop, h: s.offsetHeight}))
    }""")
    for h in heights:
        print(f"  {h['id']:20s} top={h['top']:5d}  height={h['h']:5d}")
    
    total = inner.first.evaluate("el => el.scrollHeight")
    print(f"Total scroll height: {total}")
    b.close()
