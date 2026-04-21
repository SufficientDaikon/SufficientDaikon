from playwright.sync_api import sync_playwright
import time, os

os.makedirs("screenshots", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://localhost:4322/", timeout=30000)
    time.sleep(2)
    page.keyboard.press("Escape")
    time.sleep(2)
    page.screenshot(path="screenshots/diag-hub.png", full_page=False)
    print("Hub screenshot taken")

    # Navigate to Engineer world
    page.click('[data-target="tech"]', force=True)
    time.sleep(2)
    page.screenshot(path="screenshots/diag-tech-hero.png", full_page=False)
    print("Tech hero screenshot taken")

    # Scroll down in the tech world to see CaseStudy sections
    page.evaluate('document.querySelector(".kore-world-inner")?.scrollBy(0, 900)')
    time.sleep(1)
    page.screenshot(path="screenshots/diag-tech-scroll1.png", full_page=False)
    print("Tech scroll1 screenshot taken")

    page.evaluate('document.querySelector(".kore-world-inner")?.scrollBy(0, 900)')
    time.sleep(1)
    page.screenshot(path="screenshots/diag-tech-scroll2.png", full_page=False)
    print("Tech scroll2 screenshot taken")

    page.evaluate('document.querySelector(".kore-world-inner")?.scrollBy(0, 900)')
    time.sleep(1)
    page.screenshot(path="screenshots/diag-tech-scroll3.png", full_page=False)
    print("Tech scroll3 screenshot taken")

    browser.close()
    print("Done")
