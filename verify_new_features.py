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

        # 1. Add a new player template to be visible in the context menu
        # Click the color picker in player tab to see it open
        color_picker = page.locator('div[title="Couleur du joueur"]').first
        color_picker.click()
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/color_picker_open.png")

        # Select a recent color (the orange one)
        recent_colors = page.locator('button[title="#F97316"]')
        if recent_colors.count() > 0:
            recent_colors.first.click()
        else:
            # Fallback click somewhere in the custom popover to close it
            page.mouse.click(10, 10)

        # Fill player name and add
        page.fill('input[placeholder="Nom du joueur"]', 'TestPlayer1')
        page.click('button:has-text("Ajouter")')
        page.wait_for_timeout(500)

        # 3. Canvas Context Menu
        # Find the canvas and right click in the middle
        # It has onContextMenu attached.
        page.mouse.click(500, 500, button="right")
        page.wait_for_timeout(500)

        page.screenshot(path="/home/jules/verification/canvas_context_menu.png")

        # Hover over "Ajouter un Joueur"
        add_player_btn = page.locator('button:has-text("Ajouter un Joueur")')
        add_player_btn.hover()
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/canvas_context_menu_player_submenu.png")

        # Click the player to add to canvas
        page.click('button:has-text("TestPlayer1")')
        page.wait_for_timeout(500)

        # Verify player is on canvas
        page.screenshot(path="/home/jules/verification/canvas_after_player_add.png")

        # 4. Right Panel Accordions
        # Collapse Affichage
        affichage_btn = page.locator('button:has-text("Affichage")')
        affichage_btn.click()
        page.wait_for_timeout(500)

        page.screenshot(path="/home/jules/verification/right_panel_accordions.png")

        browser.close()

if __name__ == "__main__":
    test_features()
