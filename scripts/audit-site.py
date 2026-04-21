"""Full audit of the live site - what actually renders, performance, visual systems."""
from playwright.sync_api import sync_playwright
import json, time, os

os.makedirs("screenshots", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})

    # Track performance
    perf_entries = []
    console_msgs = []
    page.on("console", lambda msg: console_msgs.append({"type": msg.type, "text": msg.text[:200]}))

    start = time.time()
    page.goto("https://ahmed-taha-portfolio.pages.dev/", timeout=60000)
    load_time = time.time() - start
    page.wait_for_timeout(3000)

    # Skip boot
    page.keyboard.press("Escape")
    page.wait_for_timeout(2000)

    print(f"=== Page load: {load_time:.2f}s ===")

    # Remove dev toolbar
    page.evaluate("document.querySelector('astro-dev-toolbar')?.remove()")

    # Screenshot 1: Hub world (initial)
    page.screenshot(path="screenshots/audit-hub.png")
    print("Screenshot: hub")

    # Check what visual systems actually exist
    systems = page.evaluate("""() => {
        const checks = {
            bootScreen: !!document.getElementById('boot-screen'),
            codeRainCanvas: !!document.getElementById('code-rain-canvas'),
            particleCanvas: !!document.getElementById('particle-canvas'),
            asciiField: !!document.getElementById('ascii-field'),
            crtOverlay: !!document.querySelector('.crt-overlay'),
            crtVignette: !!document.querySelector('.crt-vignette'),
            noiseOverlay: !!document.querySelector('.noise-overlay'),
            watermark: !!document.querySelector('.watermark'),
            cursorDot: !!document.getElementById('cursor-dot'),
            cursorRing: !!document.getElementById('cursor-ring'),
            cursorGlow: !!document.getElementById('cursor-glow'),
            crosshairH: !!document.getElementById('crosshair-h'),
            crosshairV: !!document.getElementById('crosshair-v'),
            scrollProgressBar: !!document.getElementById('scroll-progress-bar'),
            koreViewport: !!document.getElementById('kore-viewport'),
            koreCamera: !!document.getElementById('kore-camera'),
            koreUniverse: !!document.getElementById('kore-universe'),
            koreNodeHub: !!document.getElementById('kore-node-hub'),
            koreNodeTech: !!document.getElementById('kore-node-tech'),
            koreNodeDesign: !!document.getElementById('kore-node-design'),
            koreNodeBusiness: !!document.getElementById('kore-node-business'),
            worldSelector: !!document.querySelector('.world-selector, [class*="world-select"]'),
            synapses: document.querySelectorAll('.synapse-path, [class*="synapse"]').length,
            heroSection: !!document.getElementById('hero'),
            caseStudies: document.querySelectorAll('[class*="case-study"], [class*="casestudy"]').length,
            metricsSection: !!document.querySelector('[class*="metric"]'),
            timeline: !!document.querySelector('[class*="timeline"]'),
            contactSection: !!document.querySelector('[class*="contact"]'),
            footer: !!document.querySelector('footer'),
            navBar: !!document.getElementById('kore-nav'),
            header: !!document.querySelector('header'),
            sidebar: !!document.querySelector('[class*="sidebar"]'),
        };
        return checks;
    }""")
    print("\n=== Visual Systems Present ===")
    for k, v in systems.items():
        status = "✅" if v else "❌"
        print(f"  {status} {k}: {v}")

    # Check CSS visual effects
    css_systems = page.evaluate("""() => {
        const root = document.documentElement;
        const styles = getComputedStyle(root);
        const sheets = Array.from(document.styleSheets);
        let ruleCount = 0;
        let forensicGrid = false;
        let volumetricOrbs = false;
        let hudBrackets = false;
        let hexStream = false;
        let scanlines = false;
        let empRings = false;
        let techChips = false;

        try {
            for (const sheet of sheets) {
                try {
                    const rules = Array.from(sheet.cssRules || []);
                    ruleCount += rules.length;
                    for (const rule of rules) {
                        const text = rule.cssText || '';
                        if (text.includes('forensic-grid')) forensicGrid = true;
                        if (text.includes('volumetric-orb')) volumetricOrbs = true;
                        if (text.includes('hud-bracket')) hudBrackets = true;
                        if (text.includes('hex-stream')) hexStream = true;
                        if (text.includes('scanline')) scanlines = true;
                        if (text.includes('emp-ring')) empRings = true;
                        if (text.includes('tech-chip')) techChips = true;
                    }
                } catch(e) {}
            }
        } catch(e) {}

        return {
            totalCSSRules: ruleCount,
            forensicGrid, volumetricOrbs, hudBrackets,
            hexStream, scanlines, empRings, techChips
        };
    }""")
    print("\n=== CSS Visual Systems ===")
    for k, v in css_systems.items():
        status = "✅" if v else "❌"
        print(f"  {status} {k}: {v}")

    # Navigate to tech world
    page.evaluate("document.querySelector('[data-target=\"tech\"]')?.click()")
    page.wait_for_timeout(2000)
    page.screenshot(path="screenshots/audit-tech-top.png")
    print("\nScreenshot: tech-top")

    # Scroll tech world
    page.evaluate("document.querySelector('.kore-world-inner')?.scrollBy(0, 800)")
    page.wait_for_timeout(1000)
    page.screenshot(path="screenshots/audit-tech-mid.png")
    print("Screenshot: tech-mid")

    page.evaluate("document.querySelector('.kore-world-inner')?.scrollBy(0, 1500)")
    page.wait_for_timeout(1000)
    page.screenshot(path="screenshots/audit-tech-bottom.png")
    print("Screenshot: tech-bottom")

    # Navigate to design world
    page.evaluate("document.querySelector('[data-target=\"design\"]')?.click()")
    page.wait_for_timeout(2000)
    page.screenshot(path="screenshots/audit-design.png")
    print("Screenshot: design")

    # Navigate to business world
    page.evaluate("document.querySelector('[data-target=\"business\"]')?.click()")
    page.wait_for_timeout(2000)
    page.screenshot(path="screenshots/audit-business.png")
    print("Screenshot: business")

    # Performance metrics
    perf = page.evaluate("""() => {
        const entries = performance.getEntriesByType('resource');
        const jsSize = entries.filter(e => e.name.includes('.js')).reduce((a, e) => a + (e.transferSize || 0), 0);
        const cssSize = entries.filter(e => e.name.includes('.css')).reduce((a, e) => a + (e.transferSize || 0), 0);
        const imgSize = entries.filter(e => e.name.includes('.webp') || e.name.includes('.png')).reduce((a, e) => a + (e.transferSize || 0), 0);
        const totalSize = entries.reduce((a, e) => a + (e.transferSize || 0), 0);
        
        // Count canvases that are actually drawing
        const canvases = document.querySelectorAll('canvas');
        const canvasInfo = Array.from(canvases).map(c => ({
            id: c.id,
            width: c.width,
            height: c.height,
            visible: getComputedStyle(c).display !== 'none' && getComputedStyle(c).opacity !== '0'
        }));

        return {
            jsKB: Math.round(jsSize / 1024),
            cssKB: Math.round(cssSize / 1024),
            imgKB: Math.round(imgSize / 1024),
            totalKB: Math.round(totalSize / 1024),
            resourceCount: entries.length,
            canvases: canvasInfo,
            domNodes: document.querySelectorAll('*').length
        };
    }""")
    print(f"\n=== Performance ===")
    print(f"  JS: {perf['jsKB']}KB | CSS: {perf['cssKB']}KB | Images: {perf['imgKB']}KB | Total: {perf['totalKB']}KB")
    print(f"  Resources: {perf['resourceCount']} | DOM nodes: {perf['domNodes']}")
    print(f"  Canvases: {json.dumps(perf['canvases'], indent=4)}")

    print(f"\n=== Console errors ===")
    for m in console_msgs:
        if m["type"] == "error":
            print(f"  {m['text'][:150]}")

    browser.close()
    print("\nDone.")
