import os
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Get the absolute path to the HTML file
    # This is necessary because playwright runs from a different working directory
    html_file_path = os.path.abspath('Drigolarveo.html')

    page.goto(f"file://{html_file_path}")

    # 1. Change board size to 10x10
    width_input = page.locator("#board-width-input")
    height_input = page.locator("#board-height-input")
    apply_button = page.locator("#apply-size-button")

    width_input.fill("10")
    height_input.fill("10")
    apply_button.click()

    # Wait for the board to be recreated
    # We can check the number of squares
    expect(page.locator(".square")).to_have_count(100)

    page.screenshot(path="jules-scratch/verification/resized_board.png")

    # 2. Reset the puzzle and check if board is 8x8
    reset_button = page.locator("#reset-button")
    reset_button.click()

    # Wait for the board to be recreated
    expect(page.locator(".square")).to_have_count(64)

    page.screenshot(path="jules-scratch/verification/reset_board.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
