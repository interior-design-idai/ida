"""
RunPod Serverless Handler for ComfyUI
Receives workflow JSON from IDA API, runs it on ComfyUI, returns generated images.
"""

import runpod
import json
import urllib.request
import urllib.parse
import time
import base64
import subprocess
import threading
import os

COMFYUI_HOST = "127.0.0.1:8188"


def start_comfyui():
    """Start ComfyUI server in background."""
    subprocess.Popen(
        ["python3", "main.py", "--listen", "0.0.0.0", "--port", "8188"],
        cwd="/app/ComfyUI",
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def wait_for_comfyui(timeout=60):
    """Wait until ComfyUI server is ready."""
    start = time.time()
    while time.time() - start < timeout:
        try:
            req = urllib.request.urlopen(f"http://{COMFYUI_HOST}/system_stats")
            if req.status == 200:
                return True
        except Exception:
            time.sleep(1)
    raise RuntimeError("ComfyUI failed to start")


def queue_prompt(workflow: dict) -> str:
    """Submit a workflow to ComfyUI and return the prompt_id."""
    data = json.dumps({"prompt": workflow}).encode("utf-8")
    req = urllib.request.Request(
        f"http://{COMFYUI_HOST}/prompt",
        data=data,
        headers={"Content-Type": "application/json"},
    )
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    return result["prompt_id"]


def poll_completion(prompt_id: str, timeout=120) -> dict:
    """Poll ComfyUI until the prompt completes."""
    start = time.time()
    while time.time() - start < timeout:
        req = urllib.request.urlopen(f"http://{COMFYUI_HOST}/history/{prompt_id}")
        history = json.loads(req.read())

        if prompt_id in history:
            return history[prompt_id]

        time.sleep(1)

    raise RuntimeError(f"Prompt {prompt_id} timed out after {timeout}s")


def get_images(history: dict) -> list[str]:
    """Extract generated images from ComfyUI history as base64 strings."""
    images = []
    outputs = history.get("outputs", {})

    for node_id, node_output in outputs.items():
        if "images" in node_output:
            for img_info in node_output["images"]:
                filename = img_info["filename"]
                subfolder = img_info.get("subfolder", "")
                folder_type = img_info.get("type", "output")

                params = urllib.parse.urlencode({
                    "filename": filename,
                    "subfolder": subfolder,
                    "type": folder_type,
                })
                req = urllib.request.urlopen(
                    f"http://{COMFYUI_HOST}/view?{params}"
                )
                img_data = req.read()
                images.append(base64.b64encode(img_data).decode("utf-8"))

    return images


def handler(job: dict) -> dict:
    """RunPod serverless handler."""
    job_input = job.get("input", {})
    workflow = job_input.get("workflow")

    if not workflow:
        return {"error": "No workflow provided"}

    try:
        # Submit workflow
        prompt_id = queue_prompt(workflow)

        # Wait for completion
        history = poll_completion(prompt_id)

        # Extract images
        images = get_images(history)

        if not images:
            return {"error": "No images generated", "status": "FAILED"}

        return {
            "images": images,
            "status": "COMPLETED",
            "prompt_id": prompt_id,
        }

    except Exception as e:
        return {"error": str(e), "status": "FAILED"}


# Start ComfyUI when container launches
print("Starting ComfyUI server...")
start_comfyui()
wait_for_comfyui()
print("ComfyUI ready. Starting RunPod handler...")

runpod.serverless.start({"handler": handler})
