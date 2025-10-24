import OpenAI from "openai";
const openai = new OpenAI();

async function handleModelAction(page, action) {
  // Given a computer action (e.g., click, double_click, scroll, etc.),
  // execute the corresponding operation on the Playwright page.

  const actionType = action.type;

  try {
    switch (actionType) {
      case "click": {
        const { x, y, button = "left" } = action;
        console.log(`Action: click at (${x}, ${y}) with button '${button}'`);
        await page.mouse.click(x, y, { button });
        break;
      }

      case "scroll": {
        const { x, y, scrollX, scrollY } = action;
        console.log(
          `Action: scroll at (${x}, ${y}) with offsets (scrollX=${scrollX}, scrollY=${scrollY})`
        );
        await page.mouse.move(x, y);
        await page.evaluate(`window.scrollBy(${scrollX}, ${scrollY})`);
        break;
      }

      case "keypress": {
        const { keys } = action;
        for (const k of keys) {
          console.log(`Action: keypress '${k}'`);
          // A simple mapping for common keys; expand as needed.
          if (k.includes("ENTER")) {
            await page.keyboard.press("Enter");
          } else if (k.includes("SPACE")) {
            await page.keyboard.press(" ");
          } else {
            await page.keyboard.press(k);
          }
        }
        break;
      }

      case "type": {
        const { text } = action;
        console.log(`Action: type text '${text}'`);
        await page.keyboard.type(text);
        break;
      }

      case "wait": {
        console.log(`Action: wait`);
        await page.waitForTimeout(2000);
        break;
      }

      case "screenshot": {
        // Nothing to do as screenshot is taken at each turn
        console.log(`Action: screenshot`);
        break;
      }

      // Handle other actions here

      default:
        console.log("Unrecognized action:", action);
    }
  } catch (e) {
    console.error("Error handling action", action, ":", e);
  }
}

async function getScreenshot(page) {
    // Take a full-page screenshot using Playwright and return the image bytes.
    return await page.screenshot();
}


async function computerUseLoop(instance, response) {
  /**
   * Run the loop that executes computer actions until no 'computer_call' is found.
   */
  while (true) {
    const computerCalls = response.output.filter(
      (item) => item.type === "computer_call"
    );
    if (computerCalls.length === 0) {
      console.log("No computer call found. Output from model:");
      response.output.forEach((item) => {
        console.log(JSON.stringify(item, null, 2));
      });
      break; // Exit when no computer calls are issued.
    }

    // We expect at most one computer call per response.
    const computerCall = computerCalls[0];
    const lastCallId = computerCall.call_id;
    const action = computerCall.action;

    // Execute the action (function defined in step 3)
    handleModelAction(instance, action);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Allow time for changes to take effect.

    // Take a screenshot after the action (function defined in step 4)
    const screenshotBytes = await getScreenshot(instance);
    const screenshotBase64 = Buffer.from(screenshotBytes).toString("base64");

    // Send the screenshot back as a computer_call_output
    response = await openai.responses.create({
      model: "computer-use-preview",
      previous_response_id: response.id,
      tools: [
        {
          type: "computer_use_preview",
          display_width: 1024,
          display_height: 768,
          environment: "browser",
        },
      ],
      input: [
        {
          call_id: lastCallId,
          type: "computer_call_output",
          output: {
            type: "input_image",
            image_url: `data:image/png;base64,${screenshotBase64}`,
          },
        },
      ],
      truncation: "auto",
    });
  }

  return response;
}
