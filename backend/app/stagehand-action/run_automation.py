import asyncio
import json
import os
from dotenv import load_dotenv
from stagehand import Stagehand, StagehandConfig

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
ACTIONS_FILE = 'video1_actions.json'
START_URL = 'https://chimetools.vercel.app/'

def get_natural_language_action(action_details: dict) -> str:
    """Converts a structured action from JSON into a natural language command for Stagehand."""
    action = action_details['action']
    description = action_details['element_description']
    value = action_details.get('value')

    # Clean up the description to be more command-like
    description = description.replace("The ", "").replace(".", "").strip()

    if action == "click":
        return f"Click on {description}"
    elif action == "type":
        return f"Type '{value}' into {description}"
    elif action == "select":
        return f"Select the option '{value}' in {description}"
    else:
        return f"Perform action '{action}' on {description}"


async def run_automation():
    """
    Runs the browser automation task using Stagehand.
    """
    try:
        with open(ACTIONS_FILE, 'r') as f:
            actions = json.load(f)
    except FileNotFoundError:
        print(f"Error: The actions file '{ACTIONS_FILE}' was not found.")
        return

    # Configure Stagehand.
    # It requires BROWSERBASE_API_KEY, BROWSERBASE_PROJECT_ID, and MODEL_API_KEY from your .env file.
    config = StagehandConfig(
        api_key=os.getenv("BROWSERBASE_API_KEY"),
        project_id=os.getenv("BROWSERBASE_PROJECT_ID"),
        model_api_key=os.getenv("MODEL_API_KEY"),
    )

    # Initialize Stagehand
    stagehand = Stagehand(config)
    await stagehand.init()
    print(f"Stagehand session created: {stagehand.session_id}")

    page = stagehand.page
    await page.goto(START_URL)

    print(f"Navigated to {START_URL}")

    for action_details in actions:
        step = action_details['step']
        instruction = get_natural_language_action(action_details)

        print(f"--- Step {step}: {instruction} ---")

        try:
            # Use Stagehand's `act` method to perform the action
            await page.act(instruction)
            print(f"SUCCESS: Executed instruction.")
        except Exception as e:
            print(f"ERROR: Could not perform instruction for step {step}. Reason: {e}")

    print("\n--- Automation Finished ---")
    await stagehand.close()


if __name__ == "__main__":
    asyncio.run(run_automation()) 