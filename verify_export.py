from playwright.sync_api import sync_playwright
import time
import os

def test_export():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a new context with a specific download path
        download_dir = os.path.join(os.getcwd(), 'downloads')
        os.makedirs(download_dir, exist_ok=True)
        context = browser.new_context(accept_downloads=True)

        page = context.new_page()
        page.goto('http://localhost:5173')

        # Wait for the app to load
        page.wait_for_selector('input[value="Ma Salle"]')

        # Take a screenshot before clicking
        page.screenshot(path="export_before.png")

        # Click the export button
        # The button has title="Exporter l'état (JSON)"
        export_btn = page.locator('button[title="Exporter l\'état (JSON)"]')

        with page.expect_download() as download_info:
            export_btn.click()

        download = download_info.value
        download_path = os.path.join(download_dir, download.suggested_filename)
        download.save_as(download_path)

        print(f"Downloaded file: {download.suggested_filename}")

        # Read the file to ensure it's valid JSON and contains the state
        with open(download_path, 'r') as f:
            content = f.read()
            print("Download content length:", len(content))
            print("First 100 chars:", content[:100])

        browser.close()

if __name__ == "__main__":
    test_export()
