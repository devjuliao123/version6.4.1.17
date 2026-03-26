import asyncio
from playwright.async_api import async_playwright
import os
import time

async def verify_dashboard():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch()

        # Desktop Verification
        page = await browser.new_page(viewport={'width': 1920, 'height': 1080})

        print("Logging in (Desktop)...")
        await page.goto('http://localhost:5000/login')
        await page.fill('#username', 'presidência')
        await page.fill('#password', '@PresidenciaMW2026!')
        await page.click('button[type="submit"]')

        # Wait for dashboard to load
        await page.wait_for_url('**/inicio')
        # Wait for data to load (KPIs should have values other than R$ 0)
        try:
            await page.wait_for_selector('#valorTotal:not(:has-text("R$ 0"))', timeout=30000)
            print("Dashboard data loaded successfully.")
        except Exception as e:
            print(f"Warning: Dashboard data didn't load (maybe empty sheets?). Continuing anyway. Error: {e}")

        # Take Desktop Screenshot
        await page.screenshot(path='verify_desktop_dashboard.png', full_page=True)
        print("Desktop screenshot saved.")

        # Test Theme Toggle (Desktop) - Updated ID
        # Since the checkbox itself might be hidden (standard for sliders), click the label or the slider
        print("Testing theme toggle...")
        await page.click('label[for="themeCheckbox"]', force=True)
        await asyncio.sleep(1) # Wait for transition
        await page.screenshot(path='verify_desktop_dark_mode.png', full_page=True)

        # Mobile Verification
        mobile_page = await browser.new_page(
            viewport={'width': 375, 'height': 812},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
        )

        print("Logging in (Mobile)...")
        await mobile_page.goto('http://localhost:5000/login')
        await mobile_page.fill('#username', 'presidência')
        await mobile_page.fill('#password', '@PresidenciaMW2026!')
        await mobile_page.click('button[type="submit"]')
        await mobile_page.wait_for_url('**/inicio')
        try:
            await mobile_page.wait_for_selector('#valorTotal:not(:has-text("R$ 0"))', timeout=15000)
        except:
            pass

        # Open Menu (Mobile)
        print("Testing mobile menu...")
        await mobile_page.click('#menuToggle')
        await asyncio.sleep(0.5)
        await mobile_page.screenshot(path='verify_mobile_menu.png')

        # Close Menu by clicking overlay (Mobile) - Use force: True to avoid interception
        print("Closing mobile menu via overlay...")
        await mobile_page.click('#menuOverlay', force=True)
        await asyncio.sleep(0.5)
        await mobile_page.screenshot(path='verify_mobile_closed.png')

        await browser.close()
        print("Verification complete.")

if __name__ == "__main__":
    asyncio.run(verify_dashboard())
