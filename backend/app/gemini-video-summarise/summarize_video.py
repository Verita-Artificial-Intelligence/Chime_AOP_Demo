import os
import sys
import json
import time
import argparse
import logging
import google.generativeai as genai
from tqdm import tqdm

# --- Setup Logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def analyze_video(video_path: str, api_key: str, output_dir: str):
    """
    Analyzes a video to extract UI steps and generate a summary and JSON output.

    Args:
        video_path: The full path to the video file.
        api_key: The Google API key.
        output_dir: The directory to save the output files.
    """
    logging.info("Starting video analysis process.")
    if not api_key:
        api_key = "AIzaSyCo5ZJzGB-YqFaKERjXws5WtCNYxEtvIGM"
        logging.error("GOOGLE_API_KEY not provided.")
        sys.exit(1)

    # Mask parts of the API key for logging
    logging.info(f"Using API Key: {api_key[:4]}...{api_key[-4:]}")
    genai.configure(api_key=api_key)

    if not os.path.exists(video_path):
        logging.error(f"Video file not found at '{video_path}'")
        sys.exit(1)

    video_size = os.path.getsize(video_path) / (1024 * 1024)
    logging.info(f"Video file found: {video_path} (Size: {video_size:.2f} MB)")

    logging.info("Uploading file to Google AI...")
    video_file = genai.upload_file(path=video_path)
    logging.info(f"File upload initiated. File name: {video_file.name}, State: {video_file.state.name}")

    # Poll for status to see when the video is ready
    with tqdm(total=100, desc="Processing video") as pbar:
        while video_file.state.name == "PROCESSING":
            pbar.set_description(f"Processing video (State: {video_file.state.name})")
            # Simple progress simulation, real progress is not available from the API
            pbar.update(5)
            time.sleep(5)
            video_file = genai.get_file(video_file.name)
        pbar.n = 100 # Fill the bar
        pbar.set_description(f"Processing complete (State: {video_file.state.name})")
        pbar.refresh()

    logging.info(f"Final video state: {video_file.state.name}")
    if video_file.state.name == "FAILED":
        logging.error("Video processing failed.")
        logging.error(video_file.state)
        sys.exit(1)

    logging.info(f"Video '{video_file.display_name}' is ready for use.")

    prompt = """
    Please analyze this screen recording video carefully.
    Your task is to identify every user interaction with the UI. This includes clicks on buttons, typing into text fields, selecting options from dropdowns, interacting with data tables, etc.

    Provide two outputs:
    1. A clear, step-by-step text summary describing the actions taken by the user.
    2. A JSON object that represents these actions, which can be used for automation.

    The JSON output must be an array of objects, where each object has the following keys:
    - "step": An integer representing the sequence number of the action (starting from 1).
    - "action": The type of action (e.g., "click", "type", "select").
    - "element_description": A detailed text description of the UI element being interacted with (e.g., "The 'Login' button with a blue background", "The search input field labeled 'Username'").
    - "element_type": The type of UI element (e.g., "button", "textfield", "selector", "datatable").
    - "value": (Optional) If the action is "type", this should be the text that was entered. For other actions, this can be omitted.

    Enclose the JSON object within ```json ... ``` tags.
    """

    model_name = "gemini-2.5-pro"
    logging.info(f"Using model: {model_name}")
    model = genai.GenerativeModel(model_name=model_name)

    logging.info("Sending request to Gemini for content generation...")
    response = model.generate_content([prompt, video_file])
    logging.info("Received response from Gemini.")

    try:
        full_response_text = response.text
        logging.info("Attempting to parse JSON from the response.")
        
        # Extract JSON from the response
        json_str_match = full_response_text.split("```json")
        if len(json_str_match) > 1:
            json_str = json_str_match[1].split("```")[0].strip()
            action_json = json.loads(json_str)
            logging.info("Successfully parsed JSON.")
            
            # Extract the summary text (everything before the JSON)
            summary_text = json_str_match[0].strip()

            # Create output directory if it doesn't exist
            os.makedirs(output_dir, exist_ok=True)

            # --- Create output file paths ---
            base_filename = os.path.splitext(os.path.basename(video_path))[0]
            summary_filepath = os.path.join(output_dir, f"{base_filename}_summary.txt")
            json_filepath = os.path.join(output_dir, f"{base_filename}_actions.json")

            # --- Write Summary to .txt file ---
            logging.info(f"Writing summary to {summary_filepath}")
            with open(summary_filepath, "w") as f:
                f.write(summary_text)
            print(f"\nSummary saved to: {summary_filepath}")


            # --- Write JSON to .json file ---
            logging.info(f"Writing JSON actions to {json_filepath}")
            with open(json_filepath, "w") as f:
                json.dump(action_json, f, indent=2)
            print(f"JSON actions saved to: {json_filepath}")

        else:
            logging.warning("Could not find JSON in the model's response. Printing the full response instead.")
            print(full_response_text)

    except (json.JSONDecodeError, IndexError) as e:
        logging.error(f"Error parsing the model's response: {e}")
        logging.error("--- Full Raw Response ---")
        logging.error(response.text)
    
    logging.info("Video analysis process finished.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze a video to extract UI steps.")
    parser.add_argument("video_path", help="The full path to the video file.")
    parser.add_argument("--api-key", help="Your Google API Key.", required=True)
    parser.add_argument("--output-dir", help="Directory to save output files.", default=".")
    args = parser.parse_args()

    analyze_video(args.video_path, args.api_key, args.output_dir) 