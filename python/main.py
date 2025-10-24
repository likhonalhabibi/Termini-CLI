import os
import base64
from openai import OpenAI
from playwright.sync_api import sync_playwright
from cua_loop import computer_use_loop, get_screenshot

# It's recommended to set the API key as an environment variable
# client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
# For this example, I'll assume it's set in the environment
client = OpenAI()

def main():
    """
    Main function to initialize the browser, send the initial request,
    and start the computer-using agent loop.
    """
    user_prompt = "Navigate to bing.com and search for the latest news on OpenAI."

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            chromium_sandbox=True,
            env={},
            args=[
                "--disable-extensions",
                "--disable-file-system"
            ]
        )
        page = browser.new_page()
        page.set_viewport_size({"width": 1024, "height": 768})
        page.goto("https://www.google.com") # Start at a blank page

        print("Capturing initial screenshot...")
        screenshot_bytes = get_screenshot(page)
        screenshot_base64 = base64.b64encode(screenshot_bytes).decode("utf-8")

        print("Sending initial request to the model...")
        initial_response = client.responses.create(
            model="computer-use-preview",
            tools=[{
                "type": "computer_use_preview",
                "display_width": 1024,
                "display_height": 768,
                "environment": "browser"
            }],
            input=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": user_prompt
                        },
                        {
                            "type": "input_image",
                            "image_url": f"data:image/png;base64,{screenshot_base64}"
                        }
                    ]
                }
            ],
            reasoning={
                "summary": "concise",
            },
            truncation="auto"
        )

        print("Starting the CUA loop...")
        computer_use_loop(page, initial_response)

        print("Task finished. Closing browser.")
        browser.close()

if __name__ == "__main__":
    main()
