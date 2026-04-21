from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://localhost:4321", wait_until="networkidle", timeout=30000)
    time.sleep(2)

    page.keyboard.press("Escape")
    time.sleep(2)

    # Hide Astro dev toolbar so it doesn't intercept clicks
    page.evaluate("document.querySelector('astro-dev-toolbar')?.remove()")

    page.screenshot(path="screenshots/now-hub.png")
    print("Hub captured")

    tech_btn = page.locator('[data-target="tech"]')
    if tech_btn.count() > 0:
        tech_btn.first.click(force=True)
        time.sleep(2)
        page.screenshot(path="screenshots/now-tech-hero.png")
        print("Tech hero captured")

        inner = page.locator("#kore-node-tech .kore-world-inner")
        if inner.count() > 0:
            scroll_sections = [
                (600, "now-tech-scroll1", 2),
                (1063, "now-tech-archon", 2),
                (2157, "now-tech-aether", 2),
                (3221, "now-tech-axon", 2),
                (4400, "now-tech-metrics", 5),
                (5600, "now-tech-timeline", 2),
                (9000, "now-tech-contact", 2),
            ]
            for scroll_pos, name, wait in scroll_sections:
                inner.first.evaluate(f"el => el.scrollTop = {scroll_pos}")
                time.sleep(wait)
                # Force-complete counter animations for metrics section
                if "metrics" in name:
                    page.evaluate("""() => {
                        document.querySelectorAll('.counter-value').forEach(el => {
                            const final = el.getAttribute('data-final');
                            if (final) el.textContent = final;
                        });
                    }""")
                page.screenshot(path=f"screenshots/{name}.png")
                print(f"{name} captured")

    design_btn = page.locator('[data-target="design"]')
    if design_btn.count() > 0:
        design_btn.first.click(force=True)
        time.sleep(2)
        page.screenshot(path="screenshots/now-design.png")
        print("Design captured")

    biz_btn = page.locator('[data-target="business"]')
    if biz_btn.count() > 0:
        biz_btn.first.click(force=True)
        time.sleep(2)
        page.screenshot(path="screenshots/now-business.png")
        print("Business captured")

    browser.close()
    print("Done!")
