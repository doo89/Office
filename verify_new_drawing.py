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

        # Add a player so we can test the z-index
        page.fill('input[placeholder="Nom du joueur"]', 'Z-IndexTest')
        page.click('button:has-text("Ajouter")')
        page.wait_for_timeout(500)

        # Drop the player in the middle
        page.mouse.click(500, 500, button="right")
        page.wait_for_timeout(500)
        add_player_btn = page.locator('button:has-text("Ajouter un Joueur")')
        add_player_btn.hover()
        page.wait_for_timeout(500)
        page.click('button:has-text("Z-IndexTest")')
        page.wait_for_timeout(500)

        # Enable Grid Magnetism
        page.locator('button', has_text="Grille Magnétique").click()
        page.wait_for_timeout(500)
        page.locator('input[type="checkbox"]').nth(3).click() # 1st: Nuit, 2nd: Center, 3rd: Cycle, 4th: Grid
        page.wait_for_timeout(500)

        # In RightPanel, section Murs & Dessin
        activate_btn = page.locator('button', has_text="Activer le mode dessin")
        if not activate_btn.is_visible():
            page.locator('button', has_text="Murs & Dessin").click()
            page.wait_for_timeout(500)

        # Now click "Activer le mode dessin"
        activate_btn.click()
        page.wait_for_timeout(500)

        # Draw a big line OVER the player (it should appear BEHIND the player due to z-index)
        page.mouse.move(300, 300)
        page.mouse.down()
        page.mouse.move(700, 700)
        page.mouse.up()
        page.wait_for_timeout(500)

        # Switch to rectangle
        rect_btn = page.locator('button[title="Dessiner des rectangles"]')
        rect_btn.click()
        page.wait_for_timeout(500)

        # Draw a big rectangle OVER the player
        page.mouse.move(400, 400)
        page.mouse.down()
        page.mouse.move(600, 600)
        page.mouse.up()
        page.wait_for_timeout(500)

        page.screenshot(path="/home/jules/verification/canvas_drawing_tools.png")
        browser.close()

if __name__ == "__main__":
    test_features()
