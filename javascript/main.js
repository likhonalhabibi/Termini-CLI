import OpenAI from 'openai';
import { chromium } from 'playwright';
import { computerUseLoop, getScreenshot } from './cua_loop.js';
import { Buffer } from 'buffer';

// It's recommended to set the API key as an environment variable
// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// For this example, I'll assume it's set in the environment
const client = new OpenAI();

async function main() {
    /**
     * Main function to initialize the browser, send the initial request,
     * and start the computer-using agent loop.
     */
    const userPrompt = "Navigate to bing.com and search for the latest news on OpenAI.";

    const browser = await chromium.launch({
        headless: false,
        chromiumSandbox: true,
        env: {},
        args: [
            "--disable-extensions",
            "--disable-file-system"
        ]
    });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("https://www.google.com"); // Start at a blank page

    console.log("Capturing initial screenshot...");
    const screenshotBytes = await getScreenshot(page);
    const screenshotBase64 = Buffer.from(screenshotBytes).toString("base64");

    console.log("Sending initial request to the model...");
    const initialResponse = await client.responses.create({
        model: "computer-use-preview",
        tools: [{
            type: "computer_use_preview",
            display_width: 1024,
            display_height: 768,
            environment: "browser"
        }],
        input: [
            {
                role: "user",
                content: [
                    {
                        type: "input_text",
                        text: userPrompt
                    },
                    {
                        type: "input_image",
                        image_url: `data:image/png;base64,${screenshotBase64}`
                    }
                ]
            }
        ],
        reasoning: {
            summary: "concise",
        },
        truncation: "auto"
    });

    console.log("Starting the CUA loop...");
    await computerUseLoop(page, initialResponse);

    console.log("Task finished. Closing browser.");
    await browser.close();
}

main();
