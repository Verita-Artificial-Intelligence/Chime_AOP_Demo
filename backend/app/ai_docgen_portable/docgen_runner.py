import argparse
import os
from pathlib import Path
from screendoc import StepDetector, DocumentationGenerator

def generate_documentation_from_video(
    video_path: str = "input.mp4",
    output_format: str = "pdf",
    output_dir: str = "output",
    screenshots_dir: str = "screenshots",
    similarity_threshold: float = 0.95,
    min_time_between_steps: float = 0.1,
    timestamps: list = None
):
    print(f"[INFO] Starting documentation generation for video: {video_path}")
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    Path(screenshots_dir).mkdir(parents=True, exist_ok=True)

    print("[INFO] Detecting steps in the video...")
    detector = StepDetector(similarity_threshold, min_time_between_steps)
    if timestamps is None:
        import cv2
        cap = cv2.VideoCapture(video_path)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        timestamps = [i / fps for i in range(frame_count)]
        cap.release()
    steps = detector.detect_steps(video_path, timestamps)
    print(f"[INFO] Detected {len(steps)} steps.")

    print("[INFO] Saving screenshots for each step...")
    screenshot_paths = detector.save_screenshots(steps, screenshots_dir)
    print(f"[INFO] Saved screenshots to: {screenshots_dir}")

    print(f"[INFO] Generating documentation in {output_format.upper()} format...")
    generator = DocumentationGenerator()
    doc_path = generator.generate_documentation(
        steps, screenshot_paths, output_format
    )
    doc_path_obj = Path(doc_path)
    if str(doc_path_obj.parent) != str(Path(output_dir).resolve()):
        target_path = Path(output_dir) / doc_path_obj.name
        os.replace(str(doc_path_obj), str(target_path))
        doc_path = str(target_path)
    print(f"[SUCCESS] Documentation generated at: {doc_path}")
    return doc_path
