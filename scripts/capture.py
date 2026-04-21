from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("https://ahmed-taha-portfolio.pages.dev/", timeout=30000)

    time.sleep(2)
    page.keyboard.press("Escape")
    time.sleep(3)

    page.screenshot(path="screenshots/current-hub.png", full_page=False)
    print("Hub screenshot taken")

    nav_btns = page.locator("[data-target]").all()
    print(f"Found {len(nav_btns)} nav buttons")
    for btn in nav_btns:
        txt = btn.inner_text()
        target = btn.get_attribute("data-target")
        print(f"  Button: {txt} -> {target}")

    # Tech world
    tech_btn = page.locator('[data-target="tech"]')
    if tech_btn.count() > 0:
        tech_btn.first.click(force=True)
        time.sleep(2)
        page.screenshot(path="screenshots/current-tech.png", full_page=False)
        print("Tech world screenshot taken")

        for i, scroll_name in enumerate(["scrolled", "projects", "metrics", "timeline", "contact"]):
            page.evaluate("document.querySelector('.kore-world-inner')?.scrollBy(0, 900)")
            time.sleep(1)
            page.screenshot(path=f"screenshots/current-tech-{scroll_name}.png", full_page=False)
            print(f"Tech {scroll_name} screenshot taken")

    # Design world
    design_btn = page.locator('[data-target="design"]')
    if design_btn.count() > 0:
        design_btn.first.click(force=True)
        time.sleep(2)
        page.screenshot(path="screenshots/current-design.png", full_page=False)
        print("Design world screenshot taken")

    # Business world
    biz_btn = page.locator('[data-target="business"]')
    if biz_btn.count() > 0:
        biz_btn.first.click(force=True)
        time.sleep(2)
        page.screenshot(path="screenshots/current-business.png", full_page=False)
        print("Business world screenshot taken")

    browser.close()
    print("Done")
