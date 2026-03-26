import asyncio
from playwright.async_api import async_playwright
import os

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # 1. Login Screen
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await page.goto('http://localhost:5000/login')
        await page.screenshot(path='final_login_desktop.png')
        print("Login screenshot saved.")

        # 2. Dashboard - Admin (Presidente)
        await page.fill('#username', 'presidência')
        await page.fill('#password', '@PresidenciaMW2026!')
        await page.click('button[type="submit"]')
        await page.wait_for_url('**/inicio')
        await asyncio.sleep(2) # Wait for data
        await page.screenshot(path='final_dashboard_admin.png')

        # Open User Menu to check Theme Toggle
        await page.click('#userMenuBtn')
        await asyncio.sleep(0.5)
        await page.screenshot(path='final_user_menu_admin.png')
        print("Admin dashboard screenshots saved.")

        # 3. Dashboard - Implantação (Anonymized)
        imp_page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await imp_page.goto('http://localhost:5000/login')
        await imp_page.fill('#username', 'implantação')
        await imp_page.fill('#password', '@ImplantaçãoMW2026!')
        await imp_page.click('button[type="submit"]')
        await imp_page.wait_for_url('**/inicio')
        await asyncio.sleep(2)
        await imp_page.screenshot(path='final_dashboard_imp.png')
        print("Implantação dashboard screenshot saved.")

        # 4. Mobile Layout
        mobile_page = await browser.new_page(viewport={'width': 375, 'height': 812})
        await mobile_page.goto('http://localhost:5000/login')
        await mobile_page.fill('#username', 'presidência')
        await mobile_page.fill('#password', '@PresidenciaMW2026!')
        await mobile_page.click('button[type="submit"]')
        await mobile_page.wait_for_url('**/inicio')
        await asyncio.sleep(2)
        await mobile_page.screenshot(path='final_mobile_dashboard.png')

        # Open Drawer
        await mobile_page.click('#menuToggle')
        await asyncio.sleep(0.5)
        await mobile_page.screenshot(path='final_mobile_drawer.png')
        print("Mobile screenshots saved.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
