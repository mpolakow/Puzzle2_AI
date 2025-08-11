import os
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Get the absolute path to the HTML file
    html_file_path = os.path.abspath('Drigolarveo.html')

    page.goto(f"file://{html_file_path}")

    # 1. Initial load, should be 8x8
    expect(page.locator(".square")).to_have_count(64)
    page.screenshot(path="jules-scratch/verification/initial_8x8_puzzle.png")

    # 2. Load the 5x5 puzzle by calling setupPuzzle directly
    page.evaluate("setupPuzzle(3)")

    # Wait for the board to be recreated and check square count
    expect(page.locator(".square")).to_have_count(25)

    # Check that the input fields are updated
    expect(page.locator("#board-width-input")).to_have_value("5")
    expect(page.locator("#board-height-input")).to_have_value("5")

    page.screenshot(path="jules-scratch/verification/resized_5x5_puzzle.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
