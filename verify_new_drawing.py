from playwright.sync_api import sync_playwright
import time
import os

def test_features():
    os.makedirs("/home/jules/verification", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:5173')

        # Wait for the app to load
        page.wait_for_selector('input[value="Ma Salle"]')

        # In RightPanel, section Murs & Dessin is open by default.
        # But just in case, check if the button is visible, if not click accordion.
        activate_btn = page.locator('button', has_text="Activer le mode dessin")
        if not activate_btn.is_visible():
            page.locator('button', has_text="Murs & Dessin").click()
            page.wait_for_timeout(500)

        # Now click "Activer le mode dessin"
        activate_btn.click()
        page.wait_for_timeout(500)

        # Draw a line on the canvas
        page.mouse.move(300, 300)
        page.mouse.down()
        page.mouse.move(500, 500)
        page.mouse.up()
        page.wait_for_timeout(500)

        # Click the rectangle button to switch tools
        rect_btn = page.locator('button[title="Dessiner des rectangles"]')
        rect_btn.click()
        page.wait_for_timeout(500)

        # Ensure fill color is transparent initially according to our store

        # Draw a rectangle on the canvas
        page.mouse.move(600, 300)
        page.mouse.down()
        page.mouse.move(800, 500)
        page.mouse.up()
        page.wait_for_timeout(500)

        page.screenshot(path="/home/jules/verification/canvas_drawing_tools.png")
        browser.close()

if __name__ == "__main__":
    test_features()
